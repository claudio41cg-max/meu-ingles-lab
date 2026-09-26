const voices=[
  {id:'pf_dora',name:'Dora',lang:'Português BR · feminina',group:'pt',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/pf_dora.mp3'},
  {id:'pm_alex',name:'Alex',lang:'Português BR · masculina',group:'pt',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/pm_alex.mp3'},
  {id:'pm_santa',name:'Santa',lang:'Português BR · masculina',group:'pt',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/pm_santa.mp3'},
  {id:'af_heart',name:'Heart',lang:'Inglês EUA · feminina',group:'en',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/af_heart.mp3'},
  {id:'af_bella',name:'Bella',lang:'Inglês EUA · feminina',group:'en',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/af_bella.mp3'},
  {id:'am_michael',name:'Michael',lang:'Inglês EUA · masculina',group:'en',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/am_michael.mp3'},
  {id:'bm_george',name:'George',lang:'Inglês UK · masculina',group:'en',url:'https://raw.githubusercontent.com/KingRabbiTV/Kokoro-82M-samples/main/samples/bm_george.mp3'}
];
let currentAudio=null;

export function renderVoiceLab(root,{back}){
  root.innerHTML=`
  <section>
    <div class="head">
      <button class="back" id="voiceBack">‹</button>
      <div>
        <div class="eyebrow">Laboratório</div>
        <h2 style="margin:2px 0">Comparar vozes</h2>
        <div class="muted">Teste gratuito por amostras hospedadas</div>
      </div>
    </div>

    <article class="card voiceLabIntro">
      <b>Objetivo</b>
      <p class="muted">Escolher vozes bonitas antes de integrá-las às aulas. Aqui não há chamada ao Gemini e não há geração local pesada.</p>
    </article>

    <h3>Português brasileiro</h3>
    <div class="voiceGrid">${voices.filter(v=>v.group==='pt').map(card).join('')}</div>

    <h3 style="margin-top:24px">Inglês</h3>
    <div class="voiceGrid">${voices.filter(v=>v.group==='en').map(card).join('')}</div>

    <article class="card voiceNote">
      <b>Gemini 2.5 continua fora deste teste.</b>
      <p class="muted">Ele segue como referência de qualidade no Meu Inglês atual. Depois comparamos a voz escolhida daqui com o Gemini usando a mesma frase.</p>
    </article>
  </section>`;

  root.querySelector('#voiceBack').onclick=()=>{
    stop();
    back();
  };

  root.querySelectorAll('[data-voice]').forEach(btn=>{
    btn.onclick=()=>play(btn.dataset.voice,btn);
  });
}

function card(v){
  return `<article class="card voiceCard">
    <div>
      <div class="voiceName">${v.name}</div>
      <div class="muted">${v.lang}</div>
      <div class="voiceId">${v.id}</div>
    </div>
    <button class="voicePlay" data-voice="${v.id}">▶ Ouvir</button>
  </article>`;
}

function play(id,button){
  const v=voices.find(x=>x.id===id);
  if(!v)return;
  stop();
  currentAudio=new Audio(v.url);
  button.textContent='⏳ Carregando';
  currentAudio.oncanplay=()=>{
    button.textContent='⏸ Tocando';
    currentAudio.play().catch(()=>{
      button.textContent='▶ Tentar novamente';
    });
  };
  currentAudio.onended=()=>button.textContent='▶ Ouvir';
  currentAudio.onerror=()=>button.textContent='⚠️ Falhou';
  currentAudio.load();
}

function stop(){
  if(currentAudio){
    currentAudio.pause();
    currentAudio.currentTime=0;
    currentAudio=null;
  }
}
