// Auto Matching Algorithm v2 - New scoring as per user request
export interface MatchScore {
  profile: any
  score: number
  breakdown: { age: number, job: number, caste: number, district: number, horoscope: number, body: number }
  porondamDetails?: any[]
}

const PORONDAM_LIST = [
  {name:'නැකත', si:'නැකත පොරොන්දම', max:1},
  {name:'ගණ', si:'ගණ පොරොන්දම', max:1},
  {name:'මහේන්ද්‍ර', si:'මහේන්ද්‍ර පොරොන්දම', max:1},
  {name:'ස්ත්‍රී දීර්ඝ', si:'ස්ත්‍රී දීර්ඝ පොරොන්දම', max:1},
  {name:'යෝනි', si:'යෝනි පොරොන්දම', max:1},
  {name:'දින', si:'දින පොරොන්දම', max:1},
  {name:'රජ්ජු', si:'රජ්ජු පොරොන්දම', max:1},
  {name:'වශ්‍ය', si:'වශ්‍ය පොරොන්දම', max:1},
  {name:'වර්ණ', si:'වර්ණ පොරොන්දම', max:1},
  {name:'වේධ', si:'වේධ පොරොන්දම', max:1},
  {name:'නදී', si:'නදී පොරොන්දම', max:1},
  {name:'ග්‍රහ මෛත්‍රී', si:'ග්‍රහ මෛත්‍රී පොරොන්දම', max:1},
  {name:'රශි', si:'රශි පොරොන්දම', max:1},
  {name:'රශි අධිපති', si:'රශි අධිපති පොරොන්දම', max:1},
  {name:'වෙද', si:'වෙද පොරොන්දම', max:1},
  {name:'ආයු', si:'ආයු පොරොන්දම', max:1},
  {name:'පක්‍ෂි', si:'පක්‍ෂි පොරොන්දම', max:1},
  {name:'කුජ දෝෂ', si:'කුජ දෝෂ පරීක්ෂාව', max:1},
  {name:'දශා', si:'දශා ගැලපීම', max:1},
  {name:'ලග්න', si:'ලග්න ගැලපීම', max:1},
]

function mockPorondamCalc(myProfile:any, otherProfile:any, minRequired:number){
  // Deterministic mock based on IDs to be consistent
  const seed = (myProfile.id.charCodeAt(0) + otherProfile.id.charCodeAt(0)) % 100
  const details = PORONDAM_LIST.map((p, i)=>{
    // Simple deterministic random: if (seed + i) % 3 !=0 then match
    const matched = (seed + i*7) % 4 !== 0 // 75% match rate
    return { ...p, matched, score: matched ? 1 : 0 }
  })
  const totalMatched = details.filter(d=>d.matched).length
  return { total: totalMatched, details, passed: totalMatched >= minRequired }
}

export function calculateMatchScore(myProfile: any, myExpectation: any, otherProfile: any): MatchScore {
  let score = 0
  const breakdown = { age: 0, job: 0, caste: 0, district: 0, horoscope: 0, body: 0 }
  let porondamDetails:any[] = []

  // 1. Age 20
  if(myExpectation && otherProfile.dob){
    const otherAge = new Date().getFullYear() - new Date(otherProfile.dob).getFullYear()
    if(otherAge >= myExpectation.age_min && otherAge <= myExpectation.age_max){
      breakdown.age = 20; score+=20
    } else if(Math.abs(otherAge - (myExpectation.age_min+myExpectation.age_max)/2) <= 3){
      breakdown.age = 12; score+=12
    } else if(Math.abs(otherAge - (myExpectation.age_min+myExpectation.age_max)/2) <= 7){
      breakdown.age = 5; score+=5
    }
  } else { breakdown.age = 10; score+=10 }

  // 2. Job 20
  if(myExpectation?.job_pref_main && myExpectation.job_pref_main !== 'any'){
    if(otherProfile.job_main === myExpectation.job_pref_main){ breakdown.job = 20; score+=20 }
    else { breakdown.job = 3; score+=3 }
  } else { breakdown.job = 15; score+=15 }

  // 3. Caste 10 - if both unnecessary = full marks
  const myCasteUnnecessary = !myExpectation?.caste_pref_main || myExpectation.caste_pref_main==='any' || myExpectation.caste_pref_main==='අනවශ්‍යයි / නොදනී'
  const otherCasteUnnecessary = !otherProfile.caste_main || otherProfile.caste_main==='අනවශ්‍යයි / නොදනී'
  if(myCasteUnnecessary && otherCasteUnnecessary){
    breakdown.caste = 10; score+=10 // both don't care = full
  } else if(myCasteUnnecessary || otherCasteUnnecessary){
    breakdown.caste = 8; score+=8 // one doesn't care
  } else if(myExpectation?.caste_pref_main && otherProfile.caste_main === myExpectation.caste_pref_main){
    breakdown.caste = 10; score+=10
  } else {
    breakdown.caste = 2; score+=2
  }

  // 4. Horoscope 30 + porondam details
  if(myExpectation?.horoscope_required){
    const porondamResult = mockPorondamCalc(myProfile, otherProfile, myExpectation.min_porondam || 10)
    porondamDetails = porondamResult.details
    // Score based on matched count: 20 porondam = 30 points max
    breakdown.horoscope = Math.floor((porondamResult.total / 20) * 30)
    score += breakdown.horoscope
  } else {
    breakdown.horoscope = 20; score+=20
    porondamDetails = PORONDAM_LIST.map(p=>({...p, matched:true, score:1}))
  }

  // 5. District 10
  if(myExpectation?.district_pref_en){
    if(otherProfile.district_en === myExpectation.district_pref_en){ breakdown.district = 10; score+=10 }
    else { breakdown.district = 3; score+=3 }
  } else { breakdown.district = 7; score+=7 }

  // 6. Body features 10 (height 4 + body_type 3 + skin 3)
  let bodyScore = 0
  if(myExpectation?.height_min && otherProfile.height_cm){
    if(otherProfile.height_cm >= myExpectation.height_min) bodyScore+=4
    else if(otherProfile.height_cm >= myExpectation.height_min -5) bodyScore+=2
  } else bodyScore+=2
  // body type and skin - for now give partial if exists
  if(otherProfile.body_type) bodyScore+=3
  else bodyScore+=1
  if(otherProfile.skin_color) bodyScore+=3
  else bodyScore+=1
  breakdown.body = Math.min(10, bodyScore)
  score += breakdown.body

  return { profile: otherProfile, score: Math.min(100, score), breakdown, porondamDetails }
}

export function getTopMatches(myProfile:any, myExpectation:any, allProfiles:any[], limit=10): MatchScore[] {
  const candidates = allProfiles.filter((p:any)=> p.id!==myProfile.id && p.gender!==myProfile.gender)
  const scored = candidates.map((p:any)=> calculateMatchScore(myProfile, myExpectation, p))
  scored.sort((a,b)=> b.score - a.score)
  return scored.slice(0, limit)
}

export { PORONDAM_LIST }
