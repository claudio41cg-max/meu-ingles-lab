const PREFIX='meuIngles2:';
export function read(key,fallback=null){try{const raw=localStorage.getItem(PREFIX+key);return raw==null?fallback:JSON.parse(raw)}catch{return fallback}}
export function write(key,value){localStorage.setItem(PREFIX+key,JSON.stringify(value));return value}
