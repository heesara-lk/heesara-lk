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

// NEW CONSTANTS
const RELIGIONS = ['Buddhist','Catholic','Christian','Hindu','Islam','Any Other'];
const MARITAL = ['Never Married','Divorced','Widowed','Married'];
const EDUCATIONS = ['Upto O/L','O/L Passed','A/L Passed','Diploma','Degree','Masters','PhD','Any Other'];
const RELIGIONS_ANY = ['Any',...RELIGIONS];

function CreateProfileForm(){
  const router=useRouter(); const searchParams=useSearchParams(); const editId=searchParams.get('edit');
  const [isEditMode,setIsEditMode]=useState(false); const [step,setStep]=useState(1);
  const [photoFiles,setPhotoFiles]=useState<File[]>([]); const [photoPreviews,setPhotoPreviews]=useState<string[]>([]);
  const [form,setForm]=useState({
    full_name:'',gender:'male',dob:'1995-05-15',
    birth_district_si:DISTRICTS_SI[3],birth_city:'Kandy', living_district_si:DISTRICTS_SI[3],living_city:'Kandy',
    job:JOBS[0],caste:CASTES[0], religion:RELIGIONS[0], marital_status:MARITAL[0], education:EDUCATIONS[2],
    height:'170',body_type:BODY_TYPES[1],skin_color:SKIN_COLORS[1],
    birth_hr:'10',birth_min:'30',birth_ampm:'AM', phone:'',email:'', bio:'',
    exp_age_min:'22',exp_age_max:'30',exp_height_min:'150',exp_height_max:'180',
    exp_district:'Any',exp_job:'Any',exp_caste:'Any',exp_religion:'Any',exp_horoscope:'Any',
    is_private:false, hide_phone:true, hide_email:true, photo_blur:false
  });
  const [birthCities,setBirthCities]=useState<string[]>(getCitiesByDistrict(DISTRICTS_SI[3])); const [livingCities,setLivingCities]=useState<string[]>(getCitiesByDistrict(DISTRICTS_SI[3]));
  const [saving,setSaving]=useState(false); const [log,setLog]=useState(''); const [myCount,setMyCount]=useState(0); const [dbCount,setDbCount]=useState(0); const [serverCount,setServerCount]=useState(0); const [isAdmin,setIsAdmin]=useState(false); const [myEmail,setMyEmail]=useState('');

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
          setForm({
            full_name: data.full_name || data.name || '',
            gender: data.gender || 'male',
            dob: data.dob || data.birth_date || '1995-05-15',
            birth_district_si: data.birth_district_si || data.district || DISTRICTS_SI[3],
            birth_city: data.birth_city || '',
            living_district_si: data.current_district_si || data.birth_district_si || DISTRICTS_SI[3],
            living_city: data.current_city || data.birth_city || '',
            job: data.job || JOBS[0],
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
            exp_age_min: (data.expectation_age_min || 22).toString(),
            exp_age_max: (data.expectation_age_max || 30).toString(),
            exp_height_min: (data.expectation_height_min || 150).toString(),
            exp_height_max: (data.expectation_height_max || 180).toString(),
            exp_district: data.expectation_district || 'Any',
            exp_job: data.expectation_job || 'Any',
            exp_caste: data.expectation_caste || 'Any',
            exp_religion: data.expectation_religion || 'Any',
            exp_horoscope: data.horoscope_required===true? 'Required' : 'Not Required',
            is_private: data.is_private || false,
            hide_phone: data.hide_phone?? true,
            hide_email: data.hide_email?? true,
            photo_blur: data.photo_blur || data.photo_privacy === 'blur' || false,
          });
        }
      })();
    }
  },[editId]);

  const handleSubmit=async()=>{
    if(!form.full_name.trim()){ alert('Name required'); return; }
    const ageCheck=getAge(form.dob); if(ageCheck<18){ alert(`18+ only! Age ${ageCheck}`); setStep(1); return; }
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
    if(!admin &&!isEditMode && myIds.length>=2){ alert('Max 2 reached (local) - clear in account or delete'); router.push('/account'); return; }
    setSaving(true);
    try{
      let existingProfile:any = null;
      if(isEditMode && editId){
        const {data} = await supabase.from('profiles').select('is_free, free_until, plan_expires_at, subscription_status, plan_type, created_at').eq('id',editId).single();
        existingProfile = data;
      }
      let isFreeAvailable = true;
      let freeUntil = '';
      if(!isEditMode){
        const freeCheck = await checkFreeSlots();
        isFreeAvailable = freeCheck.isFreeAvailable;
        const six=new Date(); six.setMonth(six.getMonth()+6);
        freeUntil=six.toISOString().split('T')[0];
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
        expectation_district:form.exp_district, expectation_job:form.exp_job, expectation_caste:form.exp_caste, expectation_religion: form.exp_religion,
        horoscope_required: form.exp_horoscope==='Required',
        is_private: form.is_private, hide_phone: form.hide_phone, hide_email: form.hide_email,
        photo_blur: form.photo_blur,
      };
      if(isEditMode && existingProfile){
        payload.is_free = existingProfile.is_free;
        payload.free_until = existingProfile.free_until;
        payload.plan_expires_at = existingProfile.plan_expires_at;
        payload.subscription_status = existingProfile.subscription_status;
        payload.plan_type = (existingProfile as any).plan_type;
      } else {
        payload.is_free = isFreeAvailable;
        payload.free_until = freeUntil;
        payload.plan_expires_at = freeUntil;
        payload.subscription_status = isFreeAvailable? 'free' : (admin?'free':'pending_payment');
        payload.plan_type = isFreeAvailable? 'free_6m' : 'normal_6m';
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
                    for(const u of urls){
            try{
              await supabase.from('profile_photos').insert({ profile_id: data.id, url: u, is_primary: u===urls[0] });
            }catch{}
          }
        }
      }
      try{
        await supabase.from('expectations').insert({
          profile_id: data.id,
          age_min: parseInt(form.exp_age_min) || 22,
          age_max: parseInt(form.exp_age_max) || 30
        });
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
      if(!isEditMode &&!isFreeAvailable &&!admin){
        setLog('Profile created! Creating payment order for unlock...');
        const { data: order, error: orderErr } = await supabase.from('payments').insert({
          user_id: user.id, amount: 1500, status: 'pending', profile_id: data.id,
          profile_data: { full_name: form.full_name }, plan_type: 'normal_6m'
        }).select().single();
        setSaving(false);
        if(orderErr){
          alert('Profile created! But payment order failed: '+orderErr.message+' Go to Account to pay.');
          router.push('/account'); return;
        }
        const goPay = confirm(`Profile created! 🎉\n\nFree 1000 over. Pay Rs.1500 to unlock contacts & matches for 6 months.\n\nGo to payment?`);
        if(goPay) router.push(`/pay/${order.id}`);
        else router.push('/account');
        return;
      }
      alert(isEditMode? 'Updated! your updated profile saved' : 'Created!');
      router.push('/account');
    }catch(e:any){ setLog(e.message); alert('Error: '+e.message); }
    setSaving(false);
  };

  const ANY=['Any',...DISTRICTS_SI]; const J_ANY=['Any',...JOBS]; const C_ANY=['Any',...CASTES]; const R_ANY=['Any',...RELIGIONS]; const H_ANY=['Any','Required','Not Required']; const currentAge=getAge(form.dob);

  if(!editId &&!isAdmin && (myCount>=2 || serverCount>=2)){
    return (
      <div className='max-w-3xl mx-auto p-6'>
        <div className='flex justify-between mb-4'><button onClick={()=>router.push('/account')} className='border bg-white px-4 py-2 rounded-full'>Back to Account</button><button onClick={()=>router.push('/')} className='border bg-white px-4 py-2 rounded-full'>Home</button></div>
        <div className='bg-red-50 border-2 border-red-400 p-8 rounded-2xl text-center'>
          <h2 className='text-2xl font-bold text-red-700'>Max 2 Profiles Reached! ❌</h2>
          <p className='mt-3 text-gray-700'>My: {myCount}/2 - Server: {serverCount}/2 - Email: {myEmail} - Admin: {isAdmin?'YES':'NO'}</p>
          <div className='mt-3 flex gap-2 justify-center'><button onClick={()=>{localStorage.removeItem('heesara_my_ids'); location.reload()}} className='bg-yellow-500 text-white px-4 py-2 rounded-full'>Clear Local Block</button><button onClick={()=>router.push('/account')} className='mt-0 bg-blue-600 text-white px-8 py-3 rounded-full font-bold'>Go to Account</button></div>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='flex justify-between mb-4'><button onClick={()=>router.push('/account')} className='border bg-white px-4 py-2 rounded-full'>Back to Account</button><button onClick={()=>router.push('/')} className='border bg-white px-4 py-2 rounded-full'>Home</button></div>
      <h1 className='text-2xl font-bold mb-2'>{isEditMode? 'Update Profile' : 'Create Profile'} {isAdmin?'👑':''}</h1>
      <div className={`border-2 p-3 rounded-xl mb-4 font-bold ${isAdmin?'bg-yellow-50 border-yellow-400':'bg-green-50 border-green-300'}`}>{isAdmin?`👑 Admin ${myEmail} - Unlimited`:`My: ${myCount}/2 - Server: ${serverCount}/2 - DB: ${dbCount} - ${myEmail}`} | Age: {currentAge}</div>
      <div className='flex gap-2 mb-6'>{[1,2,3,4].map(s=><div key={s} className={`flex-1 h-3 rounded-full ${step>=s?'bg-blue-600':'bg-gray-200'}`}></div>)}</div>
      {step===1 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'><h2 className='font-bold border-b pb-2'>Step 1: Basic + Horoscope සාමාන්‍ය විස්තර සහ කේන්දරයට අවශ්‍ය තොරතුරු </h2><div><label className='text-sm font-bold'>Full Name * සම්පූර්ණ නම</label><input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div><div className='grid grid-cols-2 gap-4'><div><label className='text-sm font-bold'>Gender ස්ත්‍රී පුරුෂ භාවය</label><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className='w-full border-2 p-3 rounded-lg'><option value='male'>Male</option><option value='female'>Female</option></select></div><div><label className='text-sm font-bold'>DOB * උපන් දිනය (Must be 18+)</label><input type='date' max={MAX_DOB_18} value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} className={`w-full border-2 p-3 rounded-lg ${currentAge<18?'border-red-500 bg-red-50':''}`}/>{currentAge<18 && <div className='text-red-600 text-xs font-bold mt-1'>Age {currentAge} - Must be 18+</div>}</div></div><div><label className='text-sm font-bold'>Birth Time * උපන් වේලාව</label><div className='grid grid-cols-3 gap-2'><select value={form.birth_hr} onChange={e=>setForm({...form,birth_hr:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h.toString()}>{h}</option>)}</select><select value={form.birth_min} onChange={e=>setForm({...form,birth_min:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{Array.from({length:60},(_,i)=>String(i).padStart(2,'0')).map(m=><option key={m} value={m}>{m}</option>)}</select><select value={form.birth_ampm} onChange={e=>setForm({...form,birth_ampm:e.target.value})} className='w-full border-2 p-3 rounded-lg'><option value='AM'>AM</option><option value='PM'>PM</option></select></div></div><button disabled={currentAge<18} onClick={()=>setStep(2)} className={`w-full py-3 rounded-full font-bold ${currentAge<18?'bg-gray-300':'bg-blue-600 text-white'}`}>Next</button></div>}
      {step===2 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'>
        <h2 className='font-bold border-b pb-2'>Step 2: Place & Job & Religion ස්ථානය සහ රැකියාව සහ ආගම</h2>
        <div><label className='text-sm font-bold text-red-700'>Birth District * උපන් දිස්ත්‍රික්කය</label><select value={form.birth_district_si} onChange={e=>setForm({...form,birth_district_si:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{DISTRICTS_SI.map((d:any)=><option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className='text-sm font-bold text-red-700'>Birth City * උපන් නගරය</label><select value={form.birth_city} onChange={e=>setForm({...form,birth_city:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{birthCities.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className='text-sm font-bold text-blue-700'>Living District * පදිංචි දිස්ත්‍රික්කය</label><select value={form.living_district_si} onChange={e=>setForm({...form,living_district_si:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{DISTRICTS_SI.map((d:any)=><option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className='text-sm font-bold text-blue-700'>Living City * පදිංචි නගරය</label><select value={form.living_city} onChange={e=>setForm({...form,living_city:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{livingCities.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div>
        <div className='grid grid-cols-2 gap-4'><div><label className='text-sm font-bold'>Job රැකියාව</label><select value={form.job} onChange={e=>setForm({...form,job:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{JOBS.map((j:any)=><option key={j} value={j}>{j}</option>)}</select></div><div><label className='text-sm font-bold'>Caste කුලය</label><select value={form.caste} onChange={e=>setForm({...form,caste:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{CASTES.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div></div>
        <div className='grid grid-cols-3 gap-4'>
          <div><label className='text-sm font-bold'>Religion ආගම</label><select value={form.religion} onChange={e=>setForm({...form,religion:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{RELIGIONS.map((r:any)=><option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className='text-sm font-bold'>Marital විවාහ තත්ත්වය</label><select value={form.marital_status} onChange={e=>setForm({...form,marital_status:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{MARITAL.map((m:any)=><option key={m} value={m}>{m}</option>)}</select></div>
          <div><label className='text-sm font-bold'>Education අධ්‍යාපනය</label><select value={form.education} onChange={e=>setForm({...form,education:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{EDUCATIONS.map((ed:any)=><option key={ed} value={ed}>{ed}</option>)}</select></div>
        </div>
        <div className='grid grid-cols-3 gap-4'><div><label className='text-sm font-bold'>Height උස cm</label><input value={form.height} onChange={e=>setForm({...form,height:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div><div><label className='text-sm font-bold'>Body ශරීර ස්වරූපය</label><select value={form.body_type} onChange={e=>setForm({...form,body_type:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{BODY_TYPES.map((b:any)=><option key={b} value={b}>{b}</option>)}</select></div><div><label className='text-sm font-bold'>Skin සමේ වර්ණය</label><select value={form.skin_color} onChange={e=>setForm({...form,skin_color:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{SKIN_COLORS.map((s:any)=><option key={s} value={s}>{s}</option>)}</select></div></div>
        <div className='flex gap-3'><button onClick={()=>setStep(1)} className='flex-1 bg-gray-200 py-3 rounded-full'>Back</button><button onClick={()=>setStep(3)} className='flex-1 bg-blue-600 text-white py-3 rounded-full font-bold'>Next</button></div></div>}
      {step===3 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'><h2 className='font-bold border-b pb-2'>Step 3: බලාපොරොත්තු</h2><div className='grid grid-cols-2 gap-4'><div><label className='text-sm font-bold'>Min Age අවම වයස</label><input type='number' value={form.exp_age_min} onChange={e=>setForm({...form,exp_age_min:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div><div><label className='text-sm font-bold'>Max Age උපරිම වයස</label><input type='number' value={form.exp_age_max} onChange={e=>setForm({...form,exp_age_max:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div></div><div className='grid grid-cols-2 gap-4'><div><label className='text-sm font-bold'>Min Height අවම උස cm</label><input type='number' value={form.exp_height_min} onChange={e=>setForm({...form,exp_height_min:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div><div><label className='text-sm font-bold'>Max Height උපරිම උස cm</label><input type='number' value={form.exp_height_max} onChange={e=>setForm({...form,exp_height_max:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div></div><div><label className='text-sm font-bold'>Expected Living District බලාපොරොත්තුවන පදිංචි දිස්ත්‍රික්කය</label><select value={form.exp_district} onChange={e=>setForm({...form,exp_district:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{ANY.map((d:any)=><option key={d} value={d}>{d}</option>)}</select></div><div><label className='text-sm font-bold'>Expected Job බලාපොරොත්තුවන රැකියාව</label><select value={form.exp_job} onChange={e=>setForm({...form,exp_job:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{J_ANY.map((j:any)=><option key={j} value={j}>{j}</option>)}</select></div><div><label className='text-sm font-bold'>Expected Caste බලාපොරොත්තුවන කුලය</label><select value={form.exp_caste} onChange={e=>setForm({...form,exp_caste:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{C_ANY.map((c:any)=><option key={c} value={c}>{c}</option>)}</select></div><div><label className='text-sm font-bold'>Expected Religion බලාපොරොත්තුවන ආගම</label><select value={form.exp_religion} onChange={e=>setForm({...form,exp_religion:e.target.value})} className='w-full border-2 p-3 rounded-lg border-purple-300'>{R_ANY.map((r:any)=><option key={r} value={r}>{r}</option>)}</select></div><div><label className='text-sm font-bold'>Horoscope Required? කේන්දරය අවශ්‍යයද?</label><select value={form.exp_horoscope} onChange={e=>setForm({...form,exp_horoscope:e.target.value})} className='w-full border-2 p-3 rounded-lg'>{H_ANY.map((h:any)=><option key={h} value={h}>{h}</option>)}</select></div><div className='flex gap-3'><button onClick={()=>setStep(2)} className='flex-1 bg-gray-200 py-3 rounded-full'>Back</button><button onClick={()=>setStep(4)} className='flex-1 bg-blue-600 text-white py-3 rounded-full font-bold'>Next: Photos & Privacy</button></div></div>}
      {step===4 && <div className='space-y-4 border p-6 rounded-xl bg-white shadow'>
        <h2 className='font-bold border-b pb-2'>Step 4: About + Photos + Contact + Privacy</h2>
        <div className='bg-amber-50 border-2 border-amber-200 rounded-xl p-4'>
          <label className='text-sm font-bold mb-1 block'>About / Bio - ඔබ ගැන කෙටියෙන් *</label>
          <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder='උදා: මම ගුරුවරයෙක්, පවුලේ... බලාපොරොත්තු...' className='w-full border-2 p-3 rounded-lg h-24' maxLength={500}></textarea>
          <div className='text-xs text-gray-500 mt-1'>{form.bio.length}/500</div>
        </div>
        <div className='border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50'><label className='text-sm font-bold mb-2 block'>Photos (Max 3)</label><input type='file' accept='image/*' multiple onChange={e=>{ const fs=Array.from(e.target.files||[]).slice(0,3) as File[]; setPhotoFiles(fs); setPhotoPreviews(fs.map(f=>URL.createObjectURL(f))); }} className='w-full border-2 bg-white p-3 rounded-lg'/>{photoPreviews.length>0 && <div className='grid grid-cols-3 gap-2 mt-3'>{photoPreviews.map((s,i)=><img key={i} src={s} className='w-full h-24 object-cover rounded-lg border-2 border-green-300'/>)}</div>}</div>
        <div><label className='text-sm font-bold'>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div>
        <div><label className='text-sm font-bold'>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className='w-full border-2 p-3 rounded-lg'/></div>
        <div className='bg-gray-50 border-2 border-gray-200 p-4 rounded-xl space-y-3'><h3 className='font-bold text-sm'>Privacy Settings</h3><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Private Profile</span><input type='checkbox' checked={form.is_private} onChange={e=>setForm({...form,is_private:e.target.checked})} className='w-5 h-5'/></label><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Hide Phone until match</span><input type='checkbox' checked={form.hide_phone} onChange={e=>setForm({...form,hide_phone:e.target.checked})} className='w-5 h-5'/></label><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Hide Email until match</span><input type='checkbox' checked={form.hide_email} onChange={e=>setForm({...form,hide_email:e.target.checked})} className='w-5 h-5'/></label><label className='flex justify-between items-center bg-white p-3 rounded-lg border'><span className='text-sm'>Blur Photos until accepted</span><input type='checkbox' checked={form.photo_blur} onChange={e=>setForm({...form,photo_blur:e.target.checked})} className='w-5 h-5'/></label></div>
        <div className='flex gap-3'><button onClick={()=>setStep(3)} className='flex-1 bg-gray-200 py-3 rounded-full'>Back</button><button disabled={saving} onClick={handleSubmit} className='flex-1 bg-green-600 text-white py-3 rounded-full font-bold'>{saving?'Saving...':(isEditMode?'Update':'Create')}</button></div><div className='text-sm text-red-600'>{log}</div></div>}
    </div>
  );
}
export default function CreateProfilePage(){ return (<Suspense fallback={<div className='p-8 text-center'>Loading...</div>}><CreateProfileForm /></Suspense>); }