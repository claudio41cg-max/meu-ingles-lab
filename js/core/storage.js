const PREFIX='meuIngles2:';

export function getStorage(key,fallback=null){
  try{
    const raw=localStorage.getItem(PREFIX+key);
    return raw==null?fallback:JSON.parse(raw);
  }catch(error){
    console.warn('Meu Inglês 2.0 storage read',key,error);
    return fallback;
  }
}

export function setStorage(key,value){
  try{
    localStorage.setItem(PREFIX+key,JSON.stringify(value));
    return true;
  }catch(error){
    console.warn('Meu Inglês 2.0 storage write',key,error);
    return false;
  }
}

export function removeStorage(key){
  try{
    localStorage.removeItem(PREFIX+key);
    return true;
  }catch(error){
    console.warn('Meu Inglês 2.0 storage remove',key,error);
    return false;
  }
}

/* Compatibilidade com a base já criada. */
export const read=getStorage;
export function write(key,value){
  setStorage(key,value);
  return value;
}
