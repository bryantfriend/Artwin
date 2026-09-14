import * as original from '../apartmentConfig.js';
import {tourStops} from '../tourConfig.js';
import {additionalLayouts} from './tokyoLayouts.js';
import {londonLayouts} from './londonLayouts.js';
import {wiltonLayouts} from './wiltonLayouts.js';

export const originalLayout={...original,id:'four-room-134',tourStops,bounds:{minX:0,maxX:9.8,minZ:-1.2,maxZ:16.1}};
export const layouts=[...additionalLayouts,originalLayout,...londonLayouts,...wiltonLayouts];
export const getLayout=id=>layouts.find(layout=>layout.id===id);
