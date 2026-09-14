// One unit = one metre. +X is plan-right, +Z is plan-down, +Y is up.
// Polygon coordinates follow the supplied 2D plan, not the rotated render.
// All dimensions are reconstruction estimates; advertised area is independent.
export const APARTMENT = {
  advertisedArea: '134.68', ceiling: 2.7, eyeHeight: 1.65,
  speed: 1.5, playerRadius: 0.25, playerHalfHeight: 0.55,
  playerCenterHeight: 0.82, interactionDistance: 2.1,
  entrance: { position: [5.65, 0.82, 6.7], yaw: Math.PI / 2 },
  overview: { position: [25, 22, -3], target: [4.8, .5, 7.4] },
};
const rect = (x, z, w, d) => [[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
export const rooms = [
  { id: 'living', name: 'Living room', short: 'Living', subtitle: 'Room to come together', type: 'wood', polygon: rect(6.4,8.1,3.4,7.7), destination: [7.4,0.82,10.8], yaw: Math.PI, label: [8.1,12.6] },
  { id: 'kitchen', name: 'Kitchen & dining', short: 'Kitchen', subtitle: 'Everyday rituals, beautifully framed', type: 'stone', polygon: rect(3.4,0,3,5.5), destination: [4.65,0.82,4.6], yaw: 0, label: [4.9,2.8] },
  { id: 'primary', name: 'Primary bedroom', short: 'Primary', subtitle: 'A quieter kind of luxury', type: 'wood', polygon: rect(0,9.4,3.4,5.6), destination: [2.65,0.82,10.25], yaw: Math.PI, label: [1.7,12.7] },
  { id: 'bedroom2', name: 'Bedroom 02', short: 'Bedroom 02', subtitle: 'A soft place to land', type: 'wood', polygon: [[0,0],[3.4,0],[3.4,5.5],[2,5.5],[2,3.8],[0,3.8]], destination: [2.65,0.82,3.2], yaw: Math.PI / 2, label: [1.7,1.9] },
  { id: 'bedroom3', name: 'Bedroom 03', short: 'Bedroom 03', subtitle: 'Make room for possibility', type: 'wood', polygon: rect(3.4,10,3,5), destination: [5.65,0.82,10.9], yaw: Math.PI, label: [4.9,12.7] },
  { id: 'hall', name: 'Entrance hall', short: 'Hall', subtitle: 'Welcome to your next chapter', type: 'wood', polygon: [[2,5.5],[6.4,5.5],[6.4,10],[3.4,10],[3.4,9.4],[2,9.4]], destination: APARTMENT.entrance.position, yaw: APARTMENT.entrance.yaw, label: [4.4,7.5] },
  { id: 'bath1', name: 'En suite', short: 'En suite', subtitle: 'A moment of calm', type: 'stone', polygon: rect(0,3.8,2,1.7), destination: [1.45,0.82,4.75], yaw: Math.PI / 2, label: [1,4.65] },
  { id: 'bath2', name: 'Guest bathroom', short: 'Bath 02', subtitle: 'Considered details', type: 'stone', polygon: rect(0,5.5,2,2), destination: [1.45,0.82,6.45], yaw: Math.PI / 2, label: [1,6.5] },
  { id: 'bath3', name: 'Bathroom', short: 'Bath 03', subtitle: 'A private retreat', type: 'stone', polygon: rect(0,7.5,2,1.9), destination: [1.3,0.82,8.35], yaw: Math.PI / 2, label: [1,8.45] },
  { id: 'loggia1', name: 'Kitchen loggia', short: 'Loggia', subtitle: 'A little closer to outside', type: 'stone', polygon: rect(3.4,-1.2,3,1.2), destination: [4.8,0.82,-0.6], yaw: 0, label: [4.9,-0.6] },
  { id: 'loggia2', name: 'Bedroom loggia', short: 'Loggia', subtitle: 'Light, air, a slower morning', type: 'stone', polygon: rect(3.4,15,3,1.1), destination: [4.8,0.82,15.55], yaw: Math.PI, label: [4.9,15.55] },
];

// A wall's opening offsets run from its start along +X or +Z.
// Single definitions drive visible segments AND full-height collision segments.
export const walls = [
  { id:'west', axis:'z', start:[0,0], length:15, exterior:true, tall:true },
  { id:'north-bed', axis:'x', start:[0,0], length:3.4, exterior:true, tall:true, openings:[{at:.55,width:2.2,kind:'window'}] },
  { id:'balcony-north-west', axis:'z', start:[3.4,-1.2], length:1.2, exterior:true, tall:true },
  { id:'balcony-north', axis:'x', start:[3.4,-1.2], length:3, exterior:true, tall:true, openings:[{at:.15,width:2.7,kind:'window'}] },
  { id:'east-kitchen', axis:'z', start:[6.4,-1.2], length:9.3, exterior:true, openings:[{at:2.2,width:2.2,kind:'window'},{at:7.4,width:1.05,kind:'entrance'}] },
  { id:'living-north', axis:'x', start:[6.4,8.1], length:3.4, exterior:true },
  { id:'living-east', axis:'z', start:[9.8,8.1], length:7.7, exterior:true, openings:[{at:2.2,width:2.3,kind:'window'}] },
  { id:'living-south', axis:'x', start:[6.4,15.8], length:3.4, exterior:true, openings:[{at:.45,width:2.5,kind:'window'}] },
  { id:'balcony-south-east', axis:'z', start:[6.4,15.8], length:.3, exterior:true },
  { id:'balcony-south', axis:'x', start:[3.4,16.1], length:3, exterior:true, openings:[{at:.15,width:2.7,kind:'window'}] },
  { id:'balcony-south-west', axis:'z', start:[3.4,15], length:1.1, exterior:true },
  { id:'primary-south', axis:'x', start:[0,15], length:3.4, exterior:true, openings:[{at:.6,width:2.2,kind:'window'}] },
  { id:'bed-kitchen', axis:'z', start:[3.4,0], length:5.5 },
  { id:'north-hall', axis:'x', start:[0,5.5], length:6.4, openings:[{at:2.3,width:.9,kind:'door',id:'bedroom2-door',name:'Bedroom 02 door',swing:1},{at:4.3,width:1,kind:'door',id:'kitchen-door',name:'Kitchen door',swing:-1}] },
  { id:'ensuite-north', axis:'x', start:[0,3.8], length:2 },
  { id:'baths-east', axis:'z', start:[2,3.8], length:5.6, openings:[{at:.45,width:.9,kind:'door',id:'bath1-door',name:'En suite door',swing:-1},{at:2.15,width:.9,kind:'door',id:'bath2-door',name:'Guest bathroom door',swing:-1},{at:4.15,width:.9,kind:'door',id:'bath3-door',name:'Bathroom door',swing:-1}] },
  { id:'baths-middle', axis:'x', start:[0,7.5], length:2 },
  { id:'primary-north', axis:'x', start:[0,9.4], length:3.4, openings:[{at:2.3,width:.9,kind:'door',id:'primary-door',name:'Primary bedroom door',swing:1}] },
  { id:'primary-east', axis:'z', start:[3.4,9.4], length:5.6 },
  { id:'bedroom3-north', axis:'x', start:[3.4,10], length:3, openings:[{at:.9,width:1,kind:'door',id:'bedroom3-door',name:'Bedroom 03 door',swing:1}] },
  { id:'living-west', axis:'z', start:[6.4,8.1], length:7.7, openings:[{at:.35,width:1.3,kind:'passage'}] },
  { id:'kitchen-loggia', axis:'x', start:[3.4,0], length:3, openings:[{at:.9,width:1,kind:'door',id:'loggia1-door',name:'Kitchen loggia door',swing:1}] },
  { id:'bedroom-loggia', axis:'x', start:[3.4,15], length:3, openings:[{at:.9,width:1,kind:'door',id:'loggia2-door',name:'Bedroom loggia door',swing:-1}] },
];

export const doors = walls.flatMap(wall => (wall.openings || []).filter(o => o.kind === 'door').map(o => ({
  ...o, hinge: wall.axis === 'x' ? [wall.start[0]+o.at,wall.start[1]] : [wall.start[0],wall.start[1]+o.at],
  baseAngle: wall.axis === 'x' ? 0 : -Math.PI/2,
})));

// Furniture models use local coordinates with a shared footprint for collisions.
export const furniture = [
  {id:'bed-north',kind:'bed',position:[1.4,0,1.55],rotation:Math.PI/2,size:[1.8,1.05,2.25],color:'taupe'},
  {id:'bed-primary',kind:'bed',position:[1.35,0,12.7],rotation:Math.PI/2,size:[1.85,1.05,2.3],color:'taupe'},
  {id:'bed-south',kind:'bed',position:[4.85,0,12.7],rotation:Math.PI/2,size:[1.7,1.05,2.2],color:'white'},
  {id:'nightstand-north',kind:'nightstand',position:[.4,0,.35],rotation:Math.PI/2,size:[.45,.55,.5]},
  {id:'nightstand-primary',kind:'nightstand',position:[.4,0,13.95],size:[.45,.55,.5]},
  {id:'nightstand-south',kind:'nightstand',position:[3.8,0,13.85],size:[.45,.55,.5]},
  {id:'wardrobe-north',kind:'wardrobe',position:[.82,0,3.48],size:[1.45,2.45,.5]},
  {id:'wardrobe-primary',kind:'wardrobe',position:[.8,0,9.76],size:[1.45,2.45,.5]},
  {id:'wardrobe-south',kind:'wardrobe',position:[3.72,0,10.9],rotation:Math.PI/2,size:[1.2,2.4,.5]},
  {id:'hall-console',kind:'hallStorage',position:[3.35,0,7.35],rotation:Math.PI/2,size:[1.7,2.15,.45]},
  {id:'kitchen-cabinets',kind:'kitchen',position:[3.76,0,2.5],rotation:Math.PI/2,size:[3.7,.92,.62]},
  {id:'dining',kind:'dining',position:[8.1,0,14.4],rotation:Math.PI/2,size:[2.2,.8,3]},
  {id:'breakfast',kind:'breakfast',position:[5.525,0,2.6],size:[1.4,.82,2]},
  {id:'nightstand-north-2',kind:'nightstand',position:[.4,0,2.75],rotation:Math.PI/2,size:[.45,.55,.5]},
  {id:'nightstand-primary-2',kind:'nightstand',position:[.4,0,11.45],size:[.45,.55,.5]},
  {id:'nightstand-south-2',kind:'nightstand',position:[3.8,0,11.55],size:[.45,.55,.5]},
  {id:'sofa',kind:'sofa',position:[9.05,0,11.7],rotation:-Math.PI/2,size:[2.75,.88,.95]},
  {id:'coffee-table',kind:'coffee',position:[8,0,11.7],size:[.85,.4,1.2]},
  {id:'tv-console',kind:'tv',position:[6.65,0,11.7],rotation:Math.PI/2,size:[3.1,2.1,.38]},
  {id:'armchair',kind:'chair',position:[9,0,9.3],rotation:-.35,size:[.8,.85,.85]},
  {id:'living-storage',kind:'cabinet',position:[8.25,0,8.45],size:[2.05,1.2,.48]},
  {id:'tub',kind:'tub',position:[.48,0,4.63],rotation:Math.PI/2,size:[1.48,.6,.68]},
  {id:'vanity1',kind:'vanity',position:[1.5,0,4.03],size:[.65,.85,.35]},
  {id:'toilet2',kind:'toilet',position:[1.3,0,7.11],rotation:Math.PI,size:[.48,.7,.6]},
  {id:'vanity2',kind:'vanity',position:[.3,0,6.75],rotation:Math.PI/2,size:[1,.85,.45]},
  {id:'shower',kind:'shower',position:[1.5,0,9],rotation:Math.PI,size:[.8,2.1,.65]},
  {id:'vanity3',kind:'vanity',position:[.3,0,8.4],rotation:Math.PI/2,size:[1,.85,.45]},
  {id:'plant-living',kind:'plant',position:[9.35,0,15.4],size:[.5,1.5,.5]},
  {id:'plant-hall',kind:'plant',position:[6,0,9.6],size:[.42,1.3,.42]},
  {id:'plant-loggia1',kind:'plant',position:[5.9,0,-.6],size:[.4,1.1,.4]},
  {id:'plant-loggia2',kind:'plant',position:[3.8,0,15.55],size:[.38,1.2,.38]},
];
export const switches = [
  {id:'light-kitchen',room:'kitchen',position:[5.52,1.25,5.37],rotation:Math.PI},
  {id:'light-primary',room:'primary',position:[2.02,1.25,9.53],rotation:0},
  {id:'light-bedroom2',room:'bedroom2',position:[3.27,1.25,4.83],rotation:-Math.PI/2},
  {id:'light-bedroom3',room:'bedroom3',position:[5.52,1.25,10.13],rotation:0},
  {id:'light-living',room:'living',position:[6.53,1.25,10.2],rotation:Math.PI/2},
];
