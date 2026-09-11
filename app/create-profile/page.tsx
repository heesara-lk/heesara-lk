'use client';
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import { DISTRICTS_SI, JOBS, CASTES, BODY_TYPES, SKIN_COLORS } from '@/lib/supabase-heesara';
import { getCitiesByDistrict, getDistrictEn } from '@/lib/locations';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkFreeSlots } from '@/lib/subscription';

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

function getAge(dobStr:string){ if(!dobStr) return 0; const dob=new Date(dobStr); const today=new Date(); let age=today.getFullYear()-dob.getFullYear(); const m=today.getMonth()-dob.getMonth(); if(m<0 || (m===0 && today.getDate()<dob.getDate())) age--; return age; }
const MAX_DOB_18 = new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split('T')[0]
async function uploadPhotos(files: File[], id: string){ const urls: string[]=[]; for(let i=0;i<files.length && i<3;i++){ const f=files[i]; if(f.size>5*1024*1024) continue; const ext=f.name.split('.').pop(); const pth=`${id}/${Date.now()}-${i}.${ext}`; const {error}=await supabase.storage.from('profile-photos').upload(pth,f,{upsert:true}); if(error) continue; const {data}=supabase.storage.from('profile-photos').getPublicUrl(pth); urls.push(data.publicUrl); } return urls; }

const RELIGIONS = ['Buddhist','Catholic','Christian','Hindu','Islam','Any Other'];
const MARITAL = ['Never Married','Divorced','Widowed','Married'];
const EDUCATIONS = ['Upto O/L','O/L Passed','A/L Passed','Diploma','Degree','Masters','PhD','Any Other'];
const RELIGIONS_ANY = ['Any',...RELIGIONS];
const EDUCATIONS_ANY = ['Any',...EDUCATIONS];
const JOBS_WITH_NATH = JOBS.includes('නැත') ? JOBS : ['නැත', ...JOBS];
const JOBS_WITH_NATH_EXPECT = JOBS.includes('නැත') ? ['Any', ...JOBS] : ['Any', 'නැත', ...JOBS];
const AGE_DROPDOWN = Array.from({length: 53}, (_,i)=> 18 + i);
const HEIGHT_DROPDOWN = Array.from({length: 91}, (_,i)=> 120 + i);

