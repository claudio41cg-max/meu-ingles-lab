import {read,write} from './storage.js';
const DEFAULT={name:'Cláudio',level:'Pre-A1',lessonProgress:{}};
let state={...DEFAULT,...read('state',{})};
export function getState(){return state}
export function setLessonProgress(id,value){state.lessonProgress={...state.lessonProgress,[id]:Math.max(0,Math.min(100,value))};write('state',state)}
export function lessonProgress(id){return state.lessonProgress[id]||0}
