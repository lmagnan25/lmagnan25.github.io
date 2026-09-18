// Preserve the existing scene choreography while shortening native scroll.
// Every section advances 1.5x faster; neutronics gets a further 3x reduction.
export const timing={
 originalScrollVh:1400,
 speed:1.5,
 neutronStart:.435,
 neutronEnd:.875,
 neutronCompression:3,
 vesselFade:[.70,.77],
 neutronFade:[.79,.875],
 linksFade:[.895,.955]
};
const start=timing.neutronStart,end=timing.neutronEnd,factor=timing.neutronCompression;
const saved=(end-start)*(1-1/factor),length=1-saved;
export const scrollDistanceVh=timing.originalScrollVh*length/timing.speed;
export function scrollFromScene(p){
 const distance=p<=start?p:p<=end?start+(p-start)/factor:p-saved;
 return distance/length;
}
export function sceneFromScroll(progress){
 const distance=Math.max(0,Math.min(1,progress))*length;
 return distance<=start?distance:distance<=start+(end-start)/factor?start+(distance-start)*factor:distance+saved;
}
