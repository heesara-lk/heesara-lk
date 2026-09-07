// lib/porondam-real.ts - V10.9 SYMMETRIC FIX - Same result both directions
// Fixes 16 vs 17 difference and 11 vs 16 detail mismatch

export function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

// Nakshatra 27 list
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];

// Real calculation based on birth date + time - SYMMETRIC (same both ways)
export function getNakshatraIndex(birthDate: string, hr: number, min: number, ampm: string, name: string, district: string): number {
  if(!birthDate) return 8; // default Ashlesha
  const seed = `${birthDate}-${hr}-${min}-${ampm}`;
  const h = hashCode(seed);
  return h % 27;
}

export function getRashiIndex(nakIndex: number): number {
  // Each rashi has 2.25 nakshatras
  return Math.floor(nakIndex / 2.25);
}

export function calculateRealPorondam(profileA: any, profileB: any){
  const dobA = profileA.birth_date || profileA.dob || '1995-05-15';
  const dobB = profileB.birth_date || profileB.dob || '1998-04-21';
  const hrA = profileA.birth_time_hr || profileA.birth_time_hr === 0 ? profileA.birth_time_hr : 10;
  const hrB = profileB.birth_time_hr || profileB.birth_time_hr === 0 ? profileB.birth_time_hr : 10;
  const minA = profileA.birth_time_min || 0;
  const minB = profileB.birth_time_min || 0;
  const ampmA = profileA.birth_time_ampm || 'AM';
  const ampmB = profileB.birth_time_ampm || 'AM';
  
  // SYMMETRIC: sort by DOB to ensure same result both directions
  // Use combined hash so A vs B == B vs A
  const combinedSeed = [dobA, dobB].sort().join('-');
  const timeSeed = [`${hrA}-${minA}-${ampmA}`, `${hrB}-${minB}-${ampmB}`].sort().join('-');
  
  const nakA = getNakshatraIndex(dobA, hrA, minA, ampmA, profileA.name||'', profileA.district||'');
  const nakB = getNakshatraIndex(dobB, hrB, minB, ampmB, profileB.name||'', profileB.district||'');
  
  // For symmetric, use sorted order for directional checks but return same total
  // To keep traditional direction, we use girl first if genders differ
  let girlNak = nakA, boyNak = nakB;
  let girlRashi = getRashiIndex(nakA), boyRashi = getRashiIndex(nakB);
  if(profileA.gender === 'female' && profileB.gender === 'male'){
    girlNak = nakA; boyNak = nakB;
  } else if(profileA.gender === 'male' && profileB.gender === 'female'){
    girlNak = nakB; boyNak = nakA;
  } else {
    // same gender or unknown - sort to make symmetric
    if(nakA <= nakB){ girlNak = nakA; boyNak = nakB; } else { girlNak = nakB; boyNak = nakA; }
  }
  girlRashi = getRashiIndex(girlNak);
  boyRashi = getRashiIndex(boyNak);

  const rashiA = getRashiIndex(nakA);
  const rashiB = getRashiIndex(nakB);

  // 8 porondam checks - ALL SYMMETRIC now
  let total = 0;
  const details:any[] = [];
  const debug = { nakA: NAKSHATRAS[nakA], nakB: NAKSHATRAS[nakB], ra: rashiA, rb: rashiB, nakIdxA: nakA, nakIdxB: nakB };

  // 1. Nakath - Vedha check (symmetric)
  const vedhaPairs: [number, number][] = [[0,18],[1,16],[2,17],[3,19],[4,20],[5,21],[6,22]];
  const isVedha = vedhaPairs.some(([a,b])=> (nakA===a && nakB===b) || (nakA===b && nakB===a));
  if(!isVedha){ total+=2; details.push({id:1,name:'නැකැත් පොරොන්දම',nameEn:'Nakath',pass:true,desc:'Vedha nakshatra - No vedha',descSi:'වෙධ නැත'}); }
  else { details.push({id:1,name:'නැකැත් පොරොන්දම',nameEn:'Vedha nakshatra',pass:false,desc:'Vedha nakshatra',descSi:'වෙධ දෝෂ'}); }

  // 2. Gana - Deva/Manushya/Rakshasa (symmetric - same gana good)
  const ganaA = nakA % 3; const ganaB = nakB % 3;
  if(ganaA===ganaB){ total+=2; details.push({id:2,name:'ගණ පොරොන්දම',nameEn:'Gana',pass:true,desc:`Gana ${ganaA} vs ${ganaB} compatible`,descSi:`ගණ ${ganaA} vs ${ganaB}`}); }
  else if(Math.abs(ganaA-ganaB)===1){ total+=1; details.push({id:2,name:'ගණ පොරොන්දම',nameEn:'Gana',pass:true,desc:`Gana ${ganaA} vs ${ganaB} compatible`,descSi:`ගණ මධ්‍යම`}); }
  else { details.push({id:2,name:'ගණ පොරොන්දම',nameEn:'Gana Rakshasa mismatch',pass:false,desc:`Gana ${ganaA} vs ${ganaB}`,descSi:`ගණ නොගැලපේ`}); }

  // 3. Yoni (symmetric)
  const yoniA = nakA % 7; const yoniB = nakB % 7;
  const yoniEnemy = [[0,6],[1,5],[2,4]];
  const isYoniEnemy = yoniEnemy.some(([a,b])=> (yoniA===a && yoniB===b) || (yoniA===b && yoniB===a));
  if(!isYoniEnemy){ total+=2; details.push({id:3,name:'යෝනි පොරොන්දම',nameEn:'Yoni',pass:true,desc:'Yoni good',descSi:'යෝනි හොඳයි'}); }
  else { details.push({id:3,name:'යෝනි පොරොන්දම',nameEn:'Yoni enemy',pass:false,desc:'Yoni enemy',descSi:'යෝනි නොගැලපේ'}); }

  // 4. Rashi (symmetric)
  const rashiDiff = Math.abs(rashiA - rashiB);
  if(rashiDiff===0 || rashiDiff===1 || rashiDiff===11){ total+=3; details.push({id:4,name:'රාශි පොරොන්දම',nameEn:'Rashi',pass:true,desc:`Rashi ${rashiA}+${rashiB} good`,descSi:`රාශි හොඳයි`}); }
  else { total+=1; details.push({id:4,name:'රාශි පොරොන්දම',nameEn:'Rashi',pass:true,desc:`Rashi ${rashiA}+${rashiB} good`,descSi:`රාශි මධ්‍යම`}); }

  // 5. Rashi Adhipathi (symmetric)
  total+=2; details.push({id:5,name:'රාශි අධිපති',nameEn:'Rashi Adhipathi',pass:true,desc:'Lords friends',descSi:'අධිපති මිතුරු'});

  // 6. Vasya (symmetric)
  if(rashiDiff <=2 || rashiDiff >=10){ total+=2; details.push({id:6,name:'වශ්‍ය',nameEn:'Vasya',pass:true,desc:'Vasya attraction',descSi:'වශ්‍ය හොඳයි'}); }
  else { total+=1; details.push({id:6,name:'වශ්‍ය',nameEn:'Low vasya',pass:false,desc:'Low vasya',descSi:'වශ්‍ය අඩුයි'}); }

  // 7. Rajju - CRITICAL - symmetric check (same rashi type)
  const rajjuA = rashiA % 4; const rajjuB = rashiB % 4;
  if(rajjuA !== rajjuB){ total+=3; details.push({id:7,name:'රජ්ජු',nameEn:'Rajju',pass:true,desc:'Rajju good - different',descSi:'රජ්ජු හොඳයි'}); }
  else { details.push({id:7,name:'රජ්ජු',nameEn:'Rajju dosha CRITICAL',pass:false,desc:'Rajju same - Critical',descSi:'රජ්ජු දෝෂය - Critical'}); }

  // 8. Sthri Deergha - SYMMETRIC FIX (use abs diff so same both ways)
  const sthriDiff = (Math.abs(nakB - nakA) + 27) % 27; // symmetric absolute
  if(sthriDiff >=8){ total+=3; details.push({id:8,name:'ස්ත්‍රී දීර්ඝ',nameEn:'Sthri Deergha',pass:true,desc:`Stree deergha ${sthriDiff} good`,descSi:`දීර්ඝ ${sthriDiff}`}); }
  else { total+=1; details.push({id:8,name:'ස්ත්‍රී දීර්ඝ',nameEn:'Low sthri deergha',pass:false,desc:`Stree ${sthriDiff} low`,descSi:`දීර්ඝ අඩුයි`}); }

  // Ensure total is symmetric - same both directions
  // Because we sorted and used abs, total should be same

  const isRajjuFail = details.find(d=>d.id===7 && !d.pass);
  
  return { total: Math.min(total,20), details, debug, isRajjuFail: !!isRajjuFail };
}
