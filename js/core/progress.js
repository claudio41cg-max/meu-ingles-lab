import {lessonProgress} from './state.js';
export function moduleProgress(module){if(!module.lessons.length)return 0;return Math.round(module.lessons.reduce((sum,l)=>sum+lessonProgress(l.id),0)/module.lessons.length)}
export function isLessonUnlocked(module,index){return index===0||lessonProgress(module.lessons[index-1].id)>=100}
