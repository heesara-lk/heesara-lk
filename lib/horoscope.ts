export function calculateHoroscope(dob:string, tob:string, city:string, lat:number, lng:number){
  const h=(dob+tob+city).length%12
  const L=['Mesha','Vrushabha','Mithuna','Kataka','Simha','Kanya','Thula','Vrichchika','Dhanu','Makara','Kumbha','Meena']
  return { lagna:L[h], rashi:L[(h*7)%12], nakshatra:'Berana', lord:'Venus', lat, lng, city }
}
export function calculatePorondam(a:any,b:any){ return { score:10+((a.id+b.id).length%11), details:[] } }
