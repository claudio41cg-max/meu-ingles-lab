import {course} from './courses/a1/course.js';
import {moduleProgress,isLessonUnlocked} from './core/progress.js';
import {setLessonProgress,getState} from './core/state.js';
import {speak,speakPortugueseDora} from './services/tts-service.js?v=3';
import {renderVoiceLab} from './ui/voice-lab.js?v=3';

const root=document.querySelector('#app');
let session=null;

function home(){
  const s=getState();
  const first=course.modules[0];
  const p=moduleProgress(first);
  root.innerHTML=
    '<section>'+
    '<div class="top"><div class="brand">Meu Inglês <span class="muted">2.0</span></div><span class="tag">LAB</span></div>'+
    '<div class="hero"><div class="eyebrow">Seu caminho até falar inglês</div><h1>Olá, '+s.name+'.<br>Vamos continuar?</h1><p class="muted">Do zero à conversação, uma etapa de cada vez.</p></div>'+
    '<article class="card continue"><div class="eyebrow">Continuar</div><h2>'+first.title+'</h2><p class="muted">'+first.subtitle+'</p>'+
    '<div class="progress"><span style="width:'+p+'%"></span></div><p class="muted">'+p+'% do módulo</p><button class="primary" id="continue">Continuar →</button></article>'+
    '<div class="grid">'+
      '<article class="card tile" id="course"><div>📚</div><b>Curso principal</b><span class="muted">Pre-A1 → C1</span></article>'+
      '<article class="card tile"><div>🧠</div><b>Praticar</b><span class="muted">Revisão inteligente</span></article>'+
      '<article class="card tile" id="voiceLab"><div>🎙️</div><b>Laboratório de vozes</b><span class="muted">Kokoro · teste gratuito</span></article>'+
      '<article class="card tile"><div>🎮</div><b>Explorar</b><span class="muted">Games e extras</span></article>'+
    '</div></section>';
  document.querySelector('#continue').onclick=()=>openModule(first.id);
  document.querySelector('#course').onclick=openCourse;
  document.querySelector('#voiceLab').onclick=()=>renderVoiceLab(root,{back:home});
}
function openCourse(){
  root.innerHTML='<section><div class="head"><button class="back" id="back">‹</button><div><div class="eyebrow">Curso principal</div><h2 style="margin:2px 0">Pre-A1 · Começando do zero</h2></div></div><div class="list" id="mods"></div></section>';
  document.querySelector('#back').onclick=home;
  const box=document.querySelector('#mods');
  course.modules.forEach(m=>{
    const b=document.createElement('button');b.className='row';
    const p=moduleProgress(m);
    b.innerHTML='<b>Módulo '+m.number+' · '+m.icon+' '+m.title+'</b><br><span class="muted">'+m.subtitle+'</span>'+(m.lessons.length?'<div class="progress" style="margin-top:10px"><span style="width:'+p+'%"></span></div>':'<div class="muted" style="margin-top:8px">Planejado · implementação em seguida</div>');
    b.onclick=()=>openModule(m.id);box.appendChild(b);
  });
}
function openModule(id){
  const m=course.modules.find(x=>x.id===id);if(!m)return;
  if(!m.lessons.length){alert('Este módulo já está planejado e será implementado na próxima etapa.');return}
  root.innerHTML='<section><div class="head"><button class="back" id="back">‹</button><div><div class="eyebrow">Pre-A1 · Módulo '+m.number+'</div><h2 style="margin:2px 0">'+m.title+'</h2><div class="muted">'+m.subtitle+'</div></div></div><div class="list" id="lessons"></div></section>';
  document.querySelector('#back').onclick=openCourse;
  const box=document.querySelector('#lessons');
  m.lessons.forEach((l,i)=>{
    const b=document.createElement('button');b.className='row';b.disabled=!isLessonUnlocked(m,i);
    b.innerHTML='<b>'+l.icon+' '+l.title+'</b><br><span class="muted">Aula '+(i+1)+' de '+m.lessons.length+'</span>';
    b.onclick=()=>startLesson(m,l);box.appendChild(b);
  });
}
function startLesson(module,lesson){session={module,lesson,index:0,locked:false};renderStep()}
function controls(){
  let h='<div class="actions"><button class="primary" id="next">Continuar</button>';
  if(session.index>0)h+='<button class="secondary" id="prev">‹ Voltar uma etapa</button>';
  return h+'</div>';
}
function renderStep(){
  const st=session.lesson.steps[session.index];
  const pct=Math.round((session.index+1)/session.lesson.steps.length*100);
  let body='';
  if(st.type==='teach'){
    body='<div class="eyebrow">Conheça primeiro</div><div class="big">'+st.en+'</div><p class="translation">'+st.pt+'</p>'+(st.note?'<p class="muted" style="text-align:center">'+st.note+'</p>':'')+'<button class="listen" id="listen">🔊 Ouvir</button>'+controls();
  }else if(['listen-choice','meaning-choice','context-choice','mini-dialogue'].includes(st.type)){
    body='<div class="eyebrow">Pratique</div><h2 style="text-align:center">'+st.prompt+'</h2>'+(st.audio?'<button class="listen" id="listen">🔊 Ouvir</button>':'')+'<div class="choices" id="choices"></div><div id="feedback"></div>';
  }else if(st.type==='speak'){
    body='<div class="eyebrow">Fale em voz alta</div><h2 style="text-align:center">'+st.prompt+'</h2><div class="big">'+st.target+'</div><button class="listen" id="listen">🔊 Ouvir exemplo</button><p class="muted" style="text-align:center">A avaliação pelo microfone entra na próxima etapa do laboratório.</p>'+controls();
  }else if(st.type==='mission'){
    body='<div style="text-align:center;font-size:64px">✨</div><div class="eyebrow" style="text-align:center">Missão</div><h2 style="text-align:center">'+st.title+'</h2><p class="translation">'+st.body+'</p>'+controls();
  }
  root.innerHTML='<section><div class="head"><button class="back" id="back">‹</button><div style="flex:1"><div class="eyebrow">'+session.module.title+'</div><div class="progress"><span style="width:'+pct+'%"></span></div></div></div><article class="card stage">'+body+'</article></section>';
  document.querySelector('#back').onclick=()=>openModule(session.module.id);
  const listen=document.querySelector('#listen');if(listen)listen.onclick=()=>speak(st.audio||st.en||st.target||'');
  if(st.prompt) speakPortugueseDora(st.prompt);
  if(st.options){
    const choices=document.querySelector('#choices');
    st.options.forEach(o=>{const b=document.createElement('button');b.className='choice';b.textContent=o;b.onclick=()=>answer(b,o,st);choices.appendChild(b)});
  }
  bindNav();
}
function answer(button,value,st){
  if(session.locked)return;session.locked=true;
  const ok=value===st.answer;button.classList.add(ok?'good':'bad');
  document.querySelectorAll('.choice').forEach(b=>{if(b.textContent===st.answer)b.classList.add('good');b.disabled=true});
  document.querySelector('#feedback').innerHTML='<div class="card" style="padding:14px;margin-top:8px">'+(ok?'Muito bem!':'Quase. Veja a resposta correta e fixe a ideia.')+'</div>'+controls();
  bindNav();
}
function bindNav(){
  const n=document.querySelector('#next');if(n)n.onclick=next;
  const p=document.querySelector('#prev');if(p)p.onclick=()=>{if(session.index>0){session.index--;session.locked=false;renderStep()}};
}
function next(){
  if(session.index+1>=session.lesson.steps.length){
    setLessonProgress(session.lesson.id,100);openModule(session.module.id);return;
  }
  session.index++;session.locked=false;
  setLessonProgress(session.lesson.id,Math.round(session.index/session.lesson.steps.length*100));
  renderStep();
}
home();