function CreateProfileForm(){
  const router=useRouter(); const searchParams=useSearchParams(); const editId=searchParams.get('edit');
  const [isEditMode,setIsEditMode]=useState(false); const [step,setStep]=useState(1);
  const [photoFiles,setPhotoFiles]=useState<File[]>([]); const [photoPreviews,setPhotoPreviews]=useState<string[]>([]);
  const [agreed18,setAgreed18]=useState(false);
  const [form,setForm]=useState({
    full_name:'',gender:'male',dob:'1995-05-15',
    birth_district_si:DISTRICTS_SI[3],birth_city:'Kandy', living_district_si:DISTRICTS_SI[3],living_city:'Kandy',
    job:JOBS_WITH_NATH[0],caste:CASTES[0], religion:RELIGIONS[0], marital_status:MARITAL[0], education:EDUCATIONS[2],
    height:'170',body_type:BODY_TYPES[1],skin_color:SKIN_COLORS[1],
    birth_hr:'10',birth_min:'30',birth_ampm:'AM', phone:'',email:'', bio:'',
    guardian_contact:'', guardian_relationship:'Mother',
    exp_age_min:'22',exp_age_max:'30',exp_height_min:'150',exp_height_max:'180',
    exp_district:'Any',exp_job:'Any',exp_caste:'Any',exp_religion:'Any',exp_education:'Any',exp_horoscope:'Any',
    is_private:false, hide_phone:true, hide_email:true, photo_blur:false
  });
  const [birthCities,setBirthCities]=useState<string[]>(getCitiesByDistrict(DISTRICTS_SI[3])); 
  const [livingCities,setLivingCities]=useState<string[]>(getCitiesByDistrict(DISTRICTS_SI[3]));
  const [saving,setSaving]=useState(false); const [log,setLog]=useState(''); 
  const [myCount,setMyCount]=useState(0); const [dbCount,setDbCount]=useState(0); 
  const [serverCount,setServerCount]=useState(0); const [isAdmin,setIsAdmin]=useState(false); 
  const [myEmail,setMyEmail]=useState('');
  // NEW: DOB Lock + Time Edit tracking
  const [dobLocked,setDobLocked]=useState(false);
  const [timeEditCount,setTimeEditCount]=useState(0);
  const [timeEditAllowedUntil,setTimeEditAllowedUntil]=useState<string | null>(null);
  const [timeLocked,setTimeLocked]=useState(false);
  const [existingDobOriginal,setExistingDobOriginal]=useState<string | null>(null);

  useEffect(()=>{ const nc=getCitiesByDistrict(form.birth_district_si); setBirthCities(nc); if(!nc.includes(form.birth_city)) setForm(f=>({...f,birth_city:nc[0]})); },[form.birth_district_si]);
  useEffect(()=>{ const nc=getCitiesByDistrict(form.living_district_si); setLivingCities(nc); if(!nc.includes(form.living_city)) setForm(f=>({...f,living_city:nc[0]})); },[form.living_district_si]);

  useEffect(()=>{
    (async()=>{
      const {data}=await supabase.from('profiles').select('id').limit(20);
      setDbCount(data?.length||0);
      try{
        let myIds=JSON.parse(localStorage.getItem('heesara_my_ids')||'[]');
        const dbIds=(data||[]).map((p:any)=>p.id);
        myIds=myIds.filter((id:string)=> dbIds.includes(id));
        localStorage.setItem('heesara_my_ids', JSON.stringify(myIds));
        setMyCount(myIds.length);
      }catch{ setMyCount(0); }
      const { data: { user } } = await supabase.auth.getUser();
      if(user){
        setMyEmail(user.email||'');
        if(isAdminEmail(user.email)) setIsAdmin(true);
        const { count } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('user_id', user.id);
        if(count!==null) setServerCount(count);
      }
    })();
  },[]);

  useEffect(()=>{
    if(editId){
      (async()=>{
        try{
          const { data: { user } } = await supabase.auth.getUser();
          const admin=isAdminEmail(user?.email);
          if(!admin){
            const { data: anyProfile } = await supabase.from('profiles').select('id,user_id').eq('id',editId).single();
            if(anyProfile?.user_id && user && anyProfile.user_id!==user.id){
              let myIdsCheck:string[]=JSON.parse(localStorage.getItem('heesara_my_ids')||'[]');
              if(!myIdsCheck.includes(editId)){
                alert('Not your profile! (old profile has other user_id)');
                router.push('/account');
                return;
              }
            }
          }
        }catch{}

        const {data}=await supabase.from('profiles').select('*').eq('id',editId).single();
        const {data: contactData} = await supabase.from('contacts').select('*').eq('profile_id',editId).maybeSingle();

        if(data){
          setIsEditMode(true);
          setAgreed18(true);
          // DOB Lock logic
          setDobLocked(true);
          setExistingDobOriginal((data as any).dob_original || data.dob || data.birth_date || null);
          const tCount = (data as any).time_edit_count || 0;
          const tUntil = (data as any).time_edit_allowed_until || null;
          setTimeEditCount(tCount);
          setTimeEditAllowedUntil(tUntil);
          // Check if time is locked: count >=1 OR past 48h
          if(tCount >=1) setTimeLocked(true);
          else if(tUntil){
            if(new Date() > new Date(tUntil)) setTimeLocked(true);
          }

          setForm({
            full_name: data.full_name || data.name || '',
            gender: data.gender || 'male',
            dob: data.dob || data.birth_date || '1995-05-15',
            birth_district_si: data.birth_district_si || data.district || DISTRICTS_SI[3],
            birth_city: data.birth_city || '',
            living_district_si: data.current_district_si || data.birth_district_si || DISTRICTS_SI[3],
            living_city: data.current_city || data.birth_city || '',
            job: data.job || JOBS_WITH_NATH[0],
            caste: data.caste || CASTES[0],
            religion: data.religion || RELIGIONS[0],
            marital_status: data.marital_status || MARITAL[0],
            education: data.education || data.education_level || EDUCATIONS[2],
            height: (data.height || data.height_cm || '170').toString(),
            body_type: data.body_type || BODY_TYPES[1],
            skin_color: data.skin_color || SKIN_COLORS[1],
            birth_hr: (data.birth_time_hr?.toString() || '10'),
            birth_min: (data.birth_time_min?.toString() || '30').padStart(2,'0'),
            birth_ampm: data.birth_time_ampm || 'AM',
            phone: contactData?.phone || '',
            email: contactData?.email || '',
            bio: data.bio || data.about || '',
            guardian_contact: (data as any).guardian_contact || '',
            guardian_relationship: (data as any).guardian_relationship || 'Mother',
            exp_age_min: Math.max(18, (data.expectation_age_min || 22)).toString(),
            exp_age_max: Math.max(18, (data.expectation_age_max || 30)).toString(),
            exp_height_min: (data.expectation_height_min || 150).toString(),
            exp_height_max: (data.expectation_height_max || 180).toString(),
            exp_district: data.expectation_district || 'Any',
            exp_job: data.expectation_job || 'Any',
            exp_caste: data.expectation_caste || 'Any',
            exp_religion: data.expectation_religion || 'Any',
            exp_education: data.expectation_education || (data as any).exp_education || 'Any',
            exp_horoscope: data.horoscope_required===true? 'Required' : 'Not Required',
            is_private: data.is_private || false,
            hide_phone: data.hide_phone?? true,
            hide_email: data.hide_email?? true,
            photo_blur: data.photo_blur || (data as any).photo_privacy === 'blur' || false,
          });
        }
      })();
    }
  },[editId]);

  const handleSubmit=async()=>{
    if(!form.full_name.trim()){ alert('Name required'); return; }
    const ageCheck=getAge(form.dob); if(ageCheck<18){ alert(`විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි! Age ${ageCheck}`); setStep(1); return; }
    if(!agreed18 && !isEditMode){ alert('කරුණාකර විවාහ වයස 18+ බව තහවුරු කරන්න / Please confirm 18+ marriage age'); return; }
    const expMin = parseInt(form.exp_age_min); const expMax = parseInt(form.exp_age_max);
    if(isNaN(expMin) || expMin < 18){ alert('Expected min age must be 18+ / අවම වයස 18+ විය යුතුයි'); setStep(3); return; }
    if(isNaN(expMax) || expMax < 18){ alert('Expected max age must be 18+ / උපරිම වයස 18+ විය යුතුයි'); setStep(3); return; }
    if(expMax < expMin){ alert('Max age cannot be less than min age / උපරිම වයස අවම වයසට වඩා අඩු විය නොහැක'); setStep(3); return; }
    const hMin = parseInt(form.exp_height_min); const hMax = parseInt(form.exp_height_max);
    if(isNaN(hMin) || isNaN(hMax)){ alert('Height required'); setStep(3); return; }
    if(hMax < hMin){ alert('Max height cannot be less than min height / උපරිම උස අවම උසට වඩා අඩු විය නොහැක'); setStep(3); return; }
    if(!form.guardian_contact.trim() || form.guardian_contact.length < 9){ alert('Guardian contact required / භාරකරුගේ දුරකථන අංකය අනිවාර්යයි - spam වැළැක්වීමට'); setStep(4); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if(!user){ alert('Please login first'); router.push('/login'); return; }
    const admin=isAdminEmail(user.email);
    if(!admin){
      const { count: sCount } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('user_id', user.id);
      if(!isEditMode && sCount!==null && sCount>=2){ alert('Server: You already have 2 profiles (max 2). Delete one in Account.'); router.push('/account'); return; }
    }
    const {data:checkData}=await supabase.from('profiles').select('id').limit(20);
    let myIds:string[]=[]; try{ myIds=JSON.parse(localStorage.getItem('heesara_my_ids')||'[]'); }catch{}
    const dbIds=(checkData||[]).map((p:any)=>p.id); myIds=myIds.filter((id:string)=> dbIds.includes(id));
    if(!admin &&!isEditMode && myIds.length>=2){ alert('Max 2 reached - clear in account or delete'); router.push('/account'); return; }
    setSaving(true);
    try{
      let existingProfile:any = null;
      if(isEditMode && editId){
        const {data} = await supabase.from('profiles').select('is_free, free_until, plan_expires_at, subscription_status, plan_type, created_at, dob_original, time_edit_count, time_edit_allowed_until, verification_status, guardian_verified').eq('id',editId).single();
        existingProfile = data;
      }

      // NEW: Determine fee tier based on total profiles count (for new profiles only)
      let totalCount = 0;
      try{
        const { count } = await supabase.from('profiles').select('id',{count:'exact',head:true});
        totalCount = count || 0;
      }catch{}
      let feeType: 'free_100' | 'fee_500' | 'fee_1500' = 'free_100';
      let feeAmount = 0;
      let isFreeAvailable = true;
      if(totalCount < 100){ feeType='free_100'; feeAmount=0; isFreeAvailable=true; }
      else if(totalCount < 1000){ feeType='fee_500'; feeAmount=500; isFreeAvailable=false; }
      else { feeType='fee_1500'; feeAmount=1500; isFreeAvailable=false; }

      let freeUntil = '';
      if(!isEditMode){
        const six=new Date(); six.setMonth(six.getMonth()+6);
        freeUntil=six.toISOString().split('T')[0];
      }

      // Time edit logic
      let newTimeEditCount = timeEditCount;
      let newTimeAllowedUntil = timeEditAllowedUntil;
      if(!isEditMode){
        const allowed = new Date(); allowed.setHours(allowed.getHours()+48);
        newTimeAllowedUntil = allowed.toISOString();
        newTimeEditCount = 0;
      } else {
        // If time changed and was allowed, increment count
        const origData = existingProfile;
        if(!timeLocked){
          // We will increment after save if time fields differ - for simplicity increment now if in edit mode and not locked
          // Actually compare old vs new time - handled below
        }
      }

      const age=getAge(form.dob);
      const tob=`${form.birth_hr}:${form.birth_min} ${form.birth_ampm}`;
      let payload:any={
        user_id: user.id, account_type:'self', name:form.full_name, full_name:form.full_name, gender:form.gender, age,
        birth_date:form.dob, dob:form.dob, tob, time_of_birth:tob, birth_time:tob,
        birth_time_hr:parseInt(form.birth_hr), birth_time_min:parseInt(form.birth_min), birth_time_ampm:form.birth_ampm,
        district:form.birth_district_si, birth_district_si:form.birth_district_si, birth_district_en:getDistrictEn(form.birth_district_si), birth_city:form.birth_city,
        current_district_si:form.living_district_si, current_city:form.living_city, pob:form.birth_city, current_district_en:getDistrictEn(form.living_district_si),
        job:form.job, caste:form.caste,
        religion: form.religion, marital_status: form.marital_status, education: form.education, education_level: form.education,
        height_cm:parseInt(form.height)||170, height:form.height, body_type:form.body_type, skin_color:form.skin_color,
        bio: form.bio, about: form.bio,
        expectation_age_min:parseInt(form.exp_age_min), expectation_age_max:parseInt(form.exp_age_max),
        expectation_height_min:parseInt(form.exp_height_min), expectation_height_max:parseInt(form.exp_height_max),
        expectation_district:form.exp_district, expectation_job:form.exp_job, expectation_caste:form.exp_caste, expectation_religion: form.exp_religion, expectation_education: form.exp_education,
        horoscope_required: form.exp_horoscope==='Required',
        is_private: form.is_private, hide_phone: form.hide_phone, hide_email: form.hide_email,
        photo_blur: form.photo_blur,
        // NEW FIELDS - Verification + Guardian
        guardian_contact: form.guardian_contact,
        guardian_relationship: form.guardian_relationship,
        dob_original: isEditMode ? (existingDobOriginal || form.dob) : form.dob,
        time_edit_count: isEditMode ? newTimeEditCount : 0,
        time_edit_allowed_until: newTimeAllowedUntil,
        verification_fee_type: isEditMode ? existingProfile?.verification_fee_type : feeType,
      };

      // Preserve subscription / verification status for edits
      if(isEditMode && existingProfile){
        payload.is_free = existingProfile.is_free;
        payload.free_until = existingProfile.free_until;
        payload.plan_expires_at = existingProfile.plan_expires_at;
        payload.subscription_status = existingProfile.subscription_status;
        payload.plan_type = (existingProfile as any).plan_type;
        // Do NOT overwrite verification_status on edit - keep existing
        // But if time was edited, increment count
        if(!timeLocked && existingProfile){
          const oldHr = (existingProfile as any).birth_time_hr;
          const oldMin = (existingProfile as any).birth_time_min;
          const oldAmpm = (existingProfile as any).birth_time_ampm;
          const timeChanged = String(oldHr) !== form.birth_hr || String(oldMin).padStart(2,'0') !== form.birth_min || oldAmpm !== form.birth_ampm;
          if(timeChanged){
            payload.time_edit_count = (existingProfile.time_edit_count || 0) + 1;
          }
        }
      } else {
        payload.is_free = isFreeAvailable;
        payload.free_until = freeUntil;
        payload.plan_expires_at = freeUntil;
        payload.subscription_status = isFreeAvailable? 'free' : (admin?'free':'pending_payment');
        payload.plan_type = isFreeAvailable? 'free_6m' : 'normal_6m';
        // NEW: Verification starts as limited until guardian verified
        payload.verification_status = 'limited';
        payload.guardian_verified = false;
        payload.verified_badge = false;
        payload.verification_fee_paid = isFreeAvailable || admin;
        payload.report_count = 0;
      }

      let data, error;
      if(isEditMode && editId){
        const res=await supabase.from('profiles').update(payload).eq('id',editId).select().single();
        data=res.data; error=res.error;
      } else {
        const res=await supabase.from('profiles').insert(payload).select().single();
        data=res.data; error=res.error;
      }
      if(error) throw error;

      if(data?.id){
        await supabase.from('contacts').upsert({
          profile_id: data.id,
          phone: form.phone,
          email: form.email,
          whatsapp: form.phone,
          is_visible: true
        }, { onConflict: 'profile_id' });
      }

      if(photoFiles.length>0){
        setLog('Uploading photos...');
        const urls=await uploadPhotos(photoFiles,data.id);
        if(urls.length>0){
          await supabase.from('profiles').update({photo_urls:urls,main_photo_url:urls[0]}).eq('id',data.id);
          try{ await supabase.from('profile_photos').delete().eq('profile_id', data.id); }catch{}
          for(const u of urls){
            try{
              await supabase.from('profile_photos').insert({ profile_id: data.id, url: u, is_primary: u===urls[0] });
            }catch{}
          }
        }
      }
      try{
        await supabase.from('expectations').upsert({
          profile_id: data.id,
          age_min: parseInt(form.exp_age_min) || 22,
          age_max: parseInt(form.exp_age_max) || 30,
          height_min: parseInt(form.exp_height_min) || 150,
          height_max: parseInt(form.exp_height_max) || 180,
          district_pref_en: form.exp_district,
          education: form.exp_education
        }, { onConflict: 'profile_id' });
      }catch{}
      try{
        const existing=JSON.parse(localStorage.getItem('heesara_my_ids')||'[]');
        const dbIds2=(checkData||[]).map((p:any)=>p.id);
        let filtered=existing.filter((id:string)=> dbIds2.includes(id));
        if(!filtered.includes(data.id)){
          filtered.push(data.id);
          localStorage.setItem('heesara_my_ids',JSON.stringify(filtered.slice(0,10)));
        }
      }catch{}
      localStorage.setItem('heesara_current_profile_id',data.id);

      // NEW: Payment logic with tiered fee
      if(!isEditMode &&!isFreeAvailable &&!admin){
        setLog(`Profile created! Creating payment order Rs.${feeAmount} for unlock...`);
        const { data: order, error: orderErr } = await supabase.from('payments').insert({
          user_id: user.id, amount: feeAmount, status: 'pending', profile_id: data.id,
          profile_data: { full_name: form.full_name }, plan_type: feeType
        }).select().single();
        setSaving(false);
        if(orderErr){
          alert('Profile created! But payment order failed: '+orderErr.message+' Go to Account to pay.');
          router.push('/account'); return;
        }
        const goPay = confirm(`Profile created! 🎉\n\n${totalCount < 100 ? 'Free' : `Free 1000 over. Pay Rs.${feeAmount} verification fee to unlock + guardian verification for 6 months.`}\n\nGo to payment?`);
        if(goPay) router.push(`/pay/${order.id}`);
        else router.push('/account');
        return;
      }
      alert(isEditMode? 'Updated! your updated profile saved - DOB locked, time edit counted' : `Created! Guardian verification pending - Admin will contact ${form.guardian_contact} (${form.guardian_relationship})`);
      router.push('/account');
    }catch(e:any){ setLog(e.message); alert('Error: '+e.message); }
    setSaving(false);
  };

  const ANY=['Any',...DISTRICTS_SI]; const J_ANY=JOBS_WITH_NATH_EXPECT; const C_ANY=['Any',...CASTES]; const R_ANY=['Any',...RELIGIONS]; const E_ANY=EDUCATIONS_ANY; const H_ANY=['Any','Required','Not Required']; const currentAge=getAge(form.dob);

  if(!editId &&!isAdmin && (myCount>=2 || serverCount>=2)){
    return (
      <div className='max-w-3xl mx-auto p-6'>
        <div className='flex justify-between mb-4'><button onClick={()=>router.push('/account')} className='border bg-white px-4 py-2 rounded-full'>Back to Account</button><button onClick={()=>router.push('/')} className='border bg-white px-4 py-2 rounded-full'>Home</button></div>
        <div className='bg-red-50 border-2 border-red-400 p-8 rounded-2xl text-center'>
          <h2 className='text-2xl font-bold text-red-700'>Max 2 Profiles Reached! ❌</h2>
          <p className='mt-3 text-gray-700'>My: {myCount}/2 - Server: {serverCount}/2 - Email: {myEmail}</p>
          <div className='mt-3 flex gap-2 justify-center'><button onClick={()=>router.push('/account')} className='mt-0 bg-blue-600 text-white px-8 py-3 rounded-full font-bold'>Go to Account</button></div>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='flex justify-between mb-4'><button onClick={()=>router.push('/account')} className='border bg-white px-4 py-2 rounded-full'>Back to Account</button><button onClick={()=>router.push('/')} className='border bg-white px-4 py-2 rounded-full'>Home</button></div>
      <h1 className='text-2xl font-bold mb-2'>{isEditMode? 'Update Profile' : 'Create Profile'} {isAdmin?'👑':''}</h1>
      <div className={`border-2 p-3 rounded-xl mb-4 font-bold ${isAdmin?'bg-yellow-50 border-yellow-400':'bg-green-50 border-green-300'}`}>{isAdmin?`👑 Admin ${myEmail} - Unlimited`:`My: ${myCount}/2 - Server: ${serverCount}/2 - DB: ${dbCount} - ${myEmail}`} | Age: {currentAge} {dobLocked && <span className='text-red-600'>| DOB Locked</span>}</div>
      <div className='flex gap-2 mb-6'>{[1,2,3,4].map(s=><div key={s} className={`flex-1 h-3 rounded-full ${step>=s?'bg-blue-600':'bg-gray-200'}`}></div>)}</div>
      {step===1 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'><h2 className='font-bold border-b pb-2'>Step 1: Basic & Horoscope ඔබගේ විස්තර සහ කේන්දරයට අවශ්‍ය තොරතුරු </h2><div><label className='text-sm font-bold'>Full Name * සම්පූර්ණ නම</label><input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'/></div><div className='grid grid-cols-2 gap-4'><div><label className='text-sm font-bold'>Gender * ස්ත්‍රී පුරුෂ භාවය</label><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'><option value='male'>Male</option><option value='female'>Female</option></select></div><div><label className='text-sm font-bold'>DOB * උපන් දිනය (Must be 18+) {dobLocked && <span className='text-red-600 text-xs'>🔒 Locked</span>}</label><input type='date' max={MAX_DOB_18} value={form.dob} disabled={dobLocked} onChange={e=>setForm({...form,dob:e.target.value})} className={`w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30 ${currentAge<18?'border-red-500 bg-red-50':''} ${dobLocked?'bg-gray-100 opacity-60 cursor-not-allowed':''}`}/>{currentAge<18 && <div className='text-red-600 text-xs font-bold mt-1'>Age {currentAge} - Must be 18+</div>}{dobLocked ? <div className='text-[11px] text-red-600 font-bold mt-1 bg-red-50 border border-red-200 p-2 rounded'>🔒 උපන් දිනය වෙනස් කිරීමට support@heesara.lk contact කරන්න — DOB locked after first save to prevent broker misuse. Original: {existingDobOriginal || form.dob}</div> : <div className='text-[11px] text-gray-500 mt-1'>විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි - 18+ marriage age only — After save, DOB cannot be edited by yourself.</div>}</div></div><div><label className='text-sm font-bold'>Birth Time * උපන් වේලාව (ඔබ හැර කිසිවෙකුට දැක ගැනීමට නොහැකිය) {timeLocked && <span className='text-red-600 text-xs'>🔒 Locked</span>} {timeEditCount>0 && <span className='text-xs text-orange-600'>(Edited {timeEditCount}/1)</span>}</label><div className='grid grid-cols-3 gap-2'><select value={form.birth_hr} disabled={timeLocked} onChange={e=>setForm({...form,birth_hr:e.target.value})} className={`w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30 ${timeLocked?'bg-gray-100 opacity-60 cursor-not-allowed':''}`}>{Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h.toString()}>{h}</option>)}</select><select value={form.birth_min} disabled={timeLocked} onChange={e=>setForm({...form,birth_min:e.target.value})} className={`w-full border-2 p-3 rounded-lg  border-green-300 bg-green-50/30 ${timeLocked?'bg-gray-100 opacity-60 cursor-not-allowed':''}`}>{Array.from({length:60},(_,i)=>String(i).padStart(2,'0')).map(m=><option key={m} value={m}>{m}</option>)}</select><select value={form.birth_ampm} disabled={timeLocked} onChange={e=>setForm({...form,birth_ampm:e.target.value})} className={`w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30 ${timeLocked?'bg-gray-100 opacity-60 cursor-not-allowed':''}`}><option value='AM'>AM</option><option value='PM'>PM</option></select></div>{timeLocked ? <p className='text-[11px] text-red-600 mt-1 bg-red-50 border border-red-200 p-2 rounded'>🔒 වේලාව 1 වතාවක් පමණක් 48h තුළ වෙනස් කළ හැක — Time locked after {timeEditCount} edit(s). Contact support@heesara.lk for further change.</p> : <p className='text-[11px] text-amber-600 mt-1 bg-amber-50 border border-amber-200 p-2 rounded'>⚠️ වේලාව 1 වතාවක් පමණක් 48h තුළ වෙනස් කළ හැක — Time can be edited only ONCE within 48h. {timeEditAllowedUntil && `Until: ${new Date(timeEditAllowedUntil).toLocaleString()}`}</p>}<p className='text-[11px] text-gray-500 mt-1 bg-amber-50 border border-amber-200 p-2 rounded'>🔮 පොරොන්දම් 20 ගැලපීම සංස්කෘතික විශ්වාසයක් සඳහා පමණයි, ජ්යෝතිෂ සහතිකයක් නොවේ. Porondam matching is cultural belief for information only, not astrological guarantee. Birth time is private, never shown to others.</p></div><button disabled={currentAge<18} onClick={()=>setStep(2)} className={`w-full py-3 rounded-full font-bold ${currentAge<18?'bg-gray-300':'bg-blue-600 text-white'}`}>Next</button></div>}
      {step===2 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'>
        <h2 className='font-bold border-b pb-2'>Step 2: Place & Job & Religion ස්ථානය සහ රැකියාව සහ ආගම</h2>
        <div><label className='text-sm font-bold text-red-700'>Birth District * උපන් දිස්ත්‍රික්කය</label><select value={form.birth_district_si} onChange={e=>setForm({...form,birth_district_si:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{DISTRICTS_SI.map((d:any)=><option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className='text-sm font-bold text-red-700'>Birth City * උපන් නගරය</label><select value={form.birth_city} onChange={e=>setForm({...form,birth_city:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{birthCities.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className='text-sm font-bold text-blue-700'>Living District * පදිංචි දිස්ත්‍රික්කය</label><select value={form.living_district_si} onChange={e=>setForm({...form,living_district_si:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{DISTRICTS_SI.map((d:any)=><option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className='text-sm font-bold text-blue-700'>Living City * පදිංචි නගරය</label><select value={form.living_city} onChange={e=>setForm({...form,living_city:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{livingCities.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div>
        <div className='grid grid-cols-2 gap-4'><div><label className='text-sm font-bold'>Job රැකියාව * {form.job==='නැත' && <span className='text-xs text-gray-500'></span>}</label><select value={form.job} onChange={e=>setForm({...form,job:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{JOBS_WITH_NATH.map((j:any)=><option key={j} value={j}>{j}</option>)}</select></div><div><label className='text-sm font-bold'>Caste කුලය</label><select value={form.caste} onChange={e=>setForm({...form,caste:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{CASTES.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div></div>
        <div className='grid grid-cols-3 gap-4'>
          <div><label className='text-sm font-bold'>Religion ආගම</label><select value={form.religion} onChange={e=>setForm({...form,religion:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{RELIGIONS.map((r:any)=><option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className='text-sm font-bold'>Marital විවාහ තත්ත්වය</label><select value={form.marital_status} onChange={e=>setForm({...form,marital_status:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{MARITAL.map((m:any)=><option key={m} value={m}>{m}</option>)}</select></div>
          <div><label className='text-sm font-bold'>Education අධ්‍යාපනය</label><select value={form.education} onChange={e=>setForm({...form,education:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{EDUCATIONS.map((ed:any)=><option key={ed} value={ed}>{ed}</option>)}</select></div>
        </div>
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <label className='text-sm font-bold'>Height උස cm *</label>
            <select value={form.height} onChange={e=>setForm({...form,height:e.target.value})} className='w-full border-2 p-3 rounded-lg  border-purple-300'>
              {HEIGHT_DROPDOWN.map((h:any)=><option key={h} value={h.toString()}>{h} cm</option>)}
            </select>
            <p className='text-[11px] text-gray-500 mt-1'>120-210 cm</p>
          </div>
          <div><label className='text-sm font-bold'>Body ශරීර ස්වරූපය</label><select value={form.body_type} onChange={e=>setForm({...form,body_type:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{BODY_TYPES.map((b:any)=><option key={b} value={b}>{b}</option>)}</select></div><div><label className='text-sm font-bold'>Skin සමේ වර්ණය</label><select value={form.skin_color} onChange={e=>setForm({...form,skin_color:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{SKIN_COLORS.map((s:any)=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className='flex gap-3'><button onClick={()=>setStep(1)} className='flex-1 bg-gray-200 py-3 rounded-full'>Back</button><button onClick={()=>setStep(3)} className='flex-1 bg-blue-600 text-white py-3 rounded-full font-bold'>Next</button></div></div>}
      {step===3 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'><h2 className='font-bold border-b pb-2'>Step 3: බලාපොරොත්තු - ඔබ සොයන කෙනා සතු විය යුතු ලක්ෂණ
        </h2>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-bold'>Min Age අවම වයස * (18+ only)</label>
            <select value={form.exp_age_min} onChange={e=>{
              const newMin = parseInt(e.target.value);
              const curMax = parseInt(form.exp_age_max);
              setForm({...form, exp_age_min:e.target.value, exp_age_max: curMax < newMin ? e.target.value : form.exp_age_max});
            }} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>
              {AGE_DROPDOWN.map((age:any)=><option key={age} value={age.toString()}>{age} years</option>)}
            </select>
            <p className='text-[11px] text-gray-500 mt-1'>විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි</p>
          </div>
          <div>
            <label className='text-sm font-bold'>Max Age උපරිම වයස * (18+ only)</label>
            <select value={form.exp_age_max} onChange={e=>{
              const newMax = parseInt(e.target.value);
              const curMin = parseInt(form.exp_age_min);
              if(newMax < curMin){
                alert('Max cannot be less than Min / උපරිමය අවමයට වඩා අඩු විය නොහැක');
                return;
              }
              setForm({...form,exp_age_max:e.target.value});
            }} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>
              {AGE_DROPDOWN.filter((a:any)=> a >= parseInt(form.exp_age_min || '18')).map((age:any)=><option key={age} value={age.toString()}>{age} years</option>)}
            </select>            
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-bold'>Min Height අවම උස cm *</label>
            <select value={form.exp_height_min} onChange={e=>{
              const newMin = parseInt(e.target.value);
              const curMax = parseInt(form.exp_height_max);
              setForm({...form, exp_height_min:e.target.value, exp_height_max: curMax < newMin ? e.target.value : form.exp_height_max});
            }} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>
              {HEIGHT_DROPDOWN.map((h:any)=><option key={h} value={h.toString()}>{h} cm</option>)}
            </select>            
          </div>
          <div>
            <label className='text-sm font-bold'>Max Height උපරිම උස cm *</label>
            <select value={form.exp_height_max} onChange={e=>{
              const newMax = parseInt(e.target.value);
              const curMin = parseInt(form.exp_height_min);
              if(newMax < curMin){
                alert('Max height cannot be less than min height / උපරිම උස අවම උසට වඩා අඩු විය නොහැක');
                return;
              }
              setForm({...form,exp_height_max:e.target.value});
            }} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>
              {HEIGHT_DROPDOWN.filter((h:any)=> h >= parseInt(form.exp_height_min || '120')).map((h:any)=><option key={h} value={h.toString()}>{h} cm</option>)}
            </select>          
          </div>
        </div>
        <div><label className='text-sm font-bold'>Expected Living District බලාපොරොත්තුවන පදිංචි දිස්ත්‍රික්කය</label><select value={form.exp_district} onChange={e=>setForm({...form,exp_district:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>{ANY.map((d:any)=><option key={d} value={d}>{d}</option>)}</select></div>
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='text-sm font-bold'>Expected Job බලාපොරොත්තුවන රැකියාව</label><select value={form.exp_job} onChange={e=>setForm({...form,exp_job:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>{J_ANY.map((j:any)=><option key={j} value={j}>{j}</option>)}</select><p className='text-[11px] text-gray-500 mt-1'>ගෘහණියක් බලාපොරොත්තු වේ නම් නැත තෝරන්න</p></div>
          <div><label className='text-sm font-bold'>Expected Education අධ්‍යාපනය</label><select value={form.exp_education} onChange={e=>setForm({...form,exp_education:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'><option value='Any'>Any - ඕනෑම</option>{EDUCATIONS.map((ed:any)=><option key={ed} value={ed}>{ed}</option>)}</select></div>
        </div>
        <div><label className='text-sm font-bold'>Expected Caste බලාපොරොත්තුවන කුලය</label><select value={form.exp_caste} onChange={e=>setForm({...form,exp_caste:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>{C_ANY.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div><div><label className='text-sm font-bold'>Expected Religion බලාපොරොත්තුවන ආගම</label><select value={form.exp_religion} onChange={e=>setForm({...form,exp_religion:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>{R_ANY.map((r:any)=><option key={r} value={r}>{r}</option>)}</select></div><div><label className='text-sm font-bold'>Horoscope Required? කේන්දරය අවශ්‍යද?</label><select value={form.exp_horoscope} onChange={e=>setForm({...form,exp_horoscope:e.target.value})} className='w-full border-2 p-3 rounded-lg border-green-300 bg-green-50/30'>{H_ANY.map((h:any)=><option key={h} value={h}>{h}</option>)}</select></div><div className='flex gap-3'><button onClick={()=>setStep(2)} className='flex-1 bg-gray-200 py-3 rounded-full border-green-300 bg-green-50/30'>Back</button><button onClick={()=>setStep(4)} className='flex-1 bg-blue-600 text-white py-3 rounded-full font-bold'>Next: Photos & Privacy & Guardian</button></div></div>}
      {step===4 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'>
        <h2 className='font-bold border-b pb-2'>Step 4: About + Photos + Contact + Guardian Verification</h2>
        <div className='bg-amber-50 border-2 border-amber-200 rounded-xl p-4'>
          <label className='text-sm font-bold mb-1 block'>About / Bio - ඔබ ගැන කෙටියෙන් *</label>
          <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder='උදා: මම ගුරුවරයෙක්, පවුලේ... බලාපොරොත්තු...' className='w-full border-2 p-3 rounded-lg h-24' maxLength={500}></textarea>
          <div className='text-xs text-gray-500 mt-1'>{form.bio.length}/500</div>
        </div>
        <div className='border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50'><label className='text-sm font-bold mb-2 block'>Photos (Max 3)</label><input type='file' accept='image/*' multiple onChange={e=>{ const fs=Array.from(e.target.files||[]).slice(0,3) as File[]; setPhotoFiles(fs); setPhotoPreviews(fs.map(f=>URL.createObjectURL(f))); }} className='w-full border-2 bg-white p-3 rounded-lg'/>{photoPreviews.length>0 && <div className='grid grid-cols-3 gap-2 mt-3'>{photoPreviews.map((s,i)=><img key={i} src={s} className='w-full h-24 object-cover rounded-lg border-2 border-green-300'/>)}</div>}</div>
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='text-sm font-bold'>Phone (Your)</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div>
          <div><label className='text-sm font-bold'>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div>
        </div>
        <div className='bg-green-50 border-2 border-green-400 p-4 rounded-xl space-y-3'>
          <h3 className='font-bold text-sm text-green-800'>🛡️ Guardian Verification - Spam වැළැක්වීමට (Required)</h3>
          <p className='text-[11px] text-green-700'>Fun / time-pass profiles වලක්වන්න භාරකරුගේ අංකයක් අනිවාර්යයි. Admin will call guardian to release contacts.</p>
          <div className='grid grid-cols-2 gap-3'>
            <div><label className='text-sm font-bold'>Guardian Phone * භාරකරුගේ දුරකථනය</label><input value={form.guardian_contact} onChange={e=>setForm({...form,guardian_contact:e.target.value})} placeholder='07xxxxxxxx' className='w-full border-2 border-green-300 p-3 rounded-lg bg-white'/></div>
            <div><label className='text-sm font-bold'>Relationship සම්බන්ධතාව</label><select value={form.guardian_relationship} onChange={e=>setForm({...form,guardian_relationship:e.target.value})} className='w-full border-2 border-green-300 p-3 rounded-lg bg-white'><option value='Mother'>Mother / මව</option><option value='Father'>Father / පියා</option><option value='Brother'>Brother / සහෝදරයා</option><option value='Sister'>Sister / සහෝදරිය</option><option value='Guardian'>Guardian / භාරකරු</option></select></div>
          </div>
          <div className='text-[11px] text-gray-600 bg-white p-2 rounded border'>ℹ️ Contacts hidden until admin verifies guardian contact. This prevents spam. භාරකරු අමතා තහවුරු කිරීමෙන් පසු පමණක් admin විසින් ඔබේ ගිණුම තහවුරු කරනු ඇත.</div>
        </div>
        <div className='bg-gray-50 border-2 border-gray-200 p-4 rounded-xl space-y-3'><h3 className='font-bold text-sm'>Privacy Settings - ඔබේ පුද්ගලිකත්වය ආරක්ෂා කර ගැනීමට භාවිතා කරන්න.</h3><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Private Profile</span><input type='checkbox' checked={form.is_private} onChange={e=>setForm({...form,is_private:e.target.checked})} className='w-5 h-5'/></label><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Hide Phone until match</span><input type='checkbox' checked={form.hide_phone} onChange={e=>setForm({...form,hide_phone:e.target.checked})} className='w-5 h-5'/></label><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Hide Email until match</span><input type='checkbox' checked={form.hide_email} onChange={e=>setForm({...form,hide_email:e.target.checked})} className='w-5 h-5'/></label><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Blur Photos until accepted</span><input type='checkbox' checked={form.photo_blur} onChange={e=>setForm({...form,photo_blur:e.target.checked})} className='w-5 h-5'/></label></div>
        
        <div className='bg-[#5a1620]/5 border-2 border-[#5a1620]/20 rounded-xl p-4 space-y-3'>
          <h3 className='font-bold text-sm text-[#5a1620]'>Legal Confirmation / නීතිමය තහවුරු කිරීම</h3>
          <label className='flex gap-3 items-start bg-white p-3 rounded-lg border-2 border-green-300'>
            <input type='checkbox' checked={agreed18} onChange={e=>setAgreed18(e.target.checked)} className='w-5 h-5 mt-0.5' />
            <span className='text-sm leading-relaxed'>
              <b>✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) බව තහවුරු කරමි</b> / I confirm I am 18+ marriage age<br/>
              <span className='text-[11px] text-gray-600'>Heesara does NOT guarantee marriage. Profiles are posted by users, we only show matches. User must verify before proceeding. PDPA Act No.9 of 2022 compliant - data used only for matching, not selling.</span><br/>
              <span className='text-[11px] text-gray-600'>🔮 පොරොන්දම් 20 is cultural belief for information only, not astrological guarantee.</span>
            </span>
          </label>
          <p className='text-[11px] text-gray-500'>Contact: support@heesara.lk | contact@heesara.lk - Galle, Sri Lanka</p>
        </div>

        <div className='flex gap-3'><button onClick={()=>setStep(3)} className='flex-1 bg-gray-200 py-3 rounded-full'>Back</button><button disabled={saving || (!agreed18 && !isEditMode)} onClick={handleSubmit} className={`flex-1 py-3 rounded-full font-bold ${saving || (!agreed18 && !isEditMode) ? 'bg-gray-300' : 'bg-green-600 text-white'}`}>{saving?'Saving...':(isEditMode?'Update (DOB Locked)':'Create - Guardian Verification Pending')}</button></div><div className='text-sm text-red-600'>{log}</div></div>}
    </div>
  );
}
export default function CreateProfilePage(){ return (<Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><CreateProfileForm /></Suspense>); }
