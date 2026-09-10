/* ============================================================
   КУДА ПРИХОДЯТ ЗАЯВКИ
   Сейчас: CONTACT_EMAIL = "" (пусто) — письма никуда не уходят,
   заявка сохраняется в localStorage + открывается Telegram.
   Когда дадите почту — впишите её сюда, например:
   const CONTACT_EMAIL = "info@mireacare.ru";
   и заявки полетят на почту через FormSubmit (без бэкенда,
   работает на GitHub Pages). Первый раз FormSubmit попросит
   подтвердить e-mail одним кликом.
   ============================================================ */
const CONTACT_EMAIL = "";
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('preloader')?.classList.add('done'),400)});
document.addEventListener('DOMContentLoaded',()=>{
  const burger=document.getElementById('burger');
  const mMenu=document.getElementById('mmenu');
  burger?.addEventListener('click',()=>mMenu?.classList.toggle('open'));

  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // counters
  const cio=new IntersectionObserver((es)=>{es.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target; cio.unobserve(el);
    const target=+el.dataset.count||0; const suf=el.dataset.suffix||'';
    const t0=performance.now(), dur=1400;
    const step=(t)=>{const p=Math.min(1,(t-t0)/dur);const v=Math.floor(target*(1-Math.pow(1-p,3)));el.textContent=v.toLocaleString('ru-RU')+suf;if(p<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  })},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

  // year
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  // magnetic buttons
  document.querySelectorAll('.btn-dark').forEach(btn=>{
    btn.addEventListener('mousemove',(e)=>{const r=btn.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;btn.style.transform=`translate(${x*.08}px,${y*.12}px)`});
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });

  // fake live price ticker on verum page
  const ticker=document.getElementById('ticker');
  if(ticker){let v=9724;setInterval(()=>{v+= (Math.random()-.5)*8; ticker.textContent=v.toFixed(2).replace('.',',')+' ₽'},1200)}

  // ---- lead form ----
  const form=document.getElementById('lead-form');
  const status=document.getElementById('form-status');
  const btn=document.getElementById('form-btn');
  const say=(cls,msg)=>{if(!status) return;status.className='form-status '+cls;status.textContent=msg};
  form?.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const name=document.getElementById('f-name').value.trim();
    const contact=document.getElementById('f-contact').value.trim();
    const topic=document.getElementById('f-topic').value;
    const message=document.getElementById('f-msg').value.trim();
    if(name.length<2){say('err','Укажите имя (минимум 2 буквы).');return}
    if(contact.length<3){say('err','Укажите Telegram или e-mail для ответа.');return}
    if(message.length<5){say('err','Напишите пару слов о задаче.');return}
    const payload={name,contact,topic,message,page:location.href,date:new Date().toISOString()};
    btn.disabled=true;btn.style.opacity=.6;say('wait','Отправляю…');
    // 1) если почта задана — шлём через FormSubmit AJAX
    if(CONTACT_EMAIL){
      try{
        const r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(CONTACT_EMAIL),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({...payload,_subject:'Новая заявка с сайта superpirov — '+topic,_template:'table'})});
        if(!r.ok) throw new Error('mail failed');
        say('ok','✅ Заявка отправлена! Отвечу в течение дня.');
        try{const k='leads';const arr=JSON.parse(localStorage.getItem(k)||'[]');arr.push(payload);localStorage.setItem(k,JSON.stringify(arr))}catch(_){}
        form.reset();
      }catch(err){say('err','Не получилось отправить на почту. Напишите в Telegram: t.me/ruslanpirov')}
      finally{btn.disabled=false;btn.style.opacity=1}
      return;
    }
    // 2) почты пока нет — сохраняем локально + предлагаем Telegram
    try{const k='leads';const arr=JSON.parse(localStorage.getItem(k)||'[]');arr.push(payload);localStorage.setItem(k,JSON.stringify(arr))}catch(_){}
    say('ok','✅ Заявка сохранена в браузере. Сейчас откроется Telegram с готовым текстом — просто нажмите «Отправить». Почту для авто-приёма заявок добавим позже.');
    const text=encodeURIComponent('Здравствуйте, Руслан! Меня зовут '+name+'. ('+topic+') '+message+' Мой контакт: '+contact);
    setTimeout(()=>window.open('https://t.me/ruslanpirov?text='+text,'_blank'),800);
    form.reset();btn.disabled=false;btn.style.opacity=1;
  });
});
