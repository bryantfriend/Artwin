export function roomBounds(polygon){const xs=polygon.map(p=>p[0]),zs=polygon.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);return {minX,maxX,minZ,maxZ,width:maxX-minX,depth:maxZ-minZ};}
function inside([x,z],polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [a,b]=polygon[i],[c,d]=polygon[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)yes=!yes;}return yes;}
export function furnitureFits(polygon,center,width,depth){
 if(![...center,width,depth].every(Number.isFinite)||width<.1||depth<.1||width>10||depth>10)return false;
 // Sample the footprint as well as its perimeter: corner-only checks miss concave recesses.
 for(let i=0;i<=20;i++)for(let j=0;j<=20;j++)if(!inside([center[0]-width/2+width*i/20,center[1]-depth/2+depth*j/20],polygon))return false;
 return true;
}
