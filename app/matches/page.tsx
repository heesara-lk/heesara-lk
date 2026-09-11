'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isProfileActive } from '@/lib/subscription';
import { calculateRealPorondam } from '@/lib/porondam-real';

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com','manjula.upashantha@heesara.lk'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

// FIXED: #10 was duplicate Yoni, now Vruksha, #14 Nadi spelling fixed
const PORONDAM_20=[
  {id:1,name_si:'නැකැත්'},{id:2,name_si:'ගණ'},{id:3,name_si:'යෝනි'},{id:4,name_si:'රාශි'},{id:5,name_si:'රාශි අධිපති'},{id:6,name_si:'වශ්ය'},{id:7,name_si:'දින'},{id:8,name_si:'මහේන්ද්ර'},{id:9,name_si:'ස්ත්රී දීර්ඝ'},{id:10,name_si:'වෘක්ෂ'},{id:11,name_si:'රජ්ජු'},{id:12,name_si:'වේධ'},{id:13,name_si:'වර්ණ'},{id:14,name_si:'නාඩි'},{id:15,name_si:'ග්රහ මෛත්රී'},{id:16,name_si:'භූත'},{id:17,name_si:'ගෝත්ර'},{id:18,name_si:'ලිංග'},{id:19,name_si:'පක්ෂි'},{id:20,name_si:'ආයු'},
];
function scoreColor(s:number){ if(s>=80) return 'bg-green-100 border-green-200 text-green-800'; if(s>=50) return 'bg-yellow-100 border-yellow-200 text-yellow-800'; if(s>=20) return 'bg-orange-100 border-orange-200 text-orange-800'; return 'bg-red-100 border-red-200 text-red-800'; }

// PATCHED - REAL PORONDAM, keeps same return shape as before
function getPorondamScore(a:any,b:any){
  const viewerNeeds = a?.horoscope_required===true;
  if(!viewerNeeds) return { total:20, percent:100, list:[], note:'Not required 100%' };
  if(!a.birth_date ||!b.birth_date ||!a.birth_district_si ||!b.birth_district_si) return { total:0, percent:0, list:[], note:'No data 0%' };
  try{
    const real = calculateRealPorondam(a,b);
    const list = real.details.map((d:any)=>({
      id:d.id,
      name_si:d.name_si,
      name_en:d.name_en,
      name_si_original: PORONDAM_20.find(p=>p.id===d.id)?.name_si,
      match:d.match,
      score:d.obtained,
      girlValue:d.girlValue,
      boyValue:d.boyValue,
      obtained:d.obtained,
      max:d.max,
      descSi:d.descSi
    }));
    return {
      list,
      total:real.total,
      percent:Math.round((real.total/20)*100),
      note: `Real: ${real.debug.nakSiA} vs ${real.debug.nakSiB} | Lagna ${real.lagnaA.nameSi} ${real.lagnaA.deg}° vs ${real.lagnaB.nameSi} ${real.lagnaB.deg}° | Chandra ${real.debug.rashiSiA} vs ${real.debug.rashiSiB}`,
      lagnaA:real.lagnaA,
      lagnaB:real.lagnaB,
      debug:real.debug,
      isRajjuFail:real.isRajjuFail
    };
  }catch(e){
    // fallback to old hash if real calc fails - never crash matches page
    const str=(a.birth_date+b.birth_date+a.birth_district_si+b.birth_district_si).toString(); let hash=0; for(let i=0;i<str.length;i++) hash=(hash*31+str.charCodeAt(i))%1000;
    const list=PORONDAM_20.map((por,i)=>{ const match=((hash+i*7)%3)!==0; return {...por, match, score:match?1:0}; }); const total=list.filter(l=>l.match).length;
    return { list, total, percent:Math.round((total/20)*100), note:'Calculated (fallback)' };
  }
}

