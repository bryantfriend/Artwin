import React from 'react';
import {useI18n} from '../i18n.js';
// Exact destinations verified from artwin.kg on 2026-09-13. Both groups share YouTube.
export const socialGroups=[
  {account:'artwin.kg',links:[['Instagram','https://instagram.com/artwin.kg'],['Facebook','https://www.facebook.com/artwin.kg'],['YouTube','https://youtube.com/@artwin_kg']]},
  {account:'artwin.osh',links:[['Instagram','https://instagram.com/artwin.osh'],['Facebook','https://www.facebook.com/artwin.osh'],['YouTube','https://youtube.com/@artwin_kg']]},
];
function SocialIcon({network}){return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">{network==='Instagram'?<g fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".7" fill="currentColor"/></g>:network==='Facebook'?<path fill="currentColor" d="M14 22v-9h3l.5-4H14V7c0-1.1.3-2 2-2h2V1.4c-.7-.1-1.8-.4-3.3-.4C11.5 1 10 3 10 6v3H7v4h3v9Z"/>:<><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="m10 9 6 3-6 3Z" fill="#121513"/></>}</svg>;}
export default function SocialLinks(){const {t}=useI18n();return <div className="social-groups" aria-label={t('Meet us on social media')}>{socialGroups.map(group=><div className="social-group" key={group.account}><span>@{group.account}</span><div>{group.links.map(([network,url])=><a key={network} href={url} target="_blank" rel="noopener noreferrer" aria-label={t('{network} · {account}',{network,account:group.account})} title={`${network} · @${group.account} — ${t('Opens in a new tab')}`}><SocialIcon network={network}/></a>)}</div></div>)}</div>;}
