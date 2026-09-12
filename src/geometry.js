import { APARTMENT, rooms } from './apartmentConfig.js';

export function wallSegments(wall) {
  const result = [];
  function add(from, length, bottom, height) {
    if (length <= 0 || height <= 0) return;
    result.push({
      position: wall.axis === 'x' ? [wall.start[0]+from+length/2,bottom+height/2,wall.start[1]] : [wall.start[0],bottom+height/2,wall.start[1]+from+length/2],
      size: wall.axis === 'x' ? [length,height,.16] : [.16,height,length],
    });
  }
  let end = 0;
  for (const o of [...(wall.openings || [])].sort((a,b) => a.at-b.at)) {
    add(end,o.at-end,0,APARTMENT.ceiling);
    const top = o.kind === 'window' ? 2.35 : 2.2;
    if (o.kind === 'window') add(o.at,o.width,0,.85);
    add(o.at,o.width,top,APARTMENT.ceiling-top);
    end = o.at+o.width;
  }
  add(end,wall.length-end,0,APARTMENT.ceiling);
  return result;
}
export function pointInPolygon(x,z,polygon) {
  let inside = false;
  for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [xi,zi]=polygon[i], [xj,zj]=polygon[j];
    if ((zi>z)!==(zj>z) && x < (xj-xi)*(z-zi)/(zj-zi)+xi) inside=!inside;
  }
  return inside;
}
export function roomAt(x,z) { return rooms.find(r => pointInPolygon(x,z,r.polygon))?.id || 'hall'; }
export function normalizedMovement(x,z,yaw,speed=APARTMENT.speed) {
  const length = Math.hypot(x,z);
  const scale = length > 0 ? speed/Math.max(1,length) : 0;
  return { x:(x*Math.cos(yaw)+z*Math.sin(yaw))*scale, z:(z*Math.cos(yaw)-x*Math.sin(yaw))*scale };
}
export function doorPose(door,angle) {
  const yaw = door.baseAngle+angle;
  return { yaw, x:door.hinge[0]+Math.cos(yaw)*door.width/2, z:door.hinge[1]-Math.sin(yaw)*door.width/2 };
}
export function circleIntersectsBox(x,z,radius,box) {
  const dx=x-box.x, dz=z-box.z, yaw=box.yaw || 0;
  const lx=dx*Math.cos(yaw)-dz*Math.sin(yaw), lz=dx*Math.sin(yaw)+dz*Math.cos(yaw);
  return Math.hypot(Math.max(Math.abs(lx)-box.width/2,0),Math.max(Math.abs(lz)-box.depth/2,0)) < radius;
}
export function doorSweepBlocked(door,from,to,player) {
  if (!player) return false;
  // Sample the small per-tick rotation, including the starting pose.
  for (let i=0;i<=4;i++) {
    const pose=doorPose(door,from+(to-from)*i/4);
    if (circleIntersectsBox(player.x,player.z,APARTMENT.playerRadius+.06,{...pose,width:door.width,depth:.07})) return true;
  }
  return false;
}
