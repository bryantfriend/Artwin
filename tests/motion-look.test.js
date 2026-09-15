import test from 'node:test';
import assert from 'node:assert/strict';
import {canOfferMotion,createOrientationSession,validOrientation} from '../src/deviceOrientation.js';
import {createMotionCamera} from '../src/scene/motionCamera.js';
import {viewerMessages} from '../src/locales/viewer.js';
import {readFileSync} from 'node:fs';

const radians=degrees=>degrees*Math.PI/180;
const close=(a,b,tolerance=1e-5)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const sample=(alpha=0,beta=90,gamma=0,screenAngle=0,revision=0)=>({alpha,beta,gamma,screenAngle,revision});
function settle(camera,reading,input){for(let n=0;n<90;n++)camera.update(reading,input,1/60);}

test('motion starts relative to the current view and preserves independent swipes',()=>{
  const camera=createMotionCamera(),input={yaw:2,pitch:.2};
  camera.update(sample(130),input,1/60);assert.deepEqual(input,{yaw:2,pitch:.2});
  settle(camera,sample(160,105),input);close(input.yaw,2+radians(30));close(input.pitch,.2+radians(15));
  input.yaw-=.6;input.pitch-=.3;
  settle(camera,sample(160,105),input);close(input.yaw,2+radians(30)-.6);close(input.pitch,.2+radians(15)-.3);
  settle(camera,sample(170,95),input);close(input.yaw,2+radians(40)-.6);close(input.pitch,.2+radians(5)-.3);
});
test('motion follows the short path across north and smooths a sensor step',()=>{
  const camera=createMotionCamera(),input={yaw:0,pitch:0};
  camera.update(sample(359),input,1/60);camera.update(sample(1),input,1/60);
  assert(input.yaw>0&&input.yaw<radians(2));
  settle(camera,sample(1),input);close(input.yaw,radians(2));
});
test('portrait and landscape movements look in the same direction with a level horizon',()=>{
  for(const [baseline,turned] of [[sample(),sample(30,100)],[sample(90,0,-90,90),sample(120,0,-80,90)]]){
    const camera=createMotionCamera(),input={yaw:0,pitch:0};
    camera.update(baseline,input,1/60);settle(camera,turned,input);
    close(input.yaw,radians(30));close(input.pitch,-(baseline.screenAngle?1:-1)*radians(10));
    assert.equal(input.roll,undefined);
  }
});
test('recalibration, room travel, pause and screen rotation do not jump the camera',()=>{
  const camera=createMotionCamera(),input={yaw:.6,pitch:.3};
  camera.update(sample(),input,1/60);
  camera.update(sample(120),input,1/60,false);camera.update(sample(180),input,1/60);
  assert.deepEqual(input,{yaw:.6,pitch:.3});
  camera.update(sample(90,0,-90,90,1),input,1/60);assert.deepEqual(input,{yaw:.6,pitch:.3});
  camera.reset();input.yaw=-2;input.pitch=0;
  camera.update(sample(40),input,1/60);assert.deepEqual(input,{yaw:-2,pitch:0});
});
test('near-vertical phone positions remain finite and camera pitch stays comfortable',()=>{
  const camera=createMotionCamera(),input={yaw:0,pitch:1.29};
  camera.update(sample(),input,1/60);
  for(const beta of [160,179,180,179,150,90,30,1,0,1,30,90]){
    settle(camera,sample(20,beta),input);
    assert(Number.isFinite(input.yaw));assert(Number.isFinite(input.pitch));assert(Math.abs(input.pitch)<=1.3);
  }
});

