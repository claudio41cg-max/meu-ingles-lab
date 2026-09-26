import {getStorage,setStorage} from './storage.js';

const DEFAULT={
  name:'Cláudio',
  professorAtual:'tranquilo',
  nivelAtual:'pre-a1',
  licaoAtual:'hello-1',
  lessonProgress:{},
  progressoAluno:{
    licoesConcluidas:[],
    pontos:0,
    ofensiva:0,
    ultimoEstudo:null
  }
};

let state=hydrate(getStorage('state',{}));

function hydrate(saved){
  return {
    ...DEFAULT,
    ...saved,
    lessonProgress:{...DEFAULT.lessonProgress,...(saved?.lessonProgress||{})},
    progressoAluno:{
      ...DEFAULT.progressoAluno,
      ...(saved?.progressoAluno||{}),
      licoesConcluidas:[...(saved?.progressoAluno?.licoesConcluidas||[])]
    }
  };
}

function persist(){
  setStorage('state',state);
  return state;
}

export function getState(){return state}

export function updateState(patch){
  state={
    ...state,
    ...patch,
    progressoAluno:patch?.progressoAluno
      ? {...state.progressoAluno,...patch.progressoAluno}
      : state.progressoAluno
  };
  return persist();
}

export function setProfessorAtual(professor){
  const valid=['tranquilo','doideira','hard'];
  if(!valid.includes(professor))return state.professorAtual;
  state.professorAtual=professor;
  persist();
  return professor;
}

export function setNivelAtual(nivel){
  state.nivelAtual=nivel;
  persist();
  return nivel;
}

export function setLicaoAtual(id){
  state.licaoAtual=id;
  persist();
  return id;
}

export function setLessonProgress(id,value){
  const progress=Math.max(0,Math.min(100,Number(value)||0));
  state.lessonProgress={...state.lessonProgress,[id]:progress};
  if(progress>=100&&!state.progressoAluno.licoesConcluidas.includes(id)){
    state.progressoAluno={
      ...state.progressoAluno,
      licoesConcluidas:[...state.progressoAluno.licoesConcluidas,id],
      pontos:state.progressoAluno.pontos+30,
      ultimoEstudo:new Date().toISOString()
    };
  }
  persist();
}

export function lessonProgress(id){return state.lessonProgress[id]||0}

export function addPontos(valor){
  state.progressoAluno={...state.progressoAluno,pontos:Math.max(0,state.progressoAluno.pontos+(Number(valor)||0))};
  persist();
  return state.progressoAluno.pontos;
}

export function setOfensiva(valor){
  state.progressoAluno={...state.progressoAluno,ofensiva:Math.max(0,Number(valor)||0)};
  persist();
  return state.progressoAluno.ofensiva;
}
