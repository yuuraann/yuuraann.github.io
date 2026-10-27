(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const motionButton = $('#motion-toggle');
  function motion() {
    document.body.dataset.motion = paused ? 'paused' : 'running';
    document.documentElement.classList.toggle('no-motion', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Reanudar animaciones' : 'Pausar animaciones');
    motionButton.textContent = paused ? 'Reanudar ▷' : 'Pausar Ⅱ';
  }
  motion();
  motionButton.addEventListener('click', () => { paused = !paused; motion(); draw(); });
  reduced.addEventListener('change', e => { paused = e.matches; motion(); draw(); });
  const menu = $('.menu-toggle'), nav = $('#navigation');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open',open); menu.setAttribute('aria-expanded',String(open)); });
  $$('#navigation a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  matchMedia('(min-width:701px)').addEventListener('change', closeMenu);
  const canvas = $('#node-canvas'), scene = $('.hero-scene'), ctx = canvas.getContext('2d');
  let width=0,height=0,angle=0, frame=0, last=0, visible=true, px=0,py=0;
  const points = Array.from({length:100},(_,i) => { const y=1-2*i/99, r=Math.sqrt(1-y*y), a=i*2.399963; return [Math.cos(a)*r,y,Math.sin(a)*r]; });
  function size() { const box=scene.getBoundingClientRect(); width=box.width;height=box.height; const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx?.setTransform(d,0,0,d,0,0); draw(); }
  function draw(time=0) {
    cancelAnimationFrame(frame);
    if(ctx && width) {
      if(!paused && time-last>30) { angle+=.003;last=time; }
      ctx.clearRect(0,0,width,height);
      const a=angle+px*.22,b=.25+py*.18, radius=Math.min(width,height)*.33;
      const projected=points.map(([x,y,z]) => { const xx=x*Math.cos(a)+z*Math.sin(a), zz=-x*Math.sin(a)+z*Math.cos(a), yy=y*Math.cos(b)-zz*Math.sin(b), z2=y*Math.sin(b)+zz*Math.cos(b), p=3/(3+z2);return [width/2+xx*radius*p,height/2+yy*radius*p,z2]; });
      projected.forEach((p,i) => { for(let j=i+1;j<points.length;j++) { const d=points[i].reduce((v,x,k)=>v+(x-points[j][k])**2,0);if(d<.19) {ctx.strokeStyle=`rgba(75,123,237,${.08+(1-p[2])*.055})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(projected[j][0],projected[j][1]);ctx.stroke();} } ctx.fillStyle=`rgba(75,123,237,${.3+(1-p[2])*.22})`;ctx.beginPath();ctx.arc(p[0],p[1],1.3-p[2]*.45,0,Math.PI*2);ctx.fill(); });
    }
    if(!paused && visible && !document.hidden) frame=requestAnimationFrame(draw);
  }
  new ResizeObserver(size).observe(scene);
  new IntersectionObserver(es => {visible=es[0].isIntersecting;draw();}).observe(scene);
  document.addEventListener('visibilitychange',draw);
  scene.addEventListener('pointermove',e=>{const r=scene.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;});
  scene.addEventListener('pointerleave',()=>{px=py=0;});
  $$('.spotlight').forEach(el=>el.addEventListener('pointermove',e=>{if(paused)return;const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${e.clientX-r.left}px`);el.style.setProperty('--my',`${e.clientY-r.top}px`);}));
  let scrollQueued=false;
  function progress(){ $('.scroll-progress').style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;scrollQueued=false; }
  addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(progress);}}, {passive:true});addEventListener('resize',progress);progress();
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');revealObserver.unobserve(e.target);}}),{threshold:.08});
  document.documentElement.classList.add('motion-ready');
  $$('.intro,.service-card,.featured-project,.small-project,.about,.process,.contact').forEach(el=>{el.classList.add('reveal','waiting');revealObserver.observe(el);});
  const scenarios={
    consultas:{label:'UNA CONSULTA ENTRA',input:'“Hola, tengo un pequeño negocio y quiero una web. ¿Por dónde empezamos?”',title:'Una respuesta con sentido.',body:'¡Hola! Podemos empezar por lo que necesitas conseguir: mostrar tus servicios, recibir consultas o presentar tus trabajos. Cuéntame qué negocio tienes y si ya cuentas con fotos o una web. Con eso podremos preparar una propuesta adaptada a tu idea.',tag:'BORRADOR · REVISIÓN HUMANA'},
    solicitudes:{label:'UNA SOLICITUD ENTRA',input:'“Tengo una tienda y quiero enseñar mi catálogo en una web. Me gustaría que pudieran consultarme por WhatsApp.”',title:'La idea, un poco más ordenada.',body:'Tipo de proyecto: página web.\nObjetivo: presentar el catálogo y facilitar consultas.\nCanal deseado: WhatsApp.\nPor concretar: número de productos, imágenes disponibles y plazo.\nSiguiente paso: revisar los detalles y preparar una propuesta.',tag:'RESUMEN · PARA REVISAR'},
    borradores:{label:'UNA IDEA ENTRA',input:'“Quiero explicar en mi web un nuevo servicio de ramos de flores por encargo.”',title:'Un primer texto para trabajar.',body:'Flores para una ocasión especial.\n\nCuéntanos qué quieres celebrar y prepararemos juntos una idea de ramo. Escríbenos para consultar las opciones disponibles y los detalles de tu encargo.\n\nAntes de publicarlo: confirmar los servicios, las condiciones y el tono del negocio.',tag:'TEXTO DE EJEMPLO · EDITABLE'}
  };
  let current='consultas',run=0;
  const nodes=$$('[data-node]'),runButton=$('#run-demo');
  function selectScenario(key,focus=false){run++;current=key;const s=scenarios[key];$$('.lab-tab').forEach(t=>{const on=t.dataset.scenario===key;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on){$('#lab-panel').setAttribute('aria-labelledby',t.id);if(focus)t.focus();}});$('#lab-input-label').textContent=s.label;$('#lab-input-text').textContent=s.input;$('#lab-result').textContent='Aquí verás el resultado del recorrido. Tú mantienes la última palabra.';$('#lab-state').innerHTML='<i></i> LISTO PARA PROBAR';nodes.forEach(n=>n.classList.remove('active','complete'));runButton.disabled=false;runButton.textContent='Probar el recorrido ↗';}
  $$('.lab-tab').forEach((tab,i,all)=>{tab.addEventListener('click',()=>selectScenario(tab.dataset.scenario));tab.addEventListener('keydown',e=>{let j=i;if(['ArrowDown','ArrowRight'].includes(e.key))j=(i+1)%all.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))j=(i+all.length-1)%all.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=all.length-1;else return;e.preventDefault();selectScenario(all[j].dataset.scenario,true);});});
  runButton.addEventListener('click',async()=>{const token=++run;runButton.disabled=true;$('#lab-state').textContent='RECORRIDO EN MARCHA';$('#lab-result').textContent='Preparando el ejemplo…';for(const n of nodes){if(token!==run)return;n.classList.add('active');await new Promise(r=>setTimeout(r,paused?20:400));if(token!==run)return;n.classList.remove('active');n.classList.add('complete');}const s=scenarios[current];const title=document.createElement('h4');title.className='result-title';title.textContent=s.title;const tag=document.createElement('span');tag.className='result-tag';tag.textContent=s.tag;const body=document.createElement('p');body.style.whiteSpace='pre-line';body.textContent=s.body;$('#lab-result').replaceChildren(tag,title,body);$('#lab-state').textContent='LISTO PARA REVISAR';runButton.disabled=false;runButton.textContent='Volver a probar ↗';});
  const briefDialog=$('#brief-dialog');
  function openDialog(d){d.showModal();document.body.classList.add('modal-open');}
  [briefDialog].forEach(d=>{d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
  $('.close-brief').addEventListener('click',()=>briefDialog.close());
  $$('[data-project]').forEach(b=>b.addEventListener('click',()=>{{selectScenario(b.dataset.project==='flujo'?'solicitudes':'consultas');$('#laboratorio').scrollIntoView();}}));
  let step=0;
  const form=$('#brief-form');
  function briefText(){const data=new FormData(form);const kinds={web:'Página web',ia:'Inteligencia artificial',automatizacion:'Automatización'};return `MI PROYECTO · NODO\n\nQué necesito: ${kinds[data.get('kind')]}\nNegocio o idea: ${String(data.get('business')||'Por concretar').trim()}\nObjetivo: ${data.get('goal')}\n\nMi idea:\n${String(data.get('description')||'Pendiente de concretar.').trim()}\n\nDocumento preparado en el prototipo de NODO. No se ha enviado ninguna solicitud.`;}
  function showStep(){ $$('.brief-step').forEach(el=>el.hidden=Number(el.dataset.step)!==step);$('#brief-progress').textContent=`0${step+1} / 03`;$('#brief-back').hidden=step===0;$('#brief-next').textContent=step===2?'Terminar ✓':'Continuar →';if(step===2){$('#brief-output').textContent=briefText();$('#email-brief').href='mailto:'+window.NODO_CONFIG.contactEmail+'?subject='+encodeURIComponent('Nuevo proyecto · NODO')+'&body='+encodeURIComponent(briefText().replace('Documento preparado en el prototipo de NODO. No se ha enviado ninguna solicitud.',''));$('#whatsapp-brief').href='https://wa.me/'+window.NODO_CONFIG.whatsappNumber+'?text='+encodeURIComponent(briefText().replace('Documento preparado en el prototipo de NODO. No se ha enviado ninguna solicitud.',''));}$('#brief-feedback').textContent='';}
  function openBrief(kind){step=0;if(kind){const radio=form.querySelector(`input[value="${kind}"]`);if(radio)radio.checked=true;}showStep();openDialog(briefDialog);}
  $$('[data-open-brief]').forEach(b=>b.addEventListener('click',()=>openBrief()));$$('.service-brief').forEach(b=>b.addEventListener('click',()=>openBrief(b.dataset.kind)));
  $('#brief-next').addEventListener('click',()=>{if(step===2){briefDialog.close();return;}step++;showStep();});$('#brief-back').addEventListener('click',()=>{step=Math.max(0,step-1);showStep();});form.addEventListener('submit',e=>e.preventDefault());
  $('#download-brief').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([briefText()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mi-proyecto-nodo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#brief-feedback').textContent='Documento preparado para descargar. No se ha enviado.';});
  $('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(briefText());$('#brief-feedback').textContent='Copiado. Ya puedes guardarlo o compartirlo.';}catch{$('#brief-feedback').textContent='Selecciona el texto del resumen para copiarlo manualmente.';}});
  const details=$$('.process-list details');details.forEach((d,i)=>d.addEventListener('toggle',()=>{if(d.open){details.forEach(other=>{if(other!==d)other.open=false;});$('#process-current').textContent=`0${i+1} / 04`;}}));

})();
