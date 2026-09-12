import { APARTMENT } from './apartmentConfig.js';

export function clearInput(input) {
  input.keys.clear();input.move.x=0;input.move.z=0;input.drag=null;
}
export function createInput() {
  return {keys:new Set(),move:{x:0,z:0},yaw:APARTMENT.entrance.yaw,pitch:0,drag:null,paused:false};
}
