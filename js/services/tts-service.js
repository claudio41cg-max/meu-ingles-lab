const memory=new Map();
export function speak(text,lang='en-US'){
 const key=lang+'|'+text;
 if(!('speechSynthesis' in window))return false;
 const play=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=lang.startsWith('en')?.86:.94;speechSynthesis.speak(u)};
 memory.set(key,play);play();return true;
}