function environment(permission) {
  const target=new EventTarget(),document=new EventTarget(),screen=new EventTarget(),timers=new Map();let timerId=0;
  Object.assign(document,{hidden:false});Object.assign(screen,{angle:0});
  Object.assign(target,{isSecureContext:true,document,screen:{orientation:screen},navigator:{maxTouchPoints:1},
    DeviceOrientationEvent:permission?{requestPermission:permission}:{},setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)});
  return {target,document,timers,emit:(values={alpha:0,beta:90,gamma:0})=>target.dispatchEvent(Object.assign(new Event('deviceorientation'),values)),expire:()=>{for(const fn of [...timers.values()])fn();}};
}
test('motion is offered only to touch devices with a secure orientation API',()=>{
  const {target}=environment();assert(canOfferMotion(target));
  target.isSecureContext=false;assert(!canOfferMotion(target));target.isSecureContext=true;
  target.DeviceOrientationEvent=undefined;assert(!canOfferMotion(target));target.DeviceOrientationEvent={};
  target.navigator.maxTouchPoints=0;assert(!canOfferMotion(target));
  for(const event of [{alpha:null,beta:90,gamma:0},{alpha:0,beta:NaN,gamma:0},{alpha:0,beta:90,gamma:Infinity}])assert(!validOrientation(event));
});
test('permission is requested on start and only valid sensor data activates motion',async()=>{
  let requested=0;const env=environment(()=>{requested++;return Promise.resolve('granted');}),statuses=[];
  const session=createOrientationSession(env.target,s=>statuses.push(s));
  env.emit();assert.equal(session.sample,null);assert.equal(requested,0);
  const pending=session.start();assert.equal(requested,1);await pending;
  assert.equal(session.status,'requesting');env.emit({alpha:null,beta:null,gamma:null});assert.equal(session.sample,null);
  env.emit();assert.equal(session.status,'active');assert.equal(env.timers.size,0);
  session.stop();env.emit();assert.equal(session.sample,null);assert.equal(session.status,'off');
  assert.deepEqual(statuses,['requesting','active','off']);
});
test('permission denial, rejection and missing sensor readings retain a safe fallback',async()=>{
  for(const permission of [()=>Promise.resolve('denied'),()=>Promise.reject(new Error('blocked'))]){
    const env=environment(permission),session=createOrientationSession(env.target);await session.start();env.emit();
    assert.equal(session.status,'denied');assert.equal(session.sample,null);assert.equal(env.timers.size,0);
  }
  const env=environment(),session=createOrientationSession(env.target);await session.start();env.expire();
  assert.equal(session.status,'unavailable');env.emit();assert.equal(session.sample,null);
  await session.start();env.emit();assert.equal(session.status,'active');session.stop();
});
test('a late permission response cannot restart motion after the user leaves',async()=>{
  let resolve;const env=environment(()=>new Promise(r=>{resolve=r;})),session=createOrientationSession(env.target);
  const pending=session.start();session.stop();resolve('granted');await pending;env.emit();
  assert.equal(session.status,'off');assert.equal(session.sample,null);assert.equal(env.timers.size,0);
});
test('hidden pages stop sampling and screen rotation requires a fresh baseline',async()=>{
  const env=environment(),session=createOrientationSession(env.target);await session.start();env.emit();
  const revision=session.sample.revision;
  env.target.screen.orientation.angle=90;env.target.screen.orientation.dispatchEvent(new Event('change'));
  assert.equal(session.sample,null);env.emit();assert(session.sample.revision>revision);assert.equal(session.sample.screenAngle,90);
  env.document.hidden=true;env.document.dispatchEvent(new Event('visibilitychange'));env.emit();assert.equal(session.sample,null);assert.equal(env.timers.size,0);
  env.document.hidden=false;env.document.dispatchEvent(new Event('visibilitychange'));env.emit();assert(session.sample);
  session.stop();env.document.dispatchEvent(new Event('visibilitychange'));env.emit();assert.equal(session.sample,null);assert.equal(env.timers.size,0);
});
test('motion controls and feedback are localized in all supported languages',()=>{
  const sources=['../src/ui/useMotionControl.js','../src/ui/MotionControls.jsx'];
  for(const path of sources){
    const source=readFileSync(new URL(path,import.meta.url),'utf8');
    for(const [literal] of source.matchAll(/'(?:[^'\\]|\\.)*'/g)){
      const key=literal.slice(1,-1);
      if(!/[A-Z]/.test(key[0]))continue;
      assert.equal(viewerMessages[key]?.length,3,`Missing motion translation: ${key}`);
    }
  }
});
