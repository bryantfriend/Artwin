import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import Icon from './Icon.jsx';
import {useI18n} from '../i18n.js';
export default function Modal({children,onClose,labelledBy,className=''}){
  const dialog=useRef(),{t}=useI18n();
  useEffect(()=>{
    const previous=document.activeElement,element=dialog.current,overflow=document.body.style.overflow;
    element.showModal();document.body.style.overflow='hidden';
    return()=>{element.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[]);
  return createPortal(<dialog ref={dialog} className={`artwin-dialog ${className}`} aria-labelledby={labelledBy} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="dialog-content"><button className="dialog-close" aria-label={t('Close')} onClick={onClose}><Icon name="close" size={24}/></button>{children}</div></dialog>,document.body);
}
