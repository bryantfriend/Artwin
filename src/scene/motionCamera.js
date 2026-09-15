import {Euler,Quaternion,Vector3,MathUtils} from 'three';

// Device axes -> camera axes. Sensor heading is relative; no compass is needed.
const rearCamera=new Quaternion(-Math.SQRT1_2,0,0,Math.SQRT1_2);
const zAxis=new Vector3(0,0,1);
export function createMotionCamera() {
  const euler=new Euler(),target=new Quaternion(),smooth=new Quaternion(),screen=new Quaternion(),forward=new Vector3();
  let revision=null,previousYaw=0,previousPitch=0;
  function angles() {
    forward.set(0,0,-1).applyQuaternion(smooth);
    // Keep a stable heading when the phone points almost straight up or down.
    return {yaw:Math.hypot(forward.x,forward.z)>.025?Math.atan2(-forward.x,-forward.z):previousYaw,
      pitch:Math.asin(MathUtils.clamp(forward.y,-1,1))};
  }
  function reset(){revision=null;}
  function update(sample,input,dt,enabled=true) {
    if(!enabled || !sample){reset();return;}
    const {alpha,beta,gamma,screenAngle}=sample;
    euler.set(MathUtils.degToRad(beta),MathUtils.degToRad(alpha),-MathUtils.degToRad(gamma),'YXZ');
    target.setFromEuler(euler).multiply(rearCamera).multiply(screen.setFromAxisAngle(zAxis,-MathUtils.degToRad(screenAngle)));
    if(revision!==sample.revision){
      revision=sample.revision;smooth.copy(target);
      const a=angles();previousYaw=a.yaw;previousPitch=a.pitch;return;
    }
    smooth.slerp(target,1-Math.exp(-18*Math.min(Math.max(dt,0),.1)));
    const a=angles(),delta=a.yaw-previousYaw;
    // Add only sensor movement: touch/mouse adjustments remain intact.
    input.yaw+=Math.atan2(Math.sin(delta),Math.cos(delta));
    input.pitch=MathUtils.clamp(input.pitch+a.pitch-previousPitch,-1.3,1.3);
    previousYaw=a.yaw;previousPitch=a.pitch;
  }
  return {update,reset};
}
