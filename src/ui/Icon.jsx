import React from 'react';
const paths={
  cube:<><path d="m12 3 9 5v8l-9 5-9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5"/></>,
  walk:<><circle cx="13" cy="4" r="2"/><path d="m10 21 2-7-3-3 2-5 4 1 2 5 3 1M5 12l3-1 2-4M12 14l4 3 1 4"/></>,
  arrow:<path d="M4 12h15m-6-6 6 6-6 6"/>,
  reset:<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,
  plan:<><path d="M3 3h18v18H3zM3 11h8V3m0 8v10m0-6h10"/></>,
  light:<><path d="M9 18h6m-5 3h4M8 13a6 6 0 1 1 8 0l-1 3H9z"/></>,
  expand:<><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></>,
  help:<><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01"/></>,
  close:<path d="m6 6 12 12M6 18 18 6"/>,
  chevron:<path d="m9 5 7 7-7 7"/>,
  sound:<><path d="M3 9h4l5-4v14l-5-4H3zM16 8l5 8m0-8-5 8"/></>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
  eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
};
export default function Icon({name,size=20,...props}) {return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]||paths.arrow}</svg>;}
