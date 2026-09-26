const TTS_URL='https://meu-ingles-livid.vercel.app/api/gemini-tts';
const DB_NAME='meuIngles2TTSCacheV1';
const STORE='voices';
const STATS_KEY='meuIngles2TTSStatsV1';
const DEFAULT_MODEL='gemini-3.8-flash-lite-tts';
const FALLBACK_MODEL='gemini-2.5-flash-preview-tts';

export const ENGLISH_VOICE={provider:'gemini-3.8-flash-lite',voice:'Achird',name:'Achird',lang:'en-US'};
export const PORTUGUESE_VOICE={provider:'gemini-3.8-flash-lite',voice:'Aoede',name:'Aoede',lang:'pt-BR'};

const mem=new Map();
const pending=new Map();
let dbPromise=null;
let audioCtx=null;
let currentSource=null;
let seq=0;

function cleanText(text){
  return String(text||'').replace(/\s+/g,' ').trim();
}

function cacheKey(text,lang,voice,model=DEFAULT_MODEL){
  return [model,voice,lang,cleanText(text)].join('|');
}

function openDb(){
  if(!('indexedDB' in window))return Promise.resolve(null);
  if(dbPromise)return dbPromise;
  dbPromise=new Promise(resolve=>{
    try{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
      req.onblocked=()=>resolve(null);
    }catch{resolve(null)}
  });
  return dbPromise;
}

async function dbGet(key){
  const db=await openDb();
  if(!db)return null;
  return new Promise(resolve=>{
    try{
      const tx=db.transaction(STORE,'readonly');
      const req=tx.objectStore(STORE).get(key);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>resolve(null);
    }catch{resolve(null)}
  });
}

async function dbPut(key,data){
  const db=await openDb();
  if(!db||!data?.audio)return false;
  return new Promise(resolve=>{
    try{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put({
        audio:data.audio,
        sample_rate:data.sample_rate||24000,
        voice:data.voice||'',
        model:data.model||DEFAULT_MODEL,
        saved_at:Date.now()
      },key);
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>resolve(false);
      tx.onabort=()=>resolve(false);
    }catch{resolve(false)}
  });
}

async function cached(key){
  if(mem.has(key))return mem.get(key);
  const saved=await dbGet(key);
  if(saved?.audio){
    mem.set(key,saved);
    return saved;
  }
  return null;
}

function estimate(data,text){
  let seconds=0;
  try{
    const bytes=Math.floor(String(data?.audio||'').length*3/4);
    seconds=bytes/(2*(Number(data?.sample_rate)||24000));
  }catch{}
  const meta=data?.usageMetadata||data?.usage_metadata||{};
  const inputTokens=Number(meta.promptTokenCount||meta.prompt_token_count)||Math.max(1,Math.ceil(cleanText(text).length/4));
  const outputTokens=Number(meta.candidatesTokenCount||meta.candidates_token_count)||Math.max(0,Math.round(seconds*25));
  return {
    seconds,
    inputTokens,
    outputTokens,
    tokens:inputTokens+outputTokens,
    usd:inputTokens*((String(data?.model||'').includes('3.8-flash-lite')?0.50:0.50)/1e6)+
        outputTokens*((String(data?.model||'').includes('3.8-flash-lite')?6.00:10.00)/1e6)
  };
}

function loadStats(){
  try{
    const x=JSON.parse(localStorage.getItem(STATS_KEY)||'{}');
    return {
      generated:Number(x.generated)||0,
      cache:Number(x.cache)||0,
      tokens:Number(x.tokens)||0,
      usd:Number(x.usd)||0,
      savedTokens:Number(x.savedTokens)||0,
      savedUsd:Number(x.savedUsd)||0
    };
  }catch{
    return {generated:0,cache:0,tokens:0,usd:0,savedTokens:0,savedUsd:0};
  }
}

function saveStats(s){
  try{localStorage.setItem(STATS_KEY,JSON.stringify(s))}catch{}
  window.dispatchEvent(new CustomEvent('meu-ingles-2-tts-stats',{detail:s}));
}

function record(kind,data,text){
  const e=estimate(data,text);
  const s=loadStats();
  if(kind==='api'){
    s.generated++;
    s.tokens+=e.tokens;
    s.usd+=e.usd;
  }else{
    s.cache++;
    s.savedTokens+=e.tokens;
    s.savedUsd+=e.usd;
  }
  saveStats(s);
}

export function getAudioStats(){
  return loadStats();
}

function ensureCtx(){
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)throw new Error('AudioContext indisponível');
  if(!audioCtx||audioCtx.state==='closed')audioCtx=new C();
  return audioCtx;
}

async function unlock(){
  const ctx=ensureCtx();
  if(ctx.state==='suspended'){
    try{await ctx.resume()}catch{}
  }
  return ctx;
}

