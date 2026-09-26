export const ENGLISH_VOICE={provider:'kokoro',voice:'af_heart',name:'Heart',lang:'en-US'};

export const PROFESSOR_VOICES={
  tranquilo:{provider:'kokoro',voice:'pf_dora',name:'Dora',lang:'pt-BR'},
  doideira:{provider:'kokoro',voice:'pm_alex',name:'Alex',lang:'pt-BR'},
  hard:{provider:'kokoro',voice:'pm_santa',name:'Santa',lang:'pt-BR'}
};

export function getProfessorVoice(professor){
  return PROFESSOR_VOICES[professor]||PROFESSOR_VOICES.tranquilo;
}

const memory=new Map();
let kokoroPromise=null;
let activeAudio=null;
let requestSeq=0;

async function getKokoro(){
  if(!kokoroPromise){
    kokoroPromise=(async()=>{
      const {KokoroTTS}=await import('https://esm.sh/kokoro-js');
      return KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{
        dtype:'q8',
        device:'wasm'
      });
    })().catch(err=>{
      kokoroPromise=null;
      throw err;
    });
  }
  return kokoroPromise;
}

export function prepareVoices(){
  return getKokoro().then(()=>true).catch(err=>{
    console.warn('Falha ao preparar Kokoro.',err);
    return false;
  });
}

function stopAllAudio(){
  requestSeq++;
  if(activeAudio){
    activeAudio.pause();
    activeAudio.currentTime=0;
    activeAudio=null;
  }
  if('speechSynthesis' in window)speechSynthesis.cancel();
  return requestSeq;
}

async function speakKokoro(text,voiceId,cachePrefix){
  const mySeq=stopAllAudio();
  const key=cachePrefix+'|'+text;
  try{
    let url=memory.get(key);
    if(!url){
      const tts=await getKokoro();
      if(mySeq!==requestSeq)return false;
      const raw=await tts.generate(text,{voice:voiceId});
      if(mySeq!==requestSeq)return false;
      const blob=raw.toBlob();
      url=URL.createObjectURL(blob);
      memory.set(key,url);
    }
    if(mySeq!==requestSeq)return false;
    const audio=new Audio(url);
    activeAudio=audio;
    audio.onended=()=>{if(activeAudio===audio)activeAudio=null;};
    await audio.play();
    return true;
  }catch(err){
    console.warn('Kokoro indisponível.',err);
    return false;
  }
}

function speakBrowser(text,lang='en-US'){
  if(!('speechSynthesis' in window))return false;
  stopAllAudio();
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang;
  u.rate=lang.startsWith('en')?.86:.94;
  speechSynthesis.speak(u);
  return true;
}

export async function speak(text,lang='en-US'){
  if(!text)return false;
  if(lang.startsWith('en')){
    return speakKokoro(text,ENGLISH_VOICE.voice,'heart');
  }
  return false;
}

export async function speakPortugueseDora(text){
  if(!text)return false;
  const voice=PROFESSOR_VOICES.doideira;
  return speakKokoro(text,voice.voice,'alex-question');
}
