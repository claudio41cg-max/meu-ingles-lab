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

    <article class="card voiceCompare" id="audexumLab">
      <div class="eyebrow">Audexum TTS · laboratório</div>
      <h3 style="margin:5px 0 6px">Audexum × Gemini</h3>
      <p class="muted">A chave não vai para o GitHub. Ela fica somente nesta sessão do navegador enquanto você testa.</p>

      <div style="display:grid;gap:10px">
        <label>
          <small class="muted">Chave Audexum</small>
          <div style="display:flex;gap:8px;margin-top:5px">
            <input id="audexumKey" type="password" placeholder="sk_live_..." style="flex:1;min-width:0">
            <button class="secondary" id="audexumSaveKey">Usar nesta sessão</button>
          </div>
        </label>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label><small class="muted">Idioma</small>
            <select id="audexumLang" style="width:100%;margin-top:5px">
              <option value="en">Inglês</option><option value="pt">Português</option>
              <option value="es">Espanhol</option><option value="fr">Francês</option>
              <option value="de">Alemão</option><option value="it">Italiano</option>
              <option value="ja">Japonês</option><option value="ko">Coreano</option>
              <option value="ar">Árabe</option><option value="hi">Hindi</option>
              <option value="bg">Búlgaro</option><option value="ru">Russo</option>
            </select>
          </label>
          <label><small class="muted">Voz V2 Studio</small>
            <select id="audexumVoice" style="width:100%;margin-top:5px">
              <option>F1</option><option>F2</option><option>F3</option><option>F4</option><option>F5</option>
              <option>M1</option><option>M2</option><option>M3</option><option>M4</option><option>M5</option>
            </select>
          </label>
        </div>

        <label><small class="muted">Frase de teste</small>
          <textarea id="audexumText" rows="3" style="width:100%;margin-top:5px">Hello! How are you today?</textarea>
        </label>

        <div class="compareButtons">
          <button class="voicePlay" id="audexumPlay">▶ Audexum</button>
          <button class="voicePlay" id="audexumGemini">▶ Gemini</button>
          <button class="secondary" id="audexumVoices">Carregar vozes</button>
        </div>
        <div id="audexumStatus" class="muted"></div>
      </div>
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

  const audexumKey=root.querySelector('#audexumKey');
  const audexumStatus=root.querySelector('#audexumStatus');
  const savedKey=sessionStorage.getItem('meuInglesLabAudexumKey')||'';
  if(savedKey)audexumKey.value=savedKey;

  root.querySelector('#audexumSaveKey').onclick=()=>{
    const key=audexumKey.value.trim();
    if(!key){sessionStorage.removeItem('meuInglesLabAudexumKey');audexumStatus.textContent='Chave removida desta sessão.';return}
    sessionStorage.setItem('meuInglesLabAudexumKey',key);
    audexumStatus.textContent='Chave pronta apenas nesta sessão. Nada foi salvo no GitHub.';
  };

  root.querySelector('#audexumVoices').onclick=async()=>{
    const key=(audexumKey.value.trim()||sessionStorage.getItem('meuInglesLabAudexumKey')||'');
    if(!key){audexumStatus.textContent='Informe a chave Audexum primeiro.';return}
    audexumStatus.textContent='Consultando vozes da Audexum...';
    try{
      const r=await fetch('https://bewdladkzgceerhkshbt.supabase.co/functions/v1/audexum-lab-proxy',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'voices',apiKey:key})
      });
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data?.detail||data?.error||('HTTP '+r.status));
      const list=Array.isArray(data)?data:(data.voices||[]);
      const select=root.querySelector('#audexumVoice');
      const ids=[...new Set(list.map(v=>v.id||v.voice||v.voice_id).filter(Boolean))];
      if(ids.length){
        select.innerHTML=ids.map(id=>'<option>'+String(id)+'</option>').join('');
        audexumStatus.textContent=ids.length+' vozes recebidas da Audexum.';
      }else audexumStatus.textContent='A Audexum respondeu, mas não encontrei IDs de voz na resposta.';
    }catch(e){
      audexumStatus.textContent='Não consegui listar as vozes: '+String(e?.message||e);
    }
  };

  root.querySelector('#audexumPlay').onclick=async()=>{
    const key=(audexumKey.value.trim()||sessionStorage.getItem('meuInglesLabAudexumKey')||'');
    const text=root.querySelector('#audexumText').value.trim();
    const lang=root.querySelector('#audexumLang').value;
    const voiceId=root.querySelector('#audexumVoice').value;
    if(!key){audexumStatus.textContent='Informe a chave Audexum primeiro.';return}
    if(!text){audexumStatus.textContent='Digite uma frase para testar.';return}
    sessionStorage.setItem('meuInglesLabAudexumKey',key);
    audexumStatus.textContent='Gerando Audexum · '+voiceId+' · '+lang+'...';
    try{
      stop();
      const r=await fetch('https://bewdladkzgceerhkshbt.supabase.co/functions/v1/audexum-lab-proxy',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'synthesize',apiKey:key,text,backend:'supertonic',voice:voiceId,lang,format:'mp3',speed:1.0,steps:8})
      });
      if(!r.ok){
        let msg='HTTP '+r.status;
        try{const j=await r.json();msg=j.detail||j.message||j.error||msg}catch{}
        throw new Error(msg);
      }
      const blob=await r.blob();
      const url=URL.createObjectURL(blob);
      currentAudio=new Audio(url);
      currentAudio.onended=()=>{URL.revokeObjectURL(url);audexumStatus.textContent='Audexum concluída. Agora compare com Gemini.'};
      currentAudio.onerror=()=>{URL.revokeObjectURL(url);audexumStatus.textContent='Recebi o áudio, mas o navegador não conseguiu reproduzir.'};
      await currentAudio.play();
      audexumStatus.textContent='▶ Tocando Audexum · '+voiceId+' · '+lang;
    }catch(e){
      audexumStatus.textContent='Teste Audexum falhou: '+String(e?.message||e);
    }
  };

  root.querySelector('#audexumGemini').onclick=async()=>{
    const text=root.querySelector('#audexumText').value.trim();
    const lang=root.querySelector('#audexumLang').value;
    if(!text){audexumStatus.textContent='Digite uma frase para testar.';return}
    if(!['en','pt'].includes(lang)){
      audexumStatus.textContent='Neste Lab, a comparação Gemini está pronta para inglês e português. A Audexum pode continuar sendo testada nos outros idiomas.';
      return;
    }
    audexumStatus.textContent='Gerando a mesma frase no Gemini...';
    const ok=await previewGeminiModel({
      text,
      lang:lang==='pt'?'pt-BR':'en-US',
      voice:lang==='pt'?'Aoede':'Achird',
      model:'gemini-3.8-flash-lite-tts'
    });
    audexumStatus.textContent=ok?'Gemini concluído. Compare o timbre com a Audexum.':'O Gemini não conseguiu gerar este teste.';
  };
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
