// "Request Talent" pop-up form (employer request or general candidate enquiry). Opens with MBEnquiry.open('employer' | 'candidate').
const MBEnquiry=(()=>{
 let tab='employer',sent=false;
 const st=document.createElement('style');
 st.textContent=`.mqo{position:fixed;inset:0;z-index:110;background:rgba(15,23,20,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:1rem}
 .mqb{position:relative;background:#fff;border-radius:24px;width:100%;max-width:600px;max-height:94vh;overflow:auto;padding:2rem;box-shadow:0 24px 60px rgba(0,0,0,.3);font:15px/1.5 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937}
 .mqx{position:absolute;top:.8rem;right:1.1rem;background:none;border:0;font-size:1.6rem;line-height:1;cursor:pointer;color:#6b7280}
 .mqt{display:flex;gap:.6rem;flex-wrap:wrap;padding-bottom:1.2rem;margin-bottom:1.2rem;border-bottom:1px solid #e5e7eb;padding-right:1.5rem}
 .mqt button{border:0;border-radius:12px;padding:.7rem 1.1rem;font:inherit;font-size:.88rem;font-weight:700;cursor:pointer;background:#eef2f7;color:#374151}
 .mqt button.on{background:#0f5c3b;color:#fff}
 .mqb label{display:block;font-size:.85rem;font-weight:700;margin:1rem 0 .4rem;color:#1f2937}
 .mqb input,.mqb textarea{width:100%;font:inherit;padding:.8rem .9rem;border:1px solid #c9d3de;border-radius:12px;background:#fff;color:#1f2937}
 .mqb textarea{min-height:110px;resize:vertical}.mqb ::placeholder{color:#9ca3af}
 .mqb input:focus,.mqb textarea:focus{outline:2px solid #10b981;outline-offset:1px;border-color:transparent}
 .mqs{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;margin-top:1.3rem;background:#0f5c3b;color:#fff;border:0;border-radius:16px;padding:1rem;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 6px 14px rgba(15,92,59,.25)}
 .mqs:hover{background:#0b4a2f}.mqs:disabled{opacity:.6;cursor:default}
 .mqe{min-height:1.2rem;margin:.8rem 0 0;font-size:.88rem;color:#b3392f}.mqh{position:absolute;left:-9999px}
 .mqd{text-align:center;padding:1.5rem 0}.mqd h2{margin:.4rem 0;color:#0f5c3b}.mqd p{color:#4b5563}`;
 document.head.appendChild(st);
 const root=document.createElement('div');document.body.appendChild(root);
 const q=s=>root.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const plane='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.5 11.1 21 2.9c.8-.4 1.6.4 1.2 1.2l-8.2 18.5c-.4.9-1.7.8-2-.1l-1.9-6.7-6.7-1.9c-.9-.3-1-1.6-.1-1.9zm8.9 2.2 1.1 3.8 5.6-11.9z"/></svg>';
 function draw(v={}){
  const emp=tab=='employer';
  root.innerHTML=`<div class="mqo" data-bg><div class="mqb" role="dialog" aria-modal="true" aria-label="Contact Mbono"><button class="mqx" data-x aria-label="Close">×</button>
  <div class="mqt"><button data-t="employer" class="${emp?'on':''}">Request Talent (Employer)</button><button data-t="candidate" class="${emp?'':'on'}">General Inquiry (Candidate)</button></div>
  <form id="mqf" novalidate>
   <label for="mqn">Full Name</label><input id="mqn" autocomplete="name" placeholder="e.g. Thabo Ndlovu" value="${esc(v.n||'')}">
   <label for="mqe">Email Address</label><input id="mqe" type="email" autocomplete="email" placeholder="e.g. thabo@company.co.za" value="${esc(v.e||'')}">
   <label for="mqc">Company / Organization Name${emp?'':' (optional)'}</label><input id="mqc" autocomplete="organization" placeholder="e.g. Eastern Cape Tech Solutions" value="${esc(v.c||'')}">
   <label for="mqm">How can we assist you?</label><textarea id="mqm" placeholder="Detail your workforce requirements or candidate inquiry...">${esc(v.m||'')}</textarea>
   <input class="mqh" id="mqw" tabindex="-1" autocomplete="off" aria-hidden="true">
   <p class="mqe" id="mqx" role="alert"></p><button class="mqs" type="submit">Send Message ${plane}</button>
  </form></div></div>`;
  q('#mqn').focus();
 }
 const vals=()=>({n:q('#mqn').value,e:q('#mqe').value,c:q('#mqc').value,m:q('#mqm').value});
 function close(){root.innerHTML=''}
 root.addEventListener('click',e=>{const t=e.target;
  if(t.dataset.x!==undefined||t.dataset.bg!==undefined||t.dataset.done!==undefined)close();
  if(t.dataset.t){tab=t.dataset.t;draw(vals())}});
 root.addEventListener('submit',async e=>{e.preventDefault();
  const v=vals(),err=q('#mqx'),btn=q('.mqs');err.textContent='';btn.disabled=true;
  try{
   const r=await fetch(API+'/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:tab,name:v.n,email:v.e,company:v.c,message:v.m,website:q('#mqw').value})});
   const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Something went wrong. Please try again.');
   root.innerHTML=`<div class="mqo" data-bg><div class="mqb mqd" role="dialog" aria-modal="true"><button class="mqx" data-x aria-label="Close">×</button><h2>Thank you, ${esc(v.n.split(' ')[0])}!</h2>
   <p>We have received your message and will reply to ${esc(v.e)} soon.</p><button class="mqs" data-done style="max-width:220px;margin:1.2rem auto 0">Close</button></div></div>`;
  }catch(x){err.textContent=x.message;btn.disabled=false}});
 document.addEventListener('keydown',e=>{if(e.key=='Escape')close()});
 return{open(t='employer'){tab=t;draw()},close};
})();