import {sceneFromScroll,scrollFromScene} from '../bwr-timing.js?v=1.1b';

// The original 32-second film, with only the mechanical assembly sped up 2×.
// Keep pellet arrival and recorded-history playback at their established pace.
export const assemblyRange=[.125,.387];
const originalDuration=32,end=.888,extent=scrollFromScene(end);
const originalTime=p=>originalDuration*scrollFromScene(p)/extent;
const begin=originalTime(assemblyRange[0]),finish=originalTime(assemblyRange[1]);
const saved=(finish-begin)/2;
export const filmDuration=originalDuration-saved;
export function filmTimeAtScene(p){
 const t=originalTime(p);
 return t<=begin?t:t<=finish?begin+(t-begin)/2:t-saved;
}
export function filmSceneAtTime(time){
 const t=Math.max(0,Math.min(filmDuration,time));
 const original=t<=begin?t:t<=begin+(finish-begin)/2?begin+(t-begin)*2:t+saved;
 return sceneFromScroll(original/originalDuration*extent);
}
