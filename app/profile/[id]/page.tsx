'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { calculateRealPorondam } from '@/lib/porondam-real';
import { isProfileActive, getProfileExpiryInfo, getRenewalPrice } from '@/lib/subscription';

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com','heesara.support@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

const PORONDAM_20=[
  {id:1,name_si:'නැකත',name_en:'Nakatha',desc:'Stars'},
  {id:2,name_si:'ගණ',name_en:'Gana',desc:'Character'},
  {id:3,name_si:'යෝනි',name_en:'Yoni',desc:'Animal'},
  {id:4,name_si:'රාශි',name_en:'Rashi',desc:'Zodiac'},
  {id:5,name_si:'රාශි අධිපති',name_en:'Rashi Adhipathi',desc:'Lord'},
  {id:6,name_si:'වශ්ය',name_en:'Vashya',desc:'Attraction'},
  {id:7,name_si:'දින',name_en:'Dina',desc:'Day'},
  {id:8,name_si:'මහේන්ද්‍ර',name_en:'Mahendra',desc:'Longevity'},
  {id:9,name_si:'ස්ත්‍රී දීර්ඝ',name_en:'Sthree Deergha',desc:'Wife longevity'},
  {id:10,name_si:'වෘක්ෂ',name_en:'Vruksha',desc:'Tree'},
  {id:11,name_si:'රජ්ජු',name_en:'Rajju',desc:'Bond'},
  {id:12,name_si:'වේධ',name_en:'Vedha',desc:'Obstruction'},
  {id:13,name_si:'වර්ණ',name_en:'Varna',desc:'Caste'},
  {id:14,name_si:'නාඩි',name_en:'Nadi',desc:'Health'},
  {id:15,name_si:'ග්‍රහ මෛත්‍රී',name_en:'Graha Maitri',desc:'Planet'},
  {id:16,name_si:'භූත',name_en:'Bhootha',desc:'Element'},
  {id:17,name_si:'ගෝත්‍ර',name_en:'Gothra',desc:'Clan'},
  {id:18,name_si:'ලිංග',name_en:'Linga',desc:'Gender'},
  {id:19,name_si:'පක්ෂි',name_en:'Pakshi',desc:'Bird'},
  {id:20,name_si:'ආයු',name_en:'Ayu',desc:'Age'},
];

function scoreColor(s:number){
  if(s>=80) return 'bg-green-100 border-green-200 text-green-800';
  if(s>=50) return 'bg-yellow-100 border-yellow-200 text-yellow-800';
  if(s>=20) return 'bg-orange-100 border-orange-200 text-orange-800';
  return 'bg-red-100 border-red-200 text-red-800';
}
function getPorondamScore(a:any,b:any){
  if(a?.horoscope_required!==true) return { list: PORONDAM_20.map(p=>({...p,girlValue:'-',boyValue:'-',obtained:1,max:1,match:true,details:'අවශ්‍ය නැත'})), total:20, percent:100, note:'අවශ්‍ය නැත', lagnaA:null, lagnaB:null, isRajjuFail:false, debug:null };
  if(!a.birth_date||!b.birth_date) return { list: PORONDAM_20.map(p=>({...p,girlValue:'-',boyValue:'-',obtained:0,max:1,match:false,details:'දත්ත අඩුයි'})), total:0, percent:0, note:'දත්ත අඩුයි', lagnaA:null, lagnaB:null, isRajjuFail:false, debug:null };
  const real = calculateRealPorondam(a,b);
  const list = real.details.map((d:any)=>({...d, score:d.obtained, name_si:d.name_si, name_en:d.name_en}));
  return { list, total:real.total, percent:Math.round(real.total/20*100), note: `${real.debug.nakSiA} vs ${real.debug.nakSiB} | Lagna ${real.lagnaA.nameSi} ${real.lagnaA.deg}° vs ${real.lagnaB.nameSi} ${real.lagnaB.deg}° | Chandra ${real.debug.rashiSiA} vs ${real.debug.rashiSiB}`, debug:real.debug, lagnaA:real.lagnaA, lagnaB:real.lagnaB, isRajjuFail:real.isRajjuFail };
}

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
  if(!viewer || !candidate) return { 
    ageScore:0, heightScore:0, districtScore:0, religionScore:0, jobScore:0, casteScore:0, educationScore:0, 
    porondamScore:0, porondamDetail:null, 
    total:0 
  };
  const ageScore = mutualScoreRange(viewer.age, candidate.age, viewer.expectation_age_min, viewer.expectation_age_max, candidate.expectation_age_min, candidate.expectation_age_max);
  const heightScore = mutualScoreRange(viewer.height_cm||viewer.height, candidate.height_cm||candidate.height, viewer.expectation_height_min, viewer.expectation_height_max, candidate.expectation_height_min, candidate.expectation_height_max);
  const viewerLiving = viewer.living_city||viewer.current_city||viewer.living_district_si||viewer.current_district_si||viewer.district||'';
  const candLiving = candidate.living_city||candidate.current_city||candidate.birth_city||candidate.living_district_si||candidate.current_district_si||candidate.birth_district_si||candidate.district||'';
  const expDistViewer = viewer.expectation_district||'Any';
  const expDistCand = candidate.expectation_district||'Any';
  const condDist1 = isAny(expDistViewer) || matchesDistrict(expDistViewer, candidate);
  const condDist2 = isAny(expDistCand) || matchesDistrict(expDistCand, viewer);
  let districtScore = condDist1 && condDist2? 100 : condDist1 &&!condDist2? 70 :!condDist1 && condDist2? 40 : 10;
  const condJob1 = isAny(viewer.expectation_job) || matchesExact(viewer.expectation_job, candidate.job);
  const condJob2 = isAny(candidate.expectation_job) || matchesExact(candidate.expectation_job, viewer.job);
  let jobScore = condJob1 && condJob2? 100 : condJob1 &&!condJob2? 70 :!condJob1 && condJob2? 40 : 10;
  const condCaste1 = isAny(viewer.expectation_caste) || matchesExact(viewer.expectation_caste, candidate.caste);
  const condCaste2 = isAny(candidate.expectation_caste) || matchesExact(candidate.expectation_caste, viewer.caste);
  let casteScore = condCaste1 && condCaste2? 100 : condCaste1 &&!condCaste2? 70 :!condCaste1 && condCaste2? 40 : 10;
  const condRel1 = isAny(viewer.expectation_religion) || matchesExact(viewer.expectation_religion, candidate.religion);
  const condRel2 = isAny(candidate.expectation_religion) || matchesExact(candidate.expectation_religion, viewer.religion);
  let religionScore = condRel1 && condRel2? 100 : condRel1 &&!condRel2? 70 :!condRel1 && condRel2? 40 : 10;
  const condEdu1 = isAny(viewer.expectation_education) || matchesExact(viewer.expectation_education, candidate.education) || matchesExact(viewer.expectation_education, candidate.education_level);
  const condEdu2 = isAny(candidate.expectation_education) || matchesExact(candidate.expectation_education, viewer.education) || matchesExact(candidate.expectation_education, viewer.education_level);
  let educationScore = condEdu1 && condEdu2? 100 : condEdu1 &&!condEdu2? 70 :!condEdu1 && condEdu2? 40 : 10;
  const porData=getPorondamScore(viewer,candidate);
  return { 
    ageScore, heightScore, districtScore, religionScore, jobScore, casteScore, educationScore, 
    porondamScore:porData.percent, porondamDetail:porData, 
    total:Math.round(porData.percent*0.30+ageScore*0.20+religionScore*0.10+educationScore*0.10+casteScore*0.10+jobScore*0.10+districtScore*0.05+heightScore*0.05) 
  };
}