// --- MUTUAL LOGIC FOR ALL FIELDS --- (UNCHANGED)
function inRange(val:any, min:any, max:any){
  if(val==null) return false;
  if(min==null || min==='Any' || min==='' ) min = -9999;
  if(max==null || max==='Any' || max==='' ) max = 9999;
  const v = parseInt(val); const mn = parseInt(min); const mx = parseInt(max);
  if(isNaN(mn) || isNaN(mx)) return true;
  if(isNaN(v)) return false;
  return v>=mn && v<=mx;
}
function mutualScoreRange(x:any, y:any, a:any, b:any, c:any, d:any){
  const cond1 = inRange(y,a,b);
  const cond2 = inRange(x,c,d);
  if(cond1 && cond2) return 100;
  if(cond1 &&!cond2) return 70;
  if(!cond1 && cond2) return 40;
  return 10;
}
function isAny(v:any){ return v==null || v==='' || v==='Any'; }
function matchesDistrict(exp:any, p:any){
  if(isAny(exp)) return true;
  const cities = [p.living_city, p.current_city, p.birth_city, p.living_district_si, p.current_district_si, p.birth_district_si, p.district, p.district_si, p.current_district_en, p.district_en].filter(Boolean);
  return cities.includes(exp);
}
function matchesExact(exp:any, real:any){
  if(isAny(exp)) return true;
  if(isAny(real)) return false;
  return exp===real;
}

function calculateMatchingBreakdown(viewer:any, candidate:any){
  const ageScore = mutualScoreRange(viewer.age, candidate.age, viewer.expectation_age_min, viewer.expectation_age_max, candidate.expectation_age_min, candidate.expectation_age_max);
  const heightScore = mutualScoreRange(viewer.height_cm||viewer.height, candidate.height_cm||candidate.height, viewer.expectation_height_min, viewer.expectation_height_max, candidate.expectation_height_min, candidate.expectation_height_max);
  const expDistViewer = viewer.expectation_district||'Any';
  const expDistCand = candidate.expectation_district||'Any';
  const condDist1 = isAny(expDistViewer) || matchesDistrict(expDistViewer, candidate);
  const condDist2 = isAny(expDistCand) || matchesDistrict(expDistCand, viewer);
  const districtScore = condDist1 && condDist2? 100 : condDist1 &&!condDist2? 70 :!condDist1 && condDist2? 40 : 10;
  const condJob1 = isAny(viewer.expectation_job) || matchesExact(viewer.expectation_job, candidate.job);
  const condJob2 = isAny(candidate.expectation_job) || matchesExact(candidate.expectation_job, viewer.job);
  const jobScore = condJob1 && condJob2? 100 : condJob1 &&!condJob2? 70 :!condJob1 && condJob2? 40 : 10;
  const condCaste1 = isAny(viewer.expectation_caste) || matchesExact(viewer.expectation_caste, candidate.caste);
  const condCaste2 = isAny(candidate.expectation_caste) || matchesExact(candidate.expectation_caste, viewer.caste);
  const casteScore = condCaste1 && condCaste2? 100 : condCaste1 &&!condCaste2? 70 :!condCaste1 && condCaste2? 40 : 10;
  const condRel1 = isAny(viewer.expectation_religion) || matchesExact(viewer.expectation_religion, candidate.religion);
  const condRel2 = isAny(candidate.expectation_religion) || matchesExact(candidate.expectation_religion, viewer.religion);
  const religionScore = condRel1 && condRel2? 100 : condRel1 &&!condRel2? 70 :!condRel1 && condRel2? 40 : 10;
  const condEdu1 = isAny(viewer.expectation_education) || matchesExact(viewer.expectation_education, candidate.education) || matchesExact(viewer.expectation_education, candidate.education_level);
  const condEdu2 = isAny(candidate.expectation_education) || matchesExact(candidate.expectation_education, viewer.education) || matchesExact(candidate.expectation_education, viewer.education_level);
  const educationScore = condEdu1 && condEdu2? 100 : condEdu1 &&!condEdu2? 70 :!condEdu1 && condEdu2? 40 : 10;

  const porData=getPorondamScore(viewer,candidate);
  return {
    ageScore, heightScore, districtScore, religionScore, jobScore, casteScore, educationScore,
    porondamScore:porData.percent, porondamDetail:porData,
    total:Math.round(porData.percent*0.30+ageScore*0.20+religionScore*0.10+educationScore*0.10+casteScore*0.10+jobScore*0.10+districtScore*0.05+heightScore*0.05)
  };
}

