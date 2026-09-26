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
export function speak(text,lang='en-US'){
 const key=lang+'|'+text;
 if(!('speechSynthesis' in window))return false;
 const play=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=lang.startsWith('en')?.86:.94;speechSynthesis.speak(u)};
 memory.set(key,play);play();return true;
}
