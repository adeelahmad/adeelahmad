// Google Analytics (gtag.js), added on every page at Adeel's request.
import crypto from 'node:crypto';
export const GA_ID='G-RKFB16BPXJ';
const inline="window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','"+GA_ID+"');";
const hash=s=>"'sha256-"+crypto.createHash('sha256').update(s).digest('base64')+"'";
export const gaHead='<script async src="https://www.googletagmanager.com/gtag/js?id='+GA_ID+'"></script><script>'+inline+'</script>';
// CSP additions the tag needs.
export const gaCsp={
  script:"https://www.googletagmanager.com "+hash(inline),
  connect:"https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  img:"https://*.google-analytics.com https://www.googletagmanager.com",
};
