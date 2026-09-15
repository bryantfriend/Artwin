import React from 'react';
import {useI18n} from '../i18n.js';
import {projectDetails} from '../projectDetails.js';
import {useSales} from './SalesProvider.jsx';
import {InventoryNotice} from './BuyerTools.jsx';
import ProjectLifestyle from './ProjectLifestyle.jsx';
import ProjectNeighbourhood from './ProjectNeighbourhood.jsx';

export default function ProjectConfidence({project}){
 const {t,language}=useI18n(),{data}=useSales(),info=projectDetails[project.id];
 return <section className="project-confidence">
  <div className="buyer-section-heading"><span className="collection-kicker">{t('BEYOND THE APARTMENT')}</span><h2>{t('Get to know the place')}</h2></div>
  <ProjectLifestyle project={project}/>
  <div className="confidence-grid">
   <details>
    <summary>{t('Construction and documents')}</summary>
    <InventoryNotice/>
    <p>{t('Confirm handover dates, the delivered finish and current documents with Artwin before choosing a home.')}</p>
    {info?.brochure&&<a className="buyer-link" href={info.brochure} target="_blank" rel="noopener noreferrer">{t('Official project brochure')} ↗</a>}
    {info?.documents.map(document=><a key={document} className="buyer-link" href={info.source} target="_blank" rel="noopener noreferrer">{t(document)} ↗</a>)}
    {[['milestones','Construction updates'],['documents','Project documents']].map(([key,label])=>{
     const records=data[key].filter(record=>record.projectId===project.id).sort((a,b)=>b.date.localeCompare(a.date));
     return <div className="confidence-records" key={key}>
      <h3>{t(label)}</h3>
      {records.length?records.map((record,index)=><a className="confidence-record" key={index} href={record.url} target="_blank" rel="noopener noreferrer"><time>{record.date}</time><span>{record.title[language]} ↗</span></a>):<p className="buyer-muted">{t('No dated records have been supplied to this app yet.')}</p>}
     </div>;
    })}
   </details>
   <ProjectNeighbourhood project={project}/>
  </div>
 </section>;
}
