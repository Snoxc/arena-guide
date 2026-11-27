/* Festive UI + public support info. No secret keys or payment processing in JS. */
(()=>{
  'use strict';
  const c=window.GUIDE_PUBLIC_CONFIG||{};
  const $=s=>document.querySelector(s);
  const configSupport=c.support||{};
  const whenReady=()=>{
    const desktop=$('#support-desktop-slot'),mobile=$('#support-mobile-slot'),card=$('#support-card');
    const narrow=window.matchMedia('(max-width:1200px)');
    function moveCard(){if(!card)return;const slot=narrow.matches?mobile:desktop;if(card.parentElement!==slot)slot.appendChild(card)}
    moveCard();
    if(narrow.addEventListener)narrow.addEventListener('change',moveCard);
    else if(narrow.addListener)narrow.addListener(moveCard);

    const num=v=>Math.max(0,Number.isFinite(Number(v))?Math.round(Number(v)):0);
    const goal=num(configSupport.goalRub)||15000,raised=num(configSupport.raisedRub);
    const rub=n=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(n);
    $('#support-progress-amount').replaceChildren(document.createTextNode(rub(raised)+' '));
    const remainder=document.createElement('em');remainder.textContent='/ '+rub(goal);$('#support-progress-amount').append(remainder);
    const meter=$('#support-meter');meter.setAttribute('aria-valuemax',String(goal));meter.setAttribute('aria-valuenow',String(Math.min(goal,raised)));
    $('#support-meter-fill').style.width=`${Math.min(100,raised/goal*100)}%`;

    // Links are configurable. An empty payment URL never simulates a payment.
    const validHttps=v=>typeof v==='string'&&/^https:\/\//i.test(v);
    const payment=$('#support-payment-link'),note=$('#support-payment-note');
    if(validHttps(configSupport.paymentUrl)){
      payment.href=configSupport.paymentUrl;payment.firstChild.textContent='Поддержать проект ';
      note.textContent='Оплата проходит на внешней странице. На этом сайте данные банковской карты не запрашиваются.';
    }else if(validHttps(configSupport.contactUrl))payment.href=configSupport.contactUrl;
    else {payment.removeAttribute('href');payment.setAttribute('aria-disabled','true');note.textContent='Реквизиты и платёжная ссылка пока не настроены.'}

    const dialogs=['support-dialog','login-dialog'];
    let lastOpener=null;
    function openDialog(id){const dialog=document.getElementById(id);if(!dialog||typeof dialog.showModal!=='function')return;
      const other=dialogs.map(i=>document.getElementById(i)).find(d=>d?.open&&d!==dialog);
      other?.close();lastOpener=document.activeElement;dialog.showModal();dialog.querySelector('.dialog-close')?.focus();}
    $('#support-open')?.addEventListener('click',()=>openDialog('support-dialog'));
    $('#support-details')?.addEventListener('click',()=>openDialog('support-dialog'));
    const login=$('#login-toggle');
    if(validHttps(c.auth?.loginUrl)){login?.removeAttribute('aria-haspopup');login?.removeAttribute('aria-controls');}
    login?.addEventListener('click',()=>{
      if(validHttps(c.auth?.loginUrl)){window.location.assign(c.auth.loginUrl);return;}
      openDialog('login-dialog');
    });
    for(const d of dialogs){const dialog=document.getElementById(d);if(!dialog)continue;
      dialog.addEventListener('click',e=>{
        if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}
      });
      dialog.addEventListener('close',()=>{if(lastOpener?.isConnected)lastOpener.focus({preventScroll:true});lastOpener=null});
    }
    document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>{
      document.getElementById(button.dataset.closeDialog)?.close();
    }));

    const snowButton=$('#snow-toggle');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const holidays=c.holidaySeason!==false;
    document.body.classList.toggle('holiday-season',holidays);
    let preference;
    try{const stored=localStorage.getItem('guide-snow-enabled');preference=stored===null?true:stored==='true'}catch{preference=true}
    const overlay=document.createElement('div');overlay.className='snow-overlay';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
    if(holidays){
      // Deterministic, lightweight CSS flakes; no animation loop or dependency.
      for(let i=0;i<32;i++){
        const flake=document.createElement('i');flake.className='snowflake';
        const r=(x)=>{const t=Math.sin((i+1)*x)*43758.5453;return t-Math.floor(t)};
        flake.style.setProperty('--flake-x',(r(18.12)*100).toFixed(2)+'%');
        flake.style.setProperty('--flake-size',(2+r(41.91)*3.9).toFixed(1)+'px');
        flake.style.setProperty('--flake-alpha',(0.25+r(9.26)*0.37).toFixed(2));
        flake.style.setProperty('--flake-drift',((r(2.7)-.5)*145).toFixed(0)+'px');
        flake.style.setProperty('--flake-duration',(11+r(5.2)*13).toFixed(1)+'s');
        flake.style.setProperty('--flake-delay',(-r(8.9)*25).toFixed(1)+'s');
        overlay.appendChild(flake);
      }
    }
    function snowRefresh(){
      const effective=holidays&&preference&&!reduced.matches;
      overlay.classList.toggle('is-active',effective);
      snowButton?.setAttribute('aria-pressed',String(effective));
      const label=reduced.matches?'Снег отключён настройкой уменьшения анимации':(effective?'Выключить снег':'Включить снег');
      snowButton?.setAttribute('aria-label',label);snowButton?.setAttribute('title',label);
      snowButton&&(snowButton.disabled=!holidays||reduced.matches);
    }
    snowButton?.addEventListener('click',()=>{
      preference=!preference;try{localStorage.setItem('guide-snow-enabled',String(preference))}catch{}
      snowRefresh();
    });
    if(reduced.addEventListener)reduced.addEventListener('change',snowRefresh);
    else if(reduced.addListener)reduced.addListener(snowRefresh);
    snowRefresh();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',whenReady,{once:true});else whenReady();
})();
