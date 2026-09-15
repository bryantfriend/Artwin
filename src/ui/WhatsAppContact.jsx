import {routeLocation} from '../navigation.js';
import React from 'react';
import './WhatsAppContact.css';
import {resolveRoute} from '../projects.js';
import {contextMessage,whatsappHref,track} from '../sales.js';
import {useI18n} from '../i18n.js';

export const whatsAppContactUrl='https://wa.me/996228880000';

export default function WhatsAppContact({floating=false}) {
  const {t}=useI18n();
  const route=resolveRoute(routeLocation());
  const href=route.project?whatsappHref(contextMessage({project:route.project,plan:route.plan},t)):whatsAppContactUrl;
  return <a
    className={`whatsapp-contact${floating?' whatsapp-contact--floating':''}`}
    href={href} onClick={()=>track('whatsapp_opened',{projectId:route.project?.id,planId:route.plan?.id})}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={t('Contact Artwin on WhatsApp')}
    title={`${t('Contact Artwin on WhatsApp')} — ${t('Opens in a new tab')}`}
  >
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <path d="M12 3a9 9 0 0 0-7.78 13.52L3 21l4.58-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M8.6 7.15c-.2-.45-.4-.46-.6-.47h-.52c-.18 0-.46.07-.7.33-.24.27-.92.9-.92 2.18s.94 2.52 1.07 2.69c.13.18 1.86 2.85 4.51 4 .63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.08 1.56-.64 1.78-1.25.22-.62.22-1.15.15-1.26-.06-.1-.24-.17-.5-.3-.27-.13-1.57-.78-1.81-.87-.24-.08-.42-.13-.59.14-.18.26-.68.86-.83 1.04-.15.17-.3.2-.57.06-.26-.13-1.11-.4-2.11-1.3-.79-.7-1.32-1.57-1.47-1.83-.16-.27-.02-.41.11-.54.12-.12.27-.3.4-.46.13-.15.18-.27.27-.44.08-.17.04-.33-.03-.46-.06-.13-.58-1.43-.8-1.91Z" fill="currentColor"/>
    </svg>
  </a>;
}