function stopCurrent(){
  seq++;
  if(currentSource){
    try{currentSource.onended=null}catch{}
    try{currentSource.stop()}catch{}
    try{currentSource.disconnect()}catch{}
    currentSource=null;
  }
  try{window.speechSynthesis?.cancel()}catch{}
}

function b64ToFloat32(b64){
  const bin=atob(String(b64||''));
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const count=Math.floor(bytes.byteLength/2);
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const out=new Float32Array(count);
  for(let i=0;i<count;i++)out[i]=Math.max(-1,Math.min(1,view.getInt16(i*2,true)/32768));
  return out;
}

async function playPCM(data,mySeq){
  const ctx=await unlock();
  if(mySeq!==seq)return false;
  const samples=b64ToFloat32(data.audio);
  if(!samples.length)return false;
  const buf=ctx.createBuffer(1,samples.length,Number(data.sample_rate)||24000);
  buf.copyToChannel(samples,0);
  const src=ctx.createBufferSource();
  src.buffer=buf;
  src.connect(ctx.destination);
  currentSource=src;
  await new Promise((resolve,reject)=>{
    src.onended=resolve;
    try{src.start()}catch(e){reject(e)}
  });
  if(currentSource===src)currentSource=null;
  try{src.disconnect()}catch{}
  return true;
}

async function requestVoice(text,lang,voice,model=DEFAULT_MODEL){
  const r=await fetch(TTS_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      text,
      lang,
      voice,
      model,
      style:lang==='en-US'
        ?'Natural American English, very clear, warm, human and conversational. Precise beginner-friendly pronunciation.'
        :'Português brasileiro natural, humano, claro e conversacional. Fale como professor, sem voz de robô.'
    })
  });
  const raw=await r.text();
  let data=null;
  try{data=JSON.parse(raw)}catch{}
  if(!r.ok)throw new Error(data?.message||data?.error||('HTTP '+r.status));
  if(!data?.audio)throw new Error('Gemini não devolveu áudio');
  return data;
}

async function speakGemini(text,lang,voice,model=DEFAULT_MODEL){
  text=cleanText(text);
  if(!text)return false;
  stopCurrent();
  const mySeq=seq;
  await unlock();

  const key=cacheKey(text,lang,voice,model);
  let data=await cached(key);

  if(data){
    record('cache',data,text);
    return playPCM(data,mySeq);
  }

  let job=pending.get(key);
  if(!job){
    job=(async()=>{
      try{
        return await requestVoice(text,lang,voice,model);
      }catch(primaryError){
        if(model!==DEFAULT_MODEL)throw primaryError;
        console.warn('Gemini 3.8 Flash-Lite falhou; tentando 2.5.',primaryError);
        const fallbackKey=cacheKey(text,lang,voice,FALLBACK_MODEL);
        const fallbackCached=await cached(fallbackKey);
        if(fallbackCached)return fallbackCached;
        const fallbackData=await requestVoice(text,lang,voice,FALLBACK_MODEL);
        mem.set(fallbackKey,fallbackData);
        await dbPut(fallbackKey,fallbackData);
        return fallbackData;
      }
    })()
      .then(async d=>{
        mem.set(cacheKey(text,lang,voice,d?.model||model),d);
        await dbPut(cacheKey(text,lang,voice,d?.model||model),d);
        return d;
      })
      .finally(()=>pending.delete(key));
    pending.set(key,job);
  }

  try{
    data=await job;
    if(mySeq!==seq)return false;
    record('api',data,text);
    return playPCM(data,mySeq);
  }catch(err){
    console.warn('Gemini TTS 2.0',err);
    window.dispatchEvent(new CustomEvent('meu-ingles-2-tts-error',{detail:{message:String(err?.message||err)}}));
    return false;
  }
}

export function speak(text,lang='en-US'){
  const voice=lang.startsWith('en')?ENGLISH_VOICE.voice:PORTUGUESE_VOICE.voice;
  return speakGemini(text,lang.startsWith('en')?'en-US':'pt-BR',voice,DEFAULT_MODEL);
}

export function speakPortuguesePrompt(text){
  return speakGemini(text,'pt-BR',PORTUGUESE_VOICE.voice,DEFAULT_MODEL);
}

export function stopVoice(){
  stopCurrent();
}

export function prepareVoices(){
  openDb();
  return Promise.resolve(true);
}


export async function previewGeminiModel({text,lang='pt-BR',voice,model}){
  const useLang=String(lang).toLowerCase().startsWith('en')?'en-US':'pt-BR';
  const useVoice=voice||(useLang==='en-US'?ENGLISH_VOICE.voice:PORTUGUESE_VOICE.voice);
  const useModel=model||DEFAULT_MODEL;
  return speakGemini(text,useLang,useVoice,useModel);
}
