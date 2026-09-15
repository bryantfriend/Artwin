import {projectHref,apartmentHref,projectImage} from './projects.js';
import {routeHref} from './navigation.js';
import {translate as t,formatNumber} from './i18n.js';
export const publicOrigin='https://bryantfriend.github.io';
export function pageMetadata(route,language='ru'){
  const {project,plan}=route;
  const path=plan?apartmentHref(project,plan):project?projectHref(project):routeHref(route.kind==='projects'?'/projects':`/${{workspace:'sales-workspace',presentation:'presentation',shortlist:'shortlist',finder:'finder'}[route.kind]||'projects'}`);
  const label={finder:'Find a home that fits',shortlist:'Your family shortlist',workspace:'Sales workspace',presentation:'Your apartment presentation'}[route.kind]||'Explore our projects';
  return {title:plan?`${project.name} · ${formatNumber(plan.area,2,language)} ${t('m²',{},language)} — ARTWIN`:project?`${project.name} — ARTWIN`:`ARTWIN — ${t(label,{},language)}`,
    description:t(plan?.description||project?.description||'Choose a project. Explore the possibilities.',{},language),
    image:publicOrigin+(plan?`/Artwin/plans/${plan.id}.png`:project?projectImage(project):projectImage({id:'tokyo-city'})),
    url:publicOrigin+path,noindex:['workspace','presentation','shortlist','missing'].includes(route.kind)};
}
