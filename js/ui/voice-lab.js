import {previewGeminiModel} from '../services/tts-service.js?v=8';
const voices=[
  {id:'pf_dora',name:'Dora',lang:'Português BR · feminina',group:'pt',url:'https://raw.githubusercontent.com/alexlivre/kokoro-82m-tts/main/test_pf_dora.mp3'},
  {id:'pm_alex',name:'Alex',lang:'Português BR · masculina',group:'pt',url:'https://raw.githubusercontent.com/alexlivre/kokoro-82m-tts/main/test_pm_alex.mp3'},
  {id:'pm_santa',name:'Santa',lang:'Português BR · masculina',group:'pt',url:'https://raw.githubusercontent.com/alexlivre/kokoro-82m-tts/main/test_pm_santa.mp3'},
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
        <div class="muted">Português real nas vozes BR · inglês nas vozes EN</div>
      </div>
    </div>

    <article class="card voiceLabIntro">
      <b>Objetivo</b>
      <p class="muted">Comparar qualidade de voz antes de mudar o curso. As amostras Kokoro continuam abaixo e o novo teste Gemini compara 2.5 x 3.8 Flash-Lite com cache separado.</p>
    </article>

    <article class="card voiceCompare">
      <div class="eyebrow">Teste Gemini TTS</div>
      <h3 style="margin:5px 0 6px">2.5 × 3.8 Flash-Lite</h3>
      <p class="muted">A primeira reprodução de cada modelo pode usar a API. As repetições ficam no cache.</p>
      <div class="compareBlock">
        <b>Português</b>
        <div class="compareButtons">
          <button class="voicePlay geminiTest" data-model="gemini-2.5-flash-preview-tts" data-lang="pt-BR">▶ 2.5</button>
          <button class="voicePlay geminiTest" data-model="gemini-3.8-flash-lite-tts" data-lang="pt-BR">▶ 3.8 Lite</button>
        </div>
        <small class="muted">Frase: “Agora fale em voz alta. Repita com calma.”</small>
      </div>
      <div class="compareBlock">
        <b>Inglês</b>
        <div class="compareButtons">
          <button class="voicePlay geminiTest" data-model="gemini-2.5-flash-preview-tts" data-lang="en-US">▶ 2.5</button>
          <button class="voicePlay geminiTest" data-model="gemini-3.8-flash-lite-tts" data-lang="en-US">▶ 3.8 Lite</button>
        </div>
        <small class="muted">Frase: “Hello! How are you today?”</small>
      </div>
      <div id="geminiTestStatus" class="muted" style="margin-top:10px"></div>
    </article>

    <h3>Português brasileiro</h3>
    <div class="voiceGrid">${voices.filter(v=>v.group==='pt').map(card).join('')}</div>

    <h3 style="margin-top:24px">Inglês</h3>
    <div class="voiceGrid">${voices.filter(v=>v.group==='en').map(card).join('')}</div>

    <article class="card voiceNote">
      <b>Kokoro continua apenas como laboratório.</b>
      <p class="muted">O curso usa Gemini + cache. As amostras abaixo servem somente para referência de timbre.</p>
    </article>
  </section>`;

  root.querySelector('#voiceBack').onclick=()=>{
    stop();
    back();
  };

  root.querySelectorAll('[data-voice]').forEach(btn=>{
    btn.onclick=()=>play(btn.dataset.voice,btn);
  });

  root.querySelectorAll('.geminiTest').forEach(btn=>{
    btn.onclick=async()=>{
      const status=root.querySelector('#geminiTestStatus');
      const lang=btn.dataset.lang;
      const model=btn.dataset.model;
      const text=lang==='pt-BR'
        ?'Agora fale em voz alta. Repita com calma.'
        :'Hello! How are you today?';
      const voice=lang==='pt-BR'?'Aoede':'Achird';
      root.querySelectorAll('.geminiTest').forEach(b=>b.disabled=true);
      btn.textContent='⏳ Gerando...';
      if(status)status.textContent='Preparando '+(model.includes('3.8')?'Gemini 3.8 Flash-Lite':'Gemini 2.5')+'...';
      try{
        const ok=await previewGeminiModel({text,lang,voice,model});
        btn.textContent=ok?'▶ Ouvir de novo':'⚠️ Falhou';
        if(status)status.textContent=ok
          ?'Pronto. Toque novamente para comparar.'
          :'Não foi possível gerar esse teste.';
      }catch(e){
        btn.textContent='⚠️ Falhou';
        if(status)status.textContent='Erro no teste: '+String(e?.message||e);
      }finally{
        root.querySelectorAll('.geminiTest').forEach(b=>b.disabled=false);
      }
    };
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
