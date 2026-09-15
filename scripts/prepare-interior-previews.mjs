import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {projects} from '../src/projects.js';
const plans=projects.flatMap(project=>project.plans.map((plan,index)=>({project:project.id,id:plan.id,inspect:index===0||plan.id==='four-room-134'})));
const template=await readFile(new URL('./capture-interior-previews.js',import.meta.url),'utf8');
await mkdir(new URL('../output/playwright/',import.meta.url),{recursive:true});
for(let start=0;start<plans.length;start+=8){
 const filename=`interior-preview-batch-${start/8+1}.js`;
 await writeFile(new URL(`../output/playwright/${filename}`,import.meta.url),template.replace('__PLANS__',JSON.stringify(plans.slice(start,start+8))));
 console.log(filename,plans.slice(start,start+8).map(p=>p.id).join(', '));
}