export default function Page(){
  const params=useParams(); const router=useRouter(); const id=params?.id as string;
  const [profile,setProfile]=useState<any>(null); const [cur,setCur]=useState<any>(null); const [loading,setLoading]=useState(true);
  const [expiry,setExpiry]=useState<any>(null); const [canView,setCanView]=useState(false);
  const [interestStatus,setInterestStatus]=useState('none');
  const [porondam,setPorondam]=useState<any>(null); const [breakdown,setBreakdown]=useState<any>(null);
  const [isAdmin,setIsAdmin]=useState(false); const [myEmail,setMyEmail]=useState('');
  const [renewalPrice,setRenewalPrice]=useState(1500);
  const [sentRow,setSentRow]=useState<any>(null); const [receivedRow,setReceivedRow]=useState<any>(null);
  const [myIds,setMyIds]=useState<string[]>([]);
  const [authUid,setAuthUid]=useState('');
  const [contact,setContact]=useState<any>(null);
  const [reporting,setReporting]=useState(false);
  const [adminVerifying,setAdminVerifying]=useState(false);
  const [isLoggedIn,setIsLoggedIn]=useState(false);

  useEffect(()=>{ (async()=>{
    const {data:{user}} = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
    setIsAdmin(isAdminEmail(user?.email)); setMyEmail(user?.email||''); setAuthUid(user?.id||'');
    const {data} = await supabase.from('profiles').select('*').eq('id',id).single();
    setProfile(data);
    if(data?.id){
      const {data: contactData} = await supabase.from('contacts').select('*').eq('profile_id', data.id).maybeSingle();
      setContact(contactData);
    }
    let myIdList:string[]=[];
    if(user){
      const {data:myAll}=await supabase.from('profiles').select('id, user_id').eq('user_id',user.id);
      myIdList = myAll?.map((p:any)=>p.id)||[];
      setMyIds(myIdList);
    }
    const curId=localStorage.getItem('heesara_current_profile_id');
    let curData:any=null;
    if(curId){ 
      const {data:c}=await supabase.from('profiles').select('*').eq('id',curId).single(); 
      curData=c; 
    }
    else if(user){ 
      const {data:myData}=await supabase.from('profiles').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1); 
      if(myData?.[0]){ curData=myData[0]; localStorage.setItem('heesara_current_profile_id', curData.id); } 
    }
    if(curData){ setCur(curData); setExpiry(getProfileExpiryInfo(curData)); setCanView((isProfileActive(curData) && curData.subscription_status!=='pending_payment') || isAdminEmail(user?.email)); setRenewalPrice(getRenewalPrice(curData)); }
    setLoading(false);
  })(); },[id]);

  useEffect(()=>{ (async()=>{
    if(!profile ||!cur) return;
    const {data: sent} = await supabase.from('interests').select('*').eq('sender_profile_id', cur.id).eq('receiver_profile_id', profile.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    const {data: received} = await supabase.from('interests').select('*').eq('sender_profile_id', profile.id).eq('receiver_profile_id', cur.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
    setSentRow(sent||null); setReceivedRow(received||null);
    if(sent?.status==='accepted' || received?.status==='accepted'){ setInterestStatus('accepted'); }
    else if(sent?.status==='sent'){ setInterestStatus('sent'); }
    else if(received?.status==='sent'){ setInterestStatus('received'); }
    else { setInterestStatus('none'); }
    setPorondam(getPorondamScore(cur, profile)); setBreakdown(calculateMatchingBreakdown(cur, profile));
  })(); },[profile, cur]);

  const handleInterest = async () => {
    if(!isLoggedIn){ 
      const go=confirm('🔒 Please login to send interest\n\nLogin now?'); 
      if(go) router.push('/login'); 
      return; 
    }
    if(!cur ||!profile) return;
    const viewerCanSend = isProfileActive(cur) && cur.subscription_status!=='pending_payment';
    if(!viewerCanSend &&!isAdmin){
        alert(`🔒 ${cur.full_name} is ${cur.subscription_status} - Please pay Rs.${renewalPrice} to send interests`);
        router.push('/account'); return;
    }
    const viewerVer = (cur as any).verification_status || 'verified';
    if(viewerVer !== 'verified' && !isAdmin){
      alert(`🔒 Your profile is ${viewerVer} - Guardian verification pending. Admin must verify your guardian contact ${cur.guardian_contact} before you can send interests.`);
      return;
    }
    const {data, error} = await supabase.from('interests').insert({
      sender_profile_id: cur.id, receiver_profile_id: profile.id,
      sender_user_id: cur.user_id, receiver_user_id: profile.user_id, status:'sent'
    }).select().single();
    if(error){ alert(error.message); return; }
    setSentRow(data); setInterestStatus('sent');
  };
  const handleAcceptReceived = async () => {
    if(!receivedRow) return;
    const {error} = await supabase.from('interests').update({status:'accepted'}).eq('id', receivedRow.id);
    if(error){ alert(error.message); return; }
    setInterestStatus('accepted');
  };
  const handleRejectReceived = async () => {
    if(!receivedRow) return;
    await supabase.from('interests').update({status:'rejected'}).eq('id', receivedRow.id);
    setInterestStatus('none'); setReceivedRow(null);
  };
  const handleCancel = async () => {
    if(!confirm('Cancel this interest?')) return;
    if(sentRow) await supabase.from('interests').delete().eq('id', sentRow.id);
    if(receivedRow && receivedRow.status==='accepted') await supabase.from('interests').delete().eq('id', receivedRow.id);
    setInterestStatus('none'); setSentRow(null); setReceivedRow(null);
  };
  const handlePay = async () => {
    if(!cur) return;
    const { data: { user } } = await supabase.auth.getUser(); if(!user){ router.push('/login'); return; }
    const { data: order, error } = await supabase.from('payments').insert({ user_id: user.id, amount: renewalPrice, status: 'pending', profile_id: cur.id, profile_data: { full_name: cur.full_name }, plan_type: cur.is_free? 'discounted_6m' : 'normal_6m' }).select().single();
    if(error){ alert('Pay order error: '+error.message); return; } router.push(`/pay/${order.id}`);
  };

  const handleReport = async () => {
    if(!isLoggedIn){ router.push('/login'); return; }
    if(!cur || !profile) return;
    if(!confirm('Report this profile for spam / fun message? 3 reports will auto hide profile.')) return;
    setReporting(true);
    try{
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('reports').insert({
        reported_profile_id: profile.id,
        reporter_profile_id: cur.id,
        reason: 'fun message / spam'
      });
      const newCount = (profile.report_count || 0) + 1;
      let newStatus = profile.verification_status;
      if(newCount >= 3) newStatus = 'blocked';
      await supabase.from('profiles').update({ report_count: newCount, verification_status: newStatus }).eq('id', profile.id);
      alert(newCount >=3 ? `Reported! Profile now blocked (3 reports) - admin will review.` : `Reported! Count ${newCount}/3`);
      setProfile({...profile, report_count: newCount, verification_status: newStatus});
    }catch(e:any){ alert('Report error: '+e.message); }
    setReporting(false);
  };

  const handleAdminVerify = async () => {
    if(!profile) return;
    if(!confirm(`Verify guardian ${profile.guardian_contact} (${profile.guardian_relationship}) and release?`)) return;
    setAdminVerifying(true);
    try{
      await supabase.from('profiles').update({
        verification_status: 'verified',
        guardian_verified: true,
        verified_badge: true,
        report_count: 0
      }).eq('id', profile.id);
      alert('✅ Verified and released! Contacts now visible.');
      setProfile({...profile, verification_status:'verified', guardian_verified:true, verified_badge:true, report_count:0});
    }catch(e:any){ alert(e.message); }
    setAdminVerifying(false);
  };

  const handleAdminBlock = async () => {
    if(!confirm('Block this profile?')) return;
    await supabase.from('profiles').update({ verification_status: 'blocked' }).eq('id', profile.id);
    setProfile({...profile, verification_status:'blocked'});
  };

  if(loading) return <div className='p-8 text-center'>Loading...</div>;
  if(!profile) return <div className='p-8 text-center'>Not found {id}</div>;

  const main=profile.main_photo_url||profile.photo_urls?.[0];

  // FIX: Guest view - show login guard instead of crash (prevents Application error)
  if(!isLoggedIn){
    return (
      <div className='max-w-4xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
        <div className='flex justify-between mb-4'><button onClick={()=>router.back()} className='border bg-white px-4 py-2 rounded-full'>Back</button><Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link></div>
        <div className='bg-yellow-50 border-2 border-yellow-400 p-8 rounded-2xl text-center'>
          <h2 className='text-2xl font-bold text-[#5a1620]'>🔒 Login Required to View Profile</h2>
          <p className='mt-3 text-sm text-gray-700'>You are viewing as guest. Search is open to see blurred previews, but full details need login.</p>
          <p className='mt-2 text-[11px] text-gray-500'>විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි - Please login to view full profile, photos, contact, porondam matching</p>
          <div className='mt-6 flex gap-3 justify-center'>
            <Link href='/login' className='bg-[#5a1620] text-white px-8 py-3 rounded-full font-bold'>🔑 Login</Link>
            <Link href='/create-profile' className='bg-green-600 text-white px-8 py-3 rounded-full font-bold'>📝 Create Profile</Link>
          </div>
          <div className='mt-8 bg-white border rounded-xl p-4 text-left'>
            <div className='flex gap-4'>
              <div className='w-24 h-24 rounded-xl bg-gray-100 border-2 overflow-hidden relative'>
                {main? <img src={main} className='w-full h-full object-cover' style={{filter:'blur(12px)'}}/> : <div className='w-full h-full flex items-center justify-center'>User</div>}
                <div className='absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xs'>🔒 Blurred</div>
              </div>
              <div>
                <h3 className='font-bold'>{profile.full_name} - {profile.age}y</h3>
                <div className='text-xs text-gray-600'>{profile.job} | {profile.living_city||profile.current_city} | {profile.religion}</div>
                <div className='text-[11px] mt-1 text-gray-500'>Login to see full bio, education, horoscope, contact details</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwn = cur && cur.id === profile.id;
  const isMyProfile = myIds.includes(profile.id) || (profile.user_id === authUid);
  const isSameUser = isMyProfile;

  const viewerIsPaid = cur && isProfileActive(cur) && cur.subscription_status!=='pending_payment';
  const candidateIsPaid = profile && isProfileActive(profile) && profile.subscription_status!=='pending_payment';
  const isAccepted = interestStatus==='accepted';

  const candidateVerStatus = profile.verification_status || 'verified';
  const candidateGuardianVerified = profile.guardian_verified ?? (candidateVerStatus==='verified');
  const candidateIsVerified = candidateVerStatus==='verified' && candidateGuardianVerified;
  const candidateIsBlocked = candidateVerStatus==='blocked';

  const viewerVerStatus = cur ? (cur.verification_status || 'verified') : 'verified';
  const viewerGuardianVerified = cur ? (cur.guardian_verified ?? (viewerVerStatus==='verified')) : true;
  const viewerIsVerified = viewerVerStatus==='verified' && viewerGuardianVerified;

  const canUnlock = isAdmin || isMyProfile || (isAccepted && viewerIsPaid && candidateIsPaid && candidateIsVerified && viewerIsVerified);
  const canSeeContact = canUnlock;
  const shouldBlur = (profile.photo_blur || profile.photo_privacy==='blur' || profile.photo_privacy===true) &&!canUnlock;
  const isPrivatePhoto = shouldBlur;
  const isPrivateProfile = profile.is_private &&!isMyProfile &&!isAdmin;

  if(candidateIsBlocked && !isAdmin && !isMyProfile){
    return (
      <div className='max-w-4xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
        <div className='flex justify-between mb-4'><button onClick={()=>router.back()} className='border bg-white px-4 py-2 rounded-full'>Back</button><Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link></div>
        <div className='bg-red-50 border-2 border-red-400 p-8 rounded-2xl text-center'>
          <h2 className='text-xl font-bold text-red-700'>🚫 Profile Blocked for Review</h2>
          <p className='mt-2 text-sm'>This profile reported {profile.report_count}/3 times for spam/fun messages. Under admin review.</p>
        </div>
      </div>
    );
  }

  if(isPrivateProfile){
    return (
      <div className='max-w-4xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
        <div className='flex justify-between mb-4'><button onClick={()=>router.back()} className='border bg-white px-4 py-2 rounded-full'>Back</button><Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link></div>
        <div className='bg-red-50 border-2 border-red-300 p-8 rounded-2xl text-center'><h2 className='text-xl font-bold'>Private Profile Locked</h2></div>
      </div>
    );
  }

  if(isSameUser){
    return (
      <div className='max-w-4xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
        <div className='flex justify-between mb-4'><button onClick={()=>router.back()} className='border bg-white px-4 py-2 rounded-full'>Back</button><Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link></div>
        <div className={`border p-3 rounded-xl mb-4 ${candidateVerStatus==='verified' ? 'bg-green-50 border-green-300' : candidateVerStatus==='limited' ? 'bg-yellow-50 border-yellow-400' : candidateVerStatus==='blocked' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border'}`}><div className='font-bold'>{isOwn? 'Own Profile' : 'My Other Profile'}: {profile.full_name} - {profile.age}y {isAdmin? ' ADMIN '+myEmail:''} {profile.is_visible===false? ' (Hidden)':''} | Status: {candidateVerStatus} {profile.guardian_verified ? '✓ Guardian Verified' : '⚠ Guardian Pending'} {profile.verified_badge ? '✓ Verified Badge' : ''}</div><div className='text-xs mt-1'>Guardian: {profile.guardian_contact || '-'} ({profile.guardian_relationship || '-'}) | Fee: {profile.verification_fee_type || '-'} | Reports: {profile.report_count || 0}</div></div>
        <div className='bg-white border rounded-2xl p-6 shadow'>
          <div className='flex gap-4'>
            <div className='w-32 h-32 rounded-xl bg-gray-100 border-2 overflow-hidden'>{main? <img src={main} className='w-full h-full object-cover'/> : <div className='w-full h-full flex items-center justify-center'>User</div>}</div>
            <div>
              <h1 className='text-2xl font-bold'>{profile.full_name} - {profile.age}y {profile.verified_badge && <span className='text-green-600 text-sm'>✓ Verified</span>}</h1>
              <div className='text-sm'>Living: {profile.living_city||profile.current_city||profile.birth_city} | {profile.living_district_si||profile.current_district_si} | {profile.job} | {profile.religion||'Any'} | {profile.caste}</div>
              <div className='text-sm mt-1'>Phone: {contact?.phone || profile.phone || '-'} | Email: {contact?.email || profile.email || profile.email_contact || '-'}</div>
              <div className='text-xs mt-1'>Status: {profile.subscription_status} | {expiry?.message} | {profile.is_visible===false? 'Hidden from Search': 'Visible'} | DOB Original: {profile.dob_original || profile.dob || '-'} | Time edits: {profile.time_edit_count || 0}</div>
            </div>
          </div>
          <div className='mt-4 bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-sm'>
            <div className='font-bold text-base mb-1'>About / Bio</div>
            <div>{profile.bio || profile.about || 'No bio - Add bio in Edit Profile'}</div>
          </div>
          <div className='mt-3 grid md:grid-cols-2 gap-3 text-sm'>
            <div className='bg-gray-50 border p-3 rounded-xl'>
              <div className='font-bold mb-1'>Personal Details</div>
              <div>Gender: {profile.gender}</div>
              <div>Age: {profile.age}y | Height: {profile.height_cm}cm</div>
              <div>Education: {profile.education || profile.education_level || '-'}</div>
              <div>Job: {profile.job} | Body: {profile.body_type||'-'} | Skin: {profile.skin_color||'-'}</div>
              <div>Living: {profile.current_city} - {profile.current_district_si}</div>
              <div>Birth: {profile.birth_city} - {profile.birth_district_si}</div>
            </div>
            <div className='bg-gray-50 border p-3 rounded-xl'>
              <div className='font-bold mb-1'>Family & Culture</div>
              <div>Religion: {profile.religion || '-'} | Caste: {profile.caste}</div>
              <div>Family: {profile.family_details || 'කුලවත්/ වංශවත්'}</div>
              <div>Marital: {profile.marital_status || '-'}</div>
            </div>
          </div>
          <div className='mt-3 bg-blue-50 border p-3 rounded-xl text-sm'>
            <div className='font-bold mb-1'>Birth / Horoscope Info</div>
            <div>Birth: {profile.birth_date} {profile.birth_time||''} {profile.birth_district_si}</div>
            <div>Horoscope Required: {profile.horoscope_required? 'Yes':'No'}</div>
          </div>
          <div className='mt-3 bg-purple-50 border p-3 rounded-xl text-sm'>
            <div className='font-bold mb-1'>Expectations</div>
            <div>Age: {profile.expectation_age_min||18} - {profile.expectation_age_max||60}</div>
            <div>Height: {profile.expectation_height_min||'-'} - {profile.expectation_height_max||'-'} cm</div>
            <div>District: {profile.expectation_district || 'Any'} | Job: {profile.expectation_job || 'Any'} | Caste: {profile.expectation_caste || 'Any'} | Religion: {profile.expectation_religion || 'Any'} | Education: {profile.expectation_education || 'Any'}</div>
          </div>
          <div className='mt-4 flex gap-2'>
            <Link href={`/create-profile?edit=${profile.id}`} className='bg-green-600 text-white px-5 py-2 rounded-full text-sm'>Edit Profile / Update</Link>
            <Link href='/account' className='bg-gray-200 px-5 py-2 rounded-full text-sm'>Back to Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const displayPorondam = porondam || getPorondamScore(cur || { birth_date:'1990-01-01', birth_district_si:'Colombo', horoscope_required:true }, profile);
  const displayBreakdown = breakdown || calculateMatchingBreakdown(cur || { expectation_age_min:18, expectation_age_max:60, expectation_height_min:140, expectation_height_max:200, expectation_district:'Any', expectation_job:'Any', expectation_caste:'Any', expectation_religion:'Any', expectation_education:'Any', birth_date:'1990-01-01', birth_district_si:'Colombo', horoscope_required:true }, profile);

  return (
    <div className='max-w-4xl mx-auto p-4 bg-[#FFFBEB] min-h-screen' style={{fontFamily: "'Noto Sans Sinhala', sans-serif"}}>
      <div className='flex justify-between mb-4'><button onClick={()=>router.back()} className='border bg-white px-4 py-2 rounded-full'>Back</button><Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link></div>
      {cur && <div className='bg-blue-50 border p-3 rounded-xl mb-4'><div className='font-bold'>{cur.full_name} බලන්නේ → {profile.full_name} සමග ගැලපීම {profile.verified_badge && <span className='bg-green-600 text-white text-xs px-2 py-1 rounded-full ml-2'>✓ Verified</span>} {candidateVerStatus!=='verified' && <span className='bg-yellow-500 text-white text-xs px-2 py-1 rounded-full ml-2'>{candidateVerStatus}</span>}</div>{!canView && <div className='mt-2 bg-red-100 border p-2 rounded-lg text-xs'>🔒 Pending - Pay Rs.{renewalPrice} → <button onClick={handlePay} className='bg-red-600 text-white px-3 py-1 rounded-full ml-2'>Pay Rs.{renewalPrice}</button></div>}{!viewerIsVerified && <div className='mt-2 bg-yellow-100 border p-2 rounded-lg text-xs'>⚠ Your profile not verified yet - guardian {cur.guardian_contact} pending. Contacts hidden until admin verifies.</div>}</div>}

      {isAdmin && (
        <div className='bg-yellow-50 border-2 border-yellow-400 p-4 rounded-xl mb-4'>
          <h3 className='font-bold text-sm'>👑 Admin - Verification Control</h3>
          <div className='text-xs mt-1'>Status: {candidateVerStatus} | Guardian Verified: {String(profile.guardian_verified)} | Guardian: {profile.guardian_contact} ({profile.guardian_relationship}) | Fee: {profile.verification_fee_type} | Paid: {String(profile.verification_fee_paid)} | Reports: {profile.report_count || 0} | DOB Orig: {profile.dob_original || profile.dob} | Time edits: {profile.time_edit_count || 0}</div>
          <div className='flex gap-2 mt-2'>
            {candidateVerStatus!=='verified' && <button disabled={adminVerifying} onClick={handleAdminVerify} className='bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold'>{adminVerifying? 'Verifying...' : `✅ Verify Guardian ${profile.guardian_contact} & Release`}</button>}
            {candidateVerStatus!=='blocked' && <button onClick={handleAdminBlock} className='bg-red-600 text-white px-4 py-2 rounded-full text-xs'>🚫 Block</button>}
          </div>
        </div>
      )}

      <div className='bg-white border rounded-2xl p-6 shadow'>
        <div className='flex gap-4'>
          <div className='w-32 h-32 relative overflow-hidden rounded-xl bg-gray-100 border-2 flex-shrink-0'>{main? <><img src={main} className='w-full h-full object-cover' style={{filter: isPrivatePhoto?'blur(16px)':''}} />{isPrivatePhoto && <div className='absolute inset-0 flex items-center justify-center bg-black/30 text-white font-bold'>Locked</div>}</> : <div className='w-full h-full bg-gray-200 flex items-center justify-center'>User</div>}</div>
          <div><h1 className='text-2xl font-bold flex items-center gap-2'>{profile.full_name} {profile.verified_badge && <span className='bg-green-100 text-green-800 border border-green-300 text-xs px-2 py-1 rounded-full'>✓ Verified</span>} {candidateVerStatus==='limited' && <span className='bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full'>Limited - Guardian Pending</span>}</h1><div className='text-sm'>{profile.age} අවුරුදු {profile.living_city} | {profile.job} | {profile.religion||'Any'} | {profile.caste} | {profile.height_cm}cm | {profile.marital_status||''} | {profile.education||''} | බලාපොරොත්තු අධ්‍යාපනය: {profile.expectation_education||'Any'}</div><div className='mt-2 text-lg font-bold text-blue-600'>මුළු ගැලපීම: {displayBreakdown?.total}% (සියලු කරුණු සැලකීමෙන්)</div><button onClick={handleReport} disabled={reporting} className='mt-2 text-xs bg-gray-100 border px-3 py-1 rounded-full'>🚩 Report spam/fun {reporting? '...' : ''} ({profile.report_count||0}/3)</button></div>
        </div>

        <div className='mt-4 bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-sm'>
          <div className='font-bold text-base mb-1'>About</div>
          <div>{profile.bio || profile.about || 'No bio added yet'}</div>
        </div>

        <div className='mt-3 grid md:grid-cols-2 gap-3 text-sm'>
          <div className='bg-gray-50 border p-3 rounded-xl'>
            <div className='font-bold mb-1'>Personal Details - පුද්ගලික තොරතුරැ</div>
            <div>Living: {profile.living_city||profile.current_city} - {profile.living_district_si}</div>
            <div>Birth: {profile.birth_date} {profile.birth_district_si} Birth Time - Secured.</div>
            <div>Height: {profile.height_cm}cm | Education: {profile.education||profile.education_level||'-'}</div>
            <div>Job: {profile.job} | Religion: {profile.religion||'-'} | Caste: {profile.caste} | Marital: {profile.marital_status||'-'}</div>
            {profile.dob_original && <div className='text-[10px] text-gray-500 mt-1'>DOB Original: {profile.dob_original} | Time edits: {profile.time_edit_count || 0}</div>}
          </div>
          <div className='bg-purple-50 border p-3 rounded-xl'>
            <div className='font-bold mb-1'>Looking For - බලාපොරොත්තු වන</div>
            <div>Age: {profile.expectation_age_min||18}-{profile.expectation_age_max||60} | Height: {profile.expectation_height_min||'-'}-{profile.expectation_height_max||'-'}</div>
            <div>District: {profile.expectation_district||'Any'} | Job: {profile.expectation_job||'Any'} | Caste: {profile.expectation_caste||'Any'} | Religion: {profile.expectation_religion||'Any'} | Education: {profile.expectation_education||'Any'} | Horoscope Required: {profile.horoscope_required? 'Yes':'No'}</div>
          </div>
        </div>

        <div className='mt-4 bg-gray-50 border-2 border-blue-300 rounded-xl p-3'>
          <div className='font-bold text-sm mb-2'>🔥 Matching Breakdown ගැලපීම් සඳහා ලබාගත හැකි උපරිම ලකුණු සහ ඒ සඳහා ලැබුණු ප්‍රතිශත</div>
          <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs'>
            <div className={'p-2 rounded text-center border-2 '+scoreColor(displayBreakdown.porondamScore)}><div className='font-bold'>Porondam 30</div><div className='text-lg'>{displayBreakdown.porondamScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.ageScore)}><div className='font-bold'>Age 20</div><div>{displayBreakdown.ageScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.religionScore)}><div className='font-bold'>Religion 10</div><div>{displayBreakdown.religionScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.educationScore)}><div className='font-bold'>Education 10</div><div>{displayBreakdown.educationScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.casteScore)}><div className='font-bold'>Caste 10</div><div>{displayBreakdown.casteScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.jobScore)}><div className='font-bold'>Job 10</div><div>{displayBreakdown.jobScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.districtScore)}><div className='font-bold'>Living 5</div><div>{displayBreakdown.districtScore}%</div></div>
            <div className={'p-2 rounded text-center border '+scoreColor(displayBreakdown.heightScore)}><div className='font-bold'>Height 5</div><div>{displayBreakdown.heightScore}%</div></div>
          </div>
          <div className='text-[10px] text-gray-500 mt-2 text-center'>Porondam 30 + Age 20 + Religion 10 + Education 10 + Caste 10 + Job 10 + Living 5 + Height 5 = 100</div>
        </div>
        <div className='mt-6 border-t pt-4'>
          <h2 className='font-bold text-lg mb-2'>පොරොන්දම් 20 (චන්ද්‍ර නැකැත් සහ ලග්න)</h2>
{displayPorondam.debug && (
  <div className='bg-indigo-50 border-2 border-indigo-300 p-3 rounded-xl mb-3 text-sm'>
    <div className='font-bold'>🔭 (Lahiri Ayanamsa) - District lat/long used</div>
    <div>ඔබ: {displayPorondam.debug.nakA} | ලග්නය: {displayPorondam.lagnaA?.nameSi} {displayPorondam.lagnaA?.deg}°</div>
    <div>අනෙකා: {displayPorondam.debug.nakB} | ලග්නය: {displayPorondam.lagnaB?.nameSi} {displayPorondam.lagnaB?.deg}°</div>
    <div className='text-xs opacity-70'>ලබා දී ඇති උපන් වේලාව අනුව ගණනය කර ඇත. (අනෙකාගේ උපන් වේලාව දැන ගැනීමට පහත ඇති දුරකථන අංක ඔස්සේ කේන්ද්‍ර හිමිකරු සම්බන්ධ කරගන්න.).</div>
    {displayPorondam.isRajjuFail && <div className='bg-red-100 border p-2 rounded text-red-800 font-bold mt-2'>⚠ රජ්ජු දෝෂය - Critical</div>}
  </div>
)}
          <div className='bg-blue-50 border-2 border-blue-400 p-3 rounded-xl mb-3'><div className='font-bold'>Total: {displayPorondam.total}/20 ({displayPorondam.percent}%) - {displayPorondam.note}</div></div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
  {displayPorondam.list.map((p:any)=>(
    <div key={p.id} className={'border-2 p-3 rounded-lg text-xs ' + (p.match?'bg-green-50':'bg-red-50')}>
      <div className='font-bold flex justify-between'>
        <span>{p.id}. {p.name_si} <span className='opacity-60'>{p.name_en}</span></span>
        <span>{p.obtained}/{p.max}</span>
      </div>
      <div className='mt-1'>ඇය: {p.girlValue} | ඔහු: {p.boyValue}</div>
      <div className={p.match?'text-green-600 font-bold':'text-red-600 font-bold'}>{p.descSi || p.desc} - {p.details}</div>
    </div>
  ))}
</div>
        </div>
        <div className='mt-6 border-t pt-4'>
          <h2 className='font-bold text-lg'>Contact Details {candidateIsVerified ? '✓ Verified' : '⚠ Limited'}</h2>
          {interestStatus==='none' && (
            <div className='bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl text-center mt-2'>
              {!viewerIsPaid? (
                <>
                  <div className='font-bold text-red-700 text-lg'>🔒 {cur?.full_name || 'You'} is {cur?.subscription_status || 'not active'} - Pay to Send Interest</div>
                  <div className='text-xs mt-1'>Non-paid users cannot send interests. Your contact also hidden from others.</div>
                  <button onClick={handlePay} className='bg-green-600 text-white px-8 py-3 rounded-full font-bold mt-3'>Pay Rs.{renewalPrice} & Unlock Sending</button>
                </>
              ) : !viewerIsVerified ? (
                <>
                  <div className='font-bold text-yellow-700 text-lg'>⚠ Your profile not verified yet</div>
                  <div className='text-xs mt-1'>Guardian {cur?.guardian_contact} pending verification. Admin will call and release. Your contacts hidden from others until verified.</div>
                </>
              ) : !candidateIsVerified ? (
                <>
                  <div className='font-bold text-yellow-700 text-lg'>⚠ {profile.full_name} not verified yet - Limited</div>
                  <div className='text-xs mt-1'>This profile guardian verification pending. You can send interest but contacts will be visible only after both verified by admin. Guardian: hidden for privacy.</div>
                  <button onClick={handleInterest} className='bg-pink-600 text-white px-8 py-3 rounded-full font-bold mt-3'>Send Interest (Verification Pending)</button>
                </>
              ) : (
                <>
                  <div className='font-bold'>Send interest to view contact + clear photo</div>
                  <button onClick={handleInterest} className='bg-pink-600 text-white px-8 py-3 rounded-full font-bold mt-3'>Send Interest</button>
                </>
              )}
            </div>
          )}
          {interestStatus==='sent' && <div className='bg-blue-50 border-2 border-blue-300 p-4 rounded-xl text-center mt-2'><div className='font-bold'>Waiting for acceptance {candidateIsVerified ? '' : '(candidate limited)'}</div><div className='flex gap-2 justify-center mt-3'><button onClick={handleCancel} className='bg-gray-200 px-6 py-2 rounded-full'>❌ Cancel Interest</button></div></div>}
          {interestStatus==='received' && <div className='bg-green-50 border-2 border-green-400 p-4 rounded-xl text-center mt-2'><div className='font-bold'>💌 This user sent you interest! Accept?</div><div className='flex gap-2 justify-center mt-3'><button onClick={handleAcceptReceived} className='bg-green-600 text-white px-6 py-2 rounded-full'>✅ Accept</button><button onClick={handleRejectReceived} className='bg-gray-200 px-6 py-2 rounded-full'>Reject</button></div></div>}
          {interestStatus==='accepted' && (
            <div className='mt-2'>
              {canSeeContact? (
                <div className='bg-green-50 border-2 border-green-300 p-4 rounded-xl'>
                  <div className='font-bold text-green-800'>✅ Contact Details (Secure) {profile.verified_badge && '✓ Verified'}</div>
                  <div className='mt-2'>Phone: {contact?.phone || contact?.phone_number || 'Not available'}</div>
                  <div>Email: {contact?.email || 'Not available'}</div>
                  <div>WhatsApp: {contact?.whatsapp || contact?.whatsapp_number || contact?.phone || 'Not available'}</div>
                  {!contact && <div className='text-xs text-red-600 mt-2'>⚠ No contact row found or payment expired</div>}
                  <button onClick={handleCancel} className='mt-3 bg-orange-100 border px-4 py-2 rounded-full text-sm'>❌ Cancel</button>
                </div>
              ) : (
                <div className='bg-red-50 border-2 border-red-400 p-6 rounded-2xl text-center'>
                  <div className='text-3xl'>🔒</div>
                  <div className='font-bold text-red-800 text-lg'>
                    {!viewerIsPaid? 'You must Pay First!' 
                    :!viewerIsVerified? `Your profile not verified - guardian ${cur?.guardian_contact} pending`
                    :!candidateIsVerified? `${profile.full_name} guardian verification pending - contacts hidden until admin verifies ${profile.guardian_contact ? 'guardian' : ''}`
                    :!candidateIsPaid? `${profile.full_name} not paid yet` 
                    : 'Payment Required'}
                  </div>
                  <div className='text-sm mt-1'>
                    {!viewerIsPaid? `Your profile ${cur?.full_name || 'you'} is ${cur?.subscription_status || 'inactive'}` 
                    :!viewerIsVerified? `Your account is ${viewerVerStatus} - admin will contact ${cur?.guardian_contact}`
                    :!candidateIsVerified? `This profile is ${candidateVerStatus} - limited until guardian verified`
                    : `profile must be active to view contact`}
                  </div>
                  {!viewerIsPaid && <button onClick={handlePay} className='bg-green-600 text-white px-8 py-3 rounded-full font-bold mt-3'>Pay Rs.{renewalPrice} & Unlock</button>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
