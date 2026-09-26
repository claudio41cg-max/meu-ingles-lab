export const ENGLISH_VOICE={provider:'kokoro',voice:'af_bella',name:'Bella',lang:'en-US'};

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

async function getKokoro(){
  if(!kokoroPromise){
    kokoroPromise=(async()=>{
      const {KokoroTTS}=await import('https://esm.sh/kokoro-js');
      return KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{
        dtype:'q8',
        device:'wasm'
      });
    })();
  }
  return kokoroPromise;
}

async function speakKokoro(text,voiceId,cachePrefix){
  const key=cachePrefix+'|'+text;
  try{
    if(activeAudio){
      activeAudio.pause();
      activeAudio=null;
    }
    let url=memory.get(key);
    if(!url){
      const tts=await getKokoro();
      const raw=await tts.generate(text,{voice:voiceId});
      const blob=raw.toBlob();
      url=URL.createObjectURL(blob);
      memory.set(key,url);
    }
    activeAudio=new Audio(url);
    await activeAudio.play();
    return true;
  }catch(err){
    console.warn('Kokoro indisponível, usando voz do navegador.',err);
    return false;
  }
}

function speakBrowser(text,lang='en-US'){
  if(!('speechSynthesis' in window))return false;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang;
  u.rate=lang.startsWith('en')?.86:.94;
  speechSynthesis.speak(u);
  return true;
}

export async function speak(text,lang='en-US'){
  if(!text)return false;
  if(lang.startsWith('en')){
    const ok=await speakKokoro(text,ENGLISH_VOICE.voice,'bella');
    return ok||speakBrowser(text,'en-US');
  }
  return speakBrowser(text,lang);
}

export async function speakPortugueseDora(text){
  if(!text)return false;
  const voice=PROFESSOR_VOICES.tranquilo;
  const ok=await speakKokoro(text,voice.voice,'dora');
  return ok||speakBrowser(text,'pt-BR');
}
