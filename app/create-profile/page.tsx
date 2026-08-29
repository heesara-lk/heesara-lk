"use client"
import { useState, useEffect } from 'react'
import { DISTRICTS_SI, CITIES_SI, JOBS, CASTES, BODY_TYPES, SKIN_COLORS, supabase } from '@/lib/supabase-heesara'
import { calculateHoroscope } from '@/lib/horoscope'

const DISTRICTS_EN = ['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya']
const MAX_PROFILES_PER_USER = 2

export default function CreateProfile(){
  const [user, setUser] = useState<any>(null)
  const [myProfilesCount, setMyProfilesCount] = useState(0)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [tobHour, setTobHour] = useState('10')
  const [tobMin, setTobMin] = useState('30')
  const [tobAmPm, setTobAmPm] = useState('AM')

  const [form, setForm] = useState({
    account_type:'self', full_name:'', gender:'male', dob:'', 
    birth_district_si:DISTRICTS_SI[4], birth_district_en:'Colombo',
    birth_city:CITIES_SI[0], current_district_si:DISTRICTS_SI[4], current_district_en:'Colombo',
    job:JOBS[0], job_custom:'', caste:CASTES[0], caste_custom:'', 
    height:'', body_type:BODY_TYPES[1], skin_color:SKIN_COLORS[1],
    bio:'',
    age_min:'20', age_max:'35', job_pref:'any', caste_pref:'any', horoscope_required:true, min_porondam:'10',
    height_min:''
  })

  useEffect(()=>{
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      const curUser = u || session?.user
      setUser(curUser || null)
      if(curUser){
        const { count } = await supabase.from('profiles').select('id', {count:'exact', head:true}).eq('user_id', curUser.id)
        setMyProfilesCount(count||0)
      }
    }
    init()
  },[])

  const getTob24 = () => {
    let h = parseInt(tobHour)
    const m = parseInt(tobMin)
    if(tobAmPm==='PM' && h!==12) h+=12
    if(tobAmPm==='AM' && h===12) h=0
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`
  }

  const handleSave = async () => {
    if(myProfilesCount >= MAX_PROFILES_PER_USER){
      alert(`❌ Limit! එක email එකකට profiles ${MAX_PROFILES_PER_USER}යි max. Scam වලක්වන්න. My Account page එකේ delete කරලා අලුතෙන් හදන්න.`)
      return
    }
    if(!form.full_name || !form.dob){ alert('නම, උපන් දිනය අනිවාර්යයි'); return }
    setSaving(true)
    try{
      const isJobCustom = form.job.includes('වෙනත්')
      const isCasteCustom = form.caste.includes('වෙනත්')
      const finalJob = isJobCustom ? form.job_custom : form.job
      const finalCaste = isCasteCustom ? form.caste_custom : form.caste
      const tob24 = getTob24()
      const horo = calculateHoroscope(form.dob, tob24, form.birth_city, 6.9, 79.8)

      const { count: totalCount } = await supabase.from('profiles').select('id', {count:'exact', head:true})
      const freeNumber = (totalCount||0)+1

      const insertData:any = {
        account_type: form.account_type,
        full_name: form.full_name,
        gender: form.gender,
        dob: form.dob,
        tob: tob24,
        pob_district_en: form.birth_district_en,
        pob_city_en: form.birth_city,
        pob_lat: horo.lat, pob_lng: horo.lng,
        lagna: horo.lagna, rashi: horo.rashi,
        job_main: finalJob, job_custom: isJobCustom ? form.job_custom : null,
        caste_main: finalCaste, caste_custom: isCasteCustom ? form.caste_custom : null,
        height_cm: parseInt(form.height) || null,
        body_type: form.body_type,
        skin_color: form.skin_color,
        district_en: form.current_district_en,
        bio: form.bio,
        free_slot_number: freeNumber
      }
      if(user) insertData.user_id = user.id

      const { data: profile, error: pErr } = await supabase.from('profiles').insert(insertData).select().single()
      if(pErr) throw pErr

      const { error: eErr } = await supabase.from('expectations').insert({
        profile_id: profile.id,
        job_required: 'any',
        job_pref_main: form.job_pref,
        age_min: parseInt(form.age_min), age_max: parseInt(form.age_max),
        caste_pref_main: form.caste_pref,
        horoscope_required: form.horoscope_required,
        min_porondam: parseInt(form.min_porondam),
        district_pref_en: form.current_district_en,
        height_min: parseInt(form.height_min) || null
      })
      if(eErr) throw eErr

      alert(`✅ Profile හැදුවා! Free Slot #${freeNumber} ${freeNumber<=1000 ? '(Free! 🎉)' : '(Paid needed)'}`)
      window.location.href='/photos'
    }catch(err:any){
      alert('Error: '+err.message)
    }finally{ setSaving(false) }
  }

  const updateBirthDistrict = (si:string) => {
    const idx = DISTRICTS_SI.indexOf(si)
    setForm({...form, birth_district_si: si, birth_district_en: DISTRICTS_EN[idx] || 'Colombo'})
  }
  const updateCurrentDistrict = (si:string) => {
    const idx = DISTRICTS_SI.indexOf(si)
    setForm({...form, current_district_si: si, current_district_en: DISTRICTS_EN[idx] || 'Colombo'})
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[24px] p-6 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#7B1F2A]">Profile හදන්න</h1>
          <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">Step {step}/3 | {myProfilesCount}/{MAX_PROFILES_PER_USER}</span>
        </div>
        {user ? <p className="text-xs mt-1 text-green-600">✅ Logged as {user.email} | Profiles {myProfilesCount}/{MAX_PROFILES_PER_USER}</p> : <p className="text-xs mt-1 text-orange-600">⚠️ Test mode - not logged in | Production එකේ login අනිවාර්යයි</p>}
        {myProfilesCount>=MAX_PROFILES_PER_USER && <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">❌ Limit reached! එක email එකකට profiles {MAX_PROFILES_PER_USER}යි. My Account එකේ delete කරලා හදන්න.</div>}

        {step===1 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-bold text-[#7B1F2A]">1. කා වෙනුවෙන්ද?</h2>
            <div className="grid grid-cols-3 gap-2">
              {[{en:'self', si:'මටම'},{en:'parent', si:'දරුවාට'},{en:'guardian', si:'භාරකරු'}].map(t=>(
                <button key={t.en} onClick={()=>setForm({...form, account_type:t.en})} className={`p-3 rounded-xl border-2 text-sm ${form.account_type===t.en?'border-[#7B1F2A] bg-[#FFF8E7] font-bold':'border-gray-200'}`}>{t.si}</button>
              ))}
            </div>
            <div><label className="text-sm font-semibold">සම්පූර්ණ නම *</label><input placeholder="උදා: නිමල් පෙරේරා" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">ස්ත්‍රී / පුරුෂ *</label><select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"><option value="male">පුරුෂ</option><option value="female">ස්ත්‍රී</option></select></div>
              <div><label className="text-sm font-semibold">උස (cm)</label><input type="number" placeholder="175" value={form.height} onChange={e=>setForm({...form, height:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">ශරීර ස්වභාවය</label><select value={form.body_type} onChange={e=>setForm({...form, body_type:e.target.value})} className="w-full mt-1 p-3 border rounded-xl">{BODY_TYPES.map(b=><option key={b}>{b}</option>)}</select></div>
              <div><label className="text-sm font-semibold">සමේ වර්ණය</label><select value={form.skin_color} onChange={e=>setForm({...form, skin_color:e.target.value})} className="w-full mt-1 p-3 border rounded-xl">{SKIN_COLORS.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div><label className="text-sm font-semibold">ඔබ ගැන</label><textarea placeholder="ඔබ ගැන..." value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" rows={2} /></div>
            <button onClick={()=>setStep(2)} disabled={myProfilesCount>=MAX_PROFILES_PER_USER} className="w-full bg-[#7B1F2A] text-white p-3 rounded-xl font-bold disabled:opacity-30">ඊළඟ ➡️</button>
          </div>
        )}

        {step===2 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-bold text-[#7B1F2A]">2. උපන් විස්තර</h2>
            <div><label className="text-sm font-semibold">📅 උපන් දිනය *</label><input type="date" value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" /></div>
            <div>
              <label className="text-sm font-semibold">⏰ උපන් වේලාව * (Hr/Min/AM-PM)</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <select value={tobHour} onChange={e=>setTobHour(e.target.value)} className="p-3 border rounded-xl"><option value="">Hr</option>{Array.from({length:12},(_,i)=>{const h=i+1; return <option key={h} value={String(h)}>{h}</option>})}</select>
                <select value={tobMin} onChange={e=>setTobMin(e.target.value)} className="p-3 border rounded-xl"><option value="">Min</option>{Array.from({length:60},(_,i)=><option key={i} value={String(i).padStart(2,'0')}>{String(i).padStart(2,'0')}</option>)}</select>
                <select value={tobAmPm} onChange={e=>setTobAmPm(e.target.value)} className="p-3 border rounded-xl"><option>AM</option><option>PM</option></select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">📍 උපන් දිස්ත්‍රික්කය</label><select value={form.birth_district_si} onChange={e=>updateBirthDistrict(e.target.value)} className="w-full mt-1 p-3 border rounded-xl">{DISTRICTS_SI.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label className="text-sm font-semibold">🏙️ උපන් නගරය</label><select value={form.birth_city} onChange={e=>setForm({...form, birth_city:e.target.value})} className="w-full mt-1 p-3 border rounded-xl">{CITIES_SI.map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div><label className="text-sm font-semibold">🏠 දැන් දිස්ත්‍රික්කය</label><select value={form.current_district_si} onChange={e=>updateCurrentDistrict(e.target.value)} className="w-full mt-1 p-3 border rounded-xl">{DISTRICTS_SI.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label className="text-sm font-semibold">💼 රැකියාව</label><select value={form.job} onChange={e=>setForm({...form, job:e.target.value})} className="w-full mt-1 p-3 border rounded-xl">{JOBS.map(j=><option key={j}>{j}</option>)}</select>{form.job.includes('වෙනත්') && <input placeholder="type කරන්න" value={form.job_custom} onChange={e=>setForm({...form, job_custom:e.target.value})} className="w-full mt-2 p-3 border-2 border-[#D4A017] rounded-xl" />}</div>
            <div><label className="text-sm font-semibold">👪 කුලය</label><select value={form.caste} onChange={e=>setForm({...form, caste:e.target.value})} className="w-full mt-1 p-3 border rounded-xl">{CASTES.map(c=><option key={c}>{c}</option>)}</select>{form.caste.includes('වෙනත්') && <input placeholder="type කරන්න" value={form.caste_custom} onChange={e=>setForm({...form, caste_custom:e.target.value})} className="w-full mt-2 p-3 border-2 border-[#D4A017] rounded-xl" />}</div>
            <div className="flex gap-2"><button onClick={()=>setStep(1)} className="flex-1 border p-3 rounded-xl">⬅️</button><button onClick={()=>setStep(3)} className="flex-[2] bg-[#7B1F2A] text-white p-3 rounded-xl font-bold">ඊළඟ ➡️</button></div>
          </div>
        )}

        {step===3 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-bold text-[#7B1F2A]">3. බලාපොරොත්තු</h2>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-semibold">වයස අවම</label><input type="number" value={form.age_min} onChange={e=>setForm({...form, age_min:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" /></div>
              <div><label className="text-sm font-semibold">වයස උපරිම</label><input type="number" value={form.age_max} onChange={e=>setForm({...form, age_max:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" /></div>
              <div><label className="text-sm font-semibold">උස අවම</label><input type="number" value={form.height_min} onChange={e=>setForm({...form, height_min:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">බලාපොරොත්තු රැකියාව</label><select value={form.job_pref} onChange={e=>setForm({...form, job_pref:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"><option value="any">ඕනෑම</option>{JOBS.map(j=><option key={j}>{j}</option>)}</select></div>
              <div><label className="text-sm font-semibold">බලාපොරොත්තු කුලය</label><select value={form.caste_pref} onChange={e=>setForm({...form, caste_pref:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"><option value="any">ඕනෑම</option>{CASTES.map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold">කේන්දරය?</label><select value={form.horoscope_required ? 'yes':'no'} onChange={e=>setForm({...form, horoscope_required:e.target.value==='yes'})} className="w-full mt-1 p-3 border rounded-xl"><option value="yes">ඔව්</option><option value="no">නෑ</option></select></div>
              <div><label className="text-sm font-semibold">අවම පොරොන්දම්</label><select value={form.min_porondam} onChange={e=>setForm({...form, min_porondam:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"><option value="5">5+</option><option value="10">10+</option><option value="15">15+</option><option value="18">18+</option></select></div>
            </div>
            <div className="flex gap-2 pt-4"><button onClick={()=>setStep(2)} className="flex-1 border p-3 rounded-xl">⬅️</button><button onClick={handleSave} disabled={saving || myProfilesCount>=MAX_PROFILES_PER_USER} className="flex-[2] bg-[#2D8A4E] text-white p-3 rounded-xl font-bold disabled:opacity-30">{saving ? 'Save...' : '✅ Save'}</button></div>
          </div>
        )}
      </div>
    </main>
  )
}
