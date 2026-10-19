#!/usr/bin/env node
const [,,deviceId,note='Ativação administrativa'] = process.argv;
const base=process.env.FPR_SITE_URL || 'http://127.0.0.1:3000';
const token=process.env.FPR_ADMIN_TOKEN;
if(!deviceId||!token){console.error('Uso: FPR_ADMIN_TOKEN=... FPR_SITE_URL=... node tools/admin-activate.mjs FPR-DEVICE [observação]');process.exit(2)}
const response=await fetch(`${base}/api/admin/activate`,{method:'POST',headers:{'content-type':'application/json','x-fpr-admin-token':token},body:JSON.stringify({deviceId,note})});
const data=await response.json().catch(()=>({}));
if(!response.ok){console.error(data.error||`HTTP ${response.status}`);process.exit(1)}
console.log(JSON.stringify(data,null,2));
