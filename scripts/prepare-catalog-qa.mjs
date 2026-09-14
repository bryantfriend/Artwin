import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {catalogPlans} from '../src/catalogPlans.js';
mkdirSync('output/playwright',{recursive:true});
const template=readFileSync('scripts/capture-catalog-previews.js','utf8');
for(const project of new Set(catalogPlans.map(p=>p.project))){
 writeFileSync(`output/capture-${project}.js`,template.replace('__PLANS__',JSON.stringify(catalogPlans.filter(p=>p.project===project).map(p=>({id:p.id,project:p.project,area:p.area})))));
}