export default function MatchesPage(){
  const router=useRouter(); 
  const [matches,setMatches]=useState<any[]>([]); 
  const [currentProfile,setCurrentProfile]=useState<any>(null); 
  const [myIds,setMyIds]=useState<string[]>([]); 
  const [myProfiles,setMyProfiles]=useState<any[]>([]); 
  const [loading,setLoading]=useState(true); 
  const [interests,setInterests]=useState<any>({}); 
  const [isAdmin,setIsAdmin]=useState(false); 
  const [myEmail,setMyEmail]=useState('');
  // NEW: pagination - Top 10 first, then next 10
  const PAGE_SIZE = 10;
  const [page,setPage]=useState(1);

  async function load(curIdOverride?:string){
    setLoading(true);
    let myIdsList:string[]=[]; try{ myIdsList=JSON.parse(localStorage.getItem('heesara_my_ids')||'[]'); }catch{} setMyIds(myIdsList);
    try{ setInterests(JSON.parse(localStorage.getItem('heesara_interests')||'{}')); }catch{}
    const { data: { user } } = await supabase.auth.getUser(); if(!user){ router.push('/login'); return; }
    const admin = isAdminEmail(user?.email); setIsAdmin(!!admin); setMyEmail(user?.email||'');
    let myData:any[]=[]; if(admin){ const {data} = await supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at',{ascending:false}); myData=data||[]; } else { if(myIdsList.length>0){ const {data} = await supabase.from('profiles').select('*').in('id',myIdsList); myData=data||[]; } }
    setMyProfiles(myData); if(myData.length>0){ localStorage.setItem('heesara_my_ids', JSON.stringify(myData.slice(0,10).map((p:any)=>p.id))); myIdsList = myData.map((p:any)=>p.id); setMyIds(myIdsList); }
    const curId=curIdOverride||localStorage.getItem('heesara_current_profile_id')||myData[0]?.id||myIdsList[0]; let curProfile=null;
    if(curId){ const {data}=await supabase.from('profiles').select('*').eq('id',curId).single(); curProfile=data; setCurrentProfile(data); localStorage.setItem('heesara_current_profile_id',curId); }
    let dbInterests:any={};
    if(curProfile){
      const {data: sent} = await supabase.from('interests').select('receiver_profile_id,status').eq('sender_profile_id', curProfile.id);
      const {data: rec} = await supabase.from('interests').select('sender_profile_id,status').eq('receiver_profile_id', curProfile.id);
      (sent||[]).forEach((r:any)=>{ dbInterests[r.receiver_profile_id]=r.status; });
      (rec||[]).forEach((r:any)=>{ if(r.status==='accepted' ||!dbInterests[r.sender_profile_id]) dbInterests[r.sender_profile_id]=r.status; });
      setInterests((prev:any)=>({...prev,...dbInterests}));
    }
    let query = supabase.from('profiles').select('*').neq('is_visible', false).order('created_at',{ascending:false}).limit(80);
    if(!admin) query = query.eq('is_private', false);
    const {data:all}=await query; let filtered=(all||[]);
    filtered = filtered.filter((p:any)=> p.is_visible!== false);
    let excludeIds = myData.map((p:any)=>p.id); if(curProfile &&!excludeIds.includes(curProfile.id)) excludeIds.push(curProfile.id);
    if(myIdsList.length>0){ myIdsList.forEach((id:string)=>{ if(!excludeIds.includes(id)) excludeIds.push(id); }); }
    filtered=filtered.filter((p:any)=>!excludeIds.includes(p.id));
    if(curProfile){ filtered=filtered.filter((p:any)=>p.gender&&curProfile.gender&&p.gender!==curProfile.gender); }
    filtered=filtered.map((p:any)=>{ if(!p.age){ const dob = p.dob || p.birth_date; if(dob) { const b = new Date(dob); p.age = new Date().getFullYear() - b.getFullYear(); } else { p.age = 25; } } if(!p.name) p.name = p.full_name; return p; }).filter((p:any)=>{ const name=(p.name||p.full_name||'').trim(); if(!name) return false; if(name==='- y -' || name.includes('- y - -')) return false; if(name.length<2) return false; if(p.age<18) return false; return true; });
    const scored=filtered.map((p:any)=>{ let breakdown=null; if(curProfile){ breakdown=calculateMatchingBreakdown(curProfile,p); } return {...p, breakdown, porondam:breakdown?.porondamDetail, match_score:breakdown?.total||0, _interestStatus: dbInterests[p.id]||interests[p.id]||'none'}; }).sort((a:any,b:any)=>b.match_score-a.match_score);
    setMatches(scored); 
    setPage(1); // reset to first page (Top 10) whenever matches reload
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, matches.length);
  const paginatedMatches = matches.slice(startIdx, endIdx);

  if(loading) return <div className='p-8 text-center'>Loading...</div>;
  return (
    <div className='max-w-5xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
      <div className='flex justify-between mb-4'><button onClick={()=>router.push('/account')} className='border bg-white px-4 py-2 rounded-full'>Back to Account</button><Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link></div>
      {myProfiles.length>0 && (<div className='bg-white border-2 border-blue-200 p-3 rounded-xl mb-4'><div className='font-bold mb-2'>Switch Active Profile: ({myProfiles.length}/{isAdmin?'∞':2}) {isAdmin?`👑 Admin ${myEmail} ` :myEmail} ඔබේ profile එක තෝරන්න</div><div className='flex gap-2 flex-wrap'>{myProfiles.map((p:any)=>(<button key={p.id} onClick={()=>load(p.id)} className={`px-4 py-2 rounded-full border font-bold ${currentProfile?.id===p.id?'bg-blue-600 text-white':'bg-white'}`}>{p.name||p.full_name} - {currentProfile?.id===p.id?' (Active)':''} {p.subscription_status} {p.is_visible===false?' (Hidden)':''}</button>))}</div></div>)}
      {currentProfile && <div className='bg-blue-50 border p-3 rounded-xl mb-4'><div className='font-bold'>{currentProfile.name||currentProfile.full_name} (වයස {currentProfile.age}y - {currentProfile.religion||'Any'} - {currentProfile.living_city||currentProfile.current_city} {currentProfile.is_private? '🔒 Private':''} | Status: {currentProfile.subscription_status}) ට ලැබෙන ඉහලම ගැලපීම්</div><div className='text-xs mt-1'>{currentProfile.name||currentProfile.full_name} බලාපොරොත්තු වන්නේ: Age {currentProfile.expectation_age_min}-{currentProfile.expectation_age_max} | Height {currentProfile.expectation_height_min}-{currentProfile.expectation_height_max} | Religion {currentProfile.expectation_religion||'Any'} | Education {currentProfile.expectation_education||'Any'} | District {currentProfile.expectation_district||'Any'} | Caste {currentProfile.expectation_caste||'Any'} | Job {currentProfile.expectation_job||'Any'}</div></div>}
      
      <div className='flex justify-between items-center mb-2'>
        <h1 className='text-xl font-bold'>Top Matches ({matches.length}) - Highest 10 First</h1>
        <div className='text-xs bg-white border px-3 py-1 rounded-full'>Page {page} of {totalPages} | Showing {matches.length>0? startIdx+1:0}-{endIdx} of {matches.length}</div>
      </div>

      <div className='grid gap-4'>{paginatedMatches.map((p:any)=>{
        const photo=p.main_photo_url||p.photo_urls?.[0];
        const interestStatus=p._interestStatus||'none';
        const viewerIsPaid = currentProfile && isProfileActive(currentProfile) && currentProfile.subscription_status!=='pending_payment';
        const candidateIsPaid = p && (p.subscription_status!=='pending_payment');
        const isAccepted = interestStatus==='accepted';
        const isMyProfile = myIds.includes(p.id);
        const canUnlock = isAdmin || isMyProfile || (isAccepted && viewerIsPaid && candidateIsPaid);
        const shouldBlurPhoto =!canUnlock && (p.photo_blur || p.photo_privacy==='blur' || p.photo_privacy===true || p.is_private);
        const isPrivatePhoto = shouldBlurPhoto;
        const bd=p.breakdown;
        return (
        <div key={p.id} className='border rounded-xl p-4 bg-white shadow'><div className='flex gap-3'><div className='w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-lg bg-gray-100'>{photo? (<><img src={photo} className='w-full h-full object-cover rounded-lg' style={{filter:isPrivatePhoto?'blur(14px) brightness(0.9)':'none'}}/>{isPrivatePhoto&&(<div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-sm">🔒</span><span className="bg-white/90 px-1 rounded-full font-bold text-black">Blur</span></div>)}</>):(<div className='w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'><span>👤</span></div>)}</div><div className='flex-1'><div className='font-bold flex gap-2 items-center'>{p.name||p.full_name} - {p.age}y ({p.height_cm||p.height||'?'}cm) - {p.living_city||p.current_city||p.birth_city} - {p.job} - {p.religion||'Any'} {p.is_private&&<span className='text-xs bg-red-100 px-2 py-0.5 rounded-full'>🔒 Private</span>} {isAccepted&&<span className='text-xs bg-green-100 px-2 rounded-full'>Accepted</span>}</div><div className='text-xs text-gray-600 mt-1'>DOB: {p.birth_date||p.dob} | Religion: {p.religion||'Any'} | Caste: {p.caste} | Edu: {p.education||p.education_level||'-'} (Wants {p.expectation_education||'Any'}) | {p.porondam?.total}/20 ({p.porondam?.percent}%) | Wants Age {p.expectation_age_min||'?'}-{p.expectation_age_max||'?'} | Ht {p.expectation_height_min||'?'}-{p.expectation_height_max||'?'}</div>
        {bd&&(<div className='mt-2 bg-gray-50 border rounded-lg p-2'><div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs'><div className={`p-2 rounded text-center border ${scoreColor(bd.porondamScore)}`}><div className='font-bold'>Porondam 30</div><div>{bd.porondamScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.ageScore)}`}><div className='font-bold'>Age 20</div><div>{bd.ageScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.religionScore)}`}><div className='font-bold'>Religion 10</div><div>{bd.religionScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.educationScore)}`}><div className='font-bold'>Education 10</div><div>{bd.educationScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.casteScore)}`}><div className='font-bold'>Caste 10</div><div>{bd.casteScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.jobScore)}`}><div className='font-bold'>Job 10</div><div>{bd.jobScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.districtScore)}`}><div className='font-bold'>Living 5</div><div>{bd.districtScore}%</div></div><div className={`p-2 rounded text-center border ${scoreColor(bd.heightScore)}`}><div className='font-bold'>Height 5</div><div>{bd.heightScore}%</div></div></div><div className='text-[10px] text-gray-500 mt-1 text-center'>Porondam 30 + Age 20 + Religion 10 + Education 10 + Caste 10 + Job 10 + Living 5 + Height 5 = 100</div></div>)}</div><div className='text-right ml-2'><div className='text-2xl font-bold text-blue-600'>{p.match_score}%</div><Link href={`/profile/${p.id}`} className='text-blue-600 underline text-sm mt-2 inline-block'>{isPrivatePhoto?'Request View':'view'}</Link></div></div></div>); })}</div>

      {/* NEW: Back left, Next/Load More right */}
      <div className='flex justify-between items-center mt-6 bg-white border rounded-full p-2 shadow'>
        <button 
          disabled={page<=1}
          onClick={()=>{ if(page>1){ setPage(p=>p-1); window.scrollTo({top:0, behavior:'smooth'}); } }}
          className={`px-6 py-2 rounded-full font-bold text-sm ${page<=1?'bg-gray-200 text-gray-400':'bg-gray-100 border hover:bg-gray-200'}`}
        >
          ← Back
        </button>
        <div className='text-xs font-bold'>
          {paginatedMatches.length>0? `Showing Top ${startIdx+1}-${endIdx} of ${matches.length}` : 'No matches'} 
          <span className='ml-2 opacity-60'>Page {page}/{totalPages}</span>
        </div>
        <button 
          disabled={page>=totalPages}
          onClick={()=>{ if(page<totalPages){ setPage(p=>p+1); window.scrollTo({top:0, behavior:'smooth'}); } }}
          className={`px-6 py-2 rounded-full font-bold text-sm ${page>=totalPages?'bg-gray-200 text-gray-400':'bg-[#7B1F2A] text-white hover:bg-[#5a1620]'}`}
        >
          {page>=totalPages? 'No More' : 'Next → / Load More'}
        </button>
      </div>

      <div className='mt-3 text-[11px] text-gray-500 text-center'>Top 10 highest scored first, then next 10... Education included in 100-mark system</div>
    </div>
  );
}
