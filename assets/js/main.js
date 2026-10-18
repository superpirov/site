/* ============================================================
   КУДА ПРИХОДЯТ ЗАЯВКИ С ФОРМЫ
   Сейчас CONTACT_EMAIL пуст — заявка сохраняется в браузере
   и открывается Telegram с готовым текстом.
   Когда дадите почту — впишите её, например:
   const CONTACT_EMAIL = "info@example.ru";
   Заявки начнут приходить на почту через FormSubmit (без бэкенда).
   Первый раз FormSubmit попросит подтвердить e-mail одним кликом.
   ============================================================ */
const CONTACT_EMAIL = "";

/* ---------- loader ---------- */
(function(){
  const loader=document.getElementById('loader');
  if(!loader) return;
  const pct=document.getElementById('loaderPct');
  const bar=document.getElementById('loaderBar');
  const word=document.getElementById('loaderWord');
  if(word){
    word.innerHTML='Ruslan Pirov'.split('').map((c,i)=>
      `<span style="animation-delay:${i*45}ms">${c===' '?'&nbsp;':c}</span>`).join('');
  }
  let v=0;
  const finish=()=>{
    loader.classList.add('done');
    document.body.style.overflow='';
    setTimeout(()=>loader.classList.add('gone'),1000);
  };
  const tick=()=>{
    const step=v<70?Math.random()*7+3:v<92?Math.random()*3+1.2:Math.random()*1.4+.4;
    v=Math.min(100,v+step);
    const shown=Math.floor(v);
    if(pct) pct.textContent=shown;
    if(bar) bar.style.width=shown+'%';
    if(v<100){ setTimeout(tick,70+Math.random()*90); }
    else { setTimeout(finish,420); }
  };
  document.body.style.overflow='hidden';
  window.addEventListener('load',()=>setTimeout(tick,150));
  setTimeout(finish,7000); /* страховка */
})();

document.addEventListener('DOMContentLoaded',()=>{
  /* ---------- nav ---------- */
  const nav=document.querySelector('.nav');
  const onScroll=()=>{
    nav?.classList.toggle('scrolled',window.scrollY>24);
    document.querySelector('.scroll-progress').style.width=
      (window.scrollY/(document.body.scrollHeight-window.innerHeight)*100)+'%';
  };
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  const burger=document.querySelector('.burger');
  const mmenu=document.querySelector('.mobile-menu');
  burger?.addEventListener('click',()=>{burger.classList.toggle('open');mmenu?.classList.toggle('open')});
  mmenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    burger?.classList.remove('open'); mmenu.classList.remove('open');
  }));

  /* ---------- reveal ---------- */
  const io=new IntersectionObserver(es=>{es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}
  })},{threshold:.12,rootMargin:'0px 0px -40px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* ---------- bars (skills) ---------- */
  const bo=new IntersectionObserver(es=>{es.forEach(e=>{
    if(e.isIntersecting){e.target.style.width=e.target.dataset.w;bo.unobserve(e.target)}
  })},{threshold:.4});
  document.querySelectorAll('.bar i').forEach(el=>bo.observe(el));

  /* ---------- counters ---------- */
  const co=new IntersectionObserver(es=>{es.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target; co.unobserve(el);
    const target=+el.dataset.count||0, suffix=el.dataset.suffix||'';
    const t0=performance.now(), dur=1500;
    const step=t=>{
      const p=Math.min(1,(t-t0)/dur);
      const val=Math.floor(target*(1-Math.pow(1-p,3)));
      el.textContent=val.toLocaleString('ru-RU')+suffix;
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));

  /* ---------- year ---------- */
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  /* ---------- cursor glow ---------- */
  const glow=document.querySelector('.cursor-glow');
  if(glow && matchMedia('(pointer:fine)').matches){
    addEventListener('mousemove',e=>{
      glow.style.opacity='1';
      glow.style.left=e.clientX+'px';
      glow.style.top=e.clientY+'px';
    },{passive:true});
    addEventListener('mouseleave',()=>glow.style.opacity='0');
  }

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll('.btn-dark,.btn-light').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.1}px)`;
    });
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });

  /* ---------- live ticker (project pages) ---------- */
  const ticker=document.querySelector('[data-ticker]');
  if(ticker){let v=97.24;setInterval(()=>{v+=(Math.random()-.5)*.06;ticker.textContent=v.toFixed(2).replace('.',',')+' ₽'},1400)}

  /* ---------- lead form ---------- */
  const form=document.getElementById('lead-form');
  const status=document.getElementById('form-status');
  const submit=document.getElementById('form-submit');
  const say=(cls,msg)=>{if(!status)return;status.className='form-status '+cls;status.textContent=msg};
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=document.getElementById('f-name').value.trim();
    const contact=document.getElementById('f-contact').value.trim();
    const topic=document.getElementById('f-topic').value;
    const message=document.getElementById('f-msg').value.trim();
    if(name.length<2) return say('err','Укажите имя (минимум 2 буквы).');
    if(contact.length<3) return say('err','Укажите Telegram или e-mail для ответа.');
    if(message.length<5) return say('err','Напишите пару слов о задаче.');
    const data={name,contact,topic,message,page:location.href,date:new Date().toISOString()};
    submit.disabled=true;submit.style.opacity=.65;say('wait','Отправляю…');
    const store=()=>{try{const a=JSON.parse(localStorage.getItem('leads')||'[]');a.push(data);localStorage.setItem('leads',JSON.stringify(a))}catch(_){}};
    if(CONTACT_EMAIL){
      try{
        const r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(CONTACT_EMAIL),{
          method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
          body:JSON.stringify({...data,_subject:'Заявка с сайта superpirov — '+topic,_template:'table'})
        });
        if(!r.ok) throw new Error();
        store();say('ok','✅ Заявка отправлена. Отвечу в течение дня.');
        form.reset();
      }catch(_){say('err','Не удалось отправить. Напишите в Telegram: t.me/ruslanpirov')}
      finally{submit.disabled=false;submit.style.opacity=1}
      return;
    }
    store();
    say('ok','✅ Заявка сохранена. Сейчас откроется Telegram с готовым текстом — останется нажать «Отправить».');
    const text=encodeURIComponent(`Здравствуйте, Руслан! Меня зовут ${name}. Тема: ${topic}. ${message} Мой контакт: ${contact}`);
    setTimeout(()=>window.open('https://t.me/ruslanpirov?text='+text,'_blank'),700);
    form.reset();submit.disabled=false;submit.style.opacity=1;
  });
});
