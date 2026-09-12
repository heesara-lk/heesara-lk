"use client"
import { useState, useEffect } from 'react'
import { supabase, DISTRICTS_SI, JOBS, CASTES } from '@/lib/supabase-heesara'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const RELIGIONS = ['Buddhist','Catholic','Christian','Hindu','Islam','Any Other'];
const RELIGIONS_SI: Record<string,string> = { 'Buddhist':'බෞද්ධ','Catholic':'කතෝලික','Christian':'ක්‍රිස්තියානි','Hindu':'හින්දු','Islam':'ඉස්ලාම්','Any Other':'වෙනත්' };

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com','heesara.support@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

// LEGAL AGE CONSTANTS - විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි
const MIN_AGE = 18;
const MAX_AGE = 70;
const AGE_OPTIONS = Array.from({length: MAX_AGE - MIN_AGE + 1}, (_, i) => MIN_AGE + i);
// NEW: Height constants 120-210 cm with max>min rule
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 210;
const HEIGHT_OPTIONS = Array.from({length: MAX_HEIGHT - MIN_HEIGHT + 1}, (_, i) => MIN_HEIGHT + i);
// NEW: Education for search filter (same as create-profile)
const EDUCATIONS = ['Upto O/L','O/L Passed','A/L Passed','Diploma','Degree','Masters','PhD','Any Other'];

// Add 'නැත' for housewife - culturally needed
const JOBS_WITH_NATH = JOBS.includes('නැත') ? JOBS : ['නැත', ...JOBS];

export default function SearchPage(){
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [photosMap, setPhotosMap] = useState<Record<string,string>>({})
  const [filters, setFilters] = useState({ gender:'any', district_si:'any', job:'any', caste:'any', religion:'any', education:'any', age_min:'18', age_max:'60', height_min:'120', height_max:'210' })
  const [loading, setLoading] = useState(false)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [myIds, setMyIds] = useState<string[]>([])
  const [interests, setInterests] = useState<Record<string,string>>({})
  const [myProfiles, setMyProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myEmail, setMyEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(()=>{
    try{ const ids=JSON.parse(localStorage.getItem('heesara_my_ids')||'[]'); setMyIds(ids); }catch{}
    try{ const ints=JSON.parse(localStorage.getItem('heesara_interests')||'{}'); setInterests(ints); }catch{}
    initAdminAndProfiles()
  },[])

  const initAdminAndProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAdmin(isAdminEmail(user?.email))
    setMyEmail(user?.email||'')
    setIsLoggedIn(!!user)
    setAuthChecked(true)
    try{
      const myIdsList = JSON.parse(localStorage.getItem('heesara_my_ids')||'[]')
      const curId = localStorage.getItem('heesara_current_profile_id') || myIdsList[0]
      if(myIdsList.length>0){
        const { data } = await supabase.from('profiles').select('*').in('id', myIdsList)
        setMyProfiles(data||[])
      }
      if(curId){
        const { data } = await supabase.from('profiles').select('*').eq('id', curId).single()
        if(data){
          setCurrentProfile(data);
          setMyProfile(data);
          const opposite = data.gender==='male'? 'female' : data.gender==='female'? 'male' : 'any';
          setFilters(f=>({...f, gender:opposite}));
          loadProfiles(opposite);
          return
        }
      }
      loadProfiles('any')
    }catch{ loadProfiles('any') }
  }

  // NEW: Login guard - fixes Application error when guest clicks View
  const requireLogin = (actionName: string = 'view profile') => {
    if(!authChecked) return false
    if(!isLoggedIn){
      const go = confirm(`🔒 Please login to ${actionName}\n\nහීසර.lk බලන්න login විය යුතුයි.\n\nGo to login?`)
      if(go) router.push('/login')
      return false
    }
    if(!currentProfile && myProfiles.length===0 && !isAdmin){
      const go = confirm(`📝 Please create a profile first to ${actionName}\n\nපළමුව ඔබගේ profile එක සාදන්න.\n\nCreate now?`)
      if(go) router.push('/create-profile')
      return false
    }
    return true
  }

  const handleView = (profileId: string) => {
    if(!requireLogin('view profile details')) return
    router.push(`/profile/${profileId}`)
  }

  const handleInterestClick = (p:any) => {
    if(!requireLogin('send interest')) return
    sendInterest(p)
  }

  const switchActiveProfile = async (id:string) => {
    localStorage.setItem('heesara_current_profile_id', id)
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if(data){
      setCurrentProfile(data); setMyProfile(data);
      const opposite = data.gender==='male'? 'female' : data.gender==='female'? 'male' : 'any';
      setFilters(f=>({...f, gender:opposite})); loadProfiles(opposite);
    }
  }

  // Age handlers - enforce 18+ only
  const handleAgeMinChange = (val: string) => {
    let num = parseInt(val) || MIN_AGE;
    if (num < MIN_AGE) num = MIN_AGE;
    if (num > MAX_AGE) num = MAX_AGE;
    const currentMax = parseInt(filters.age_max) || MAX_AGE;
    if (num > currentMax) {
      setFilters({...filters, age_min: num.toString(), age_max: num.toString()});
    } else {
      setFilters({...filters, age_min: num.toString()});
    }
  }

  const handleAgeMaxChange = (val: string) => {
    let num = parseInt(val) || MAX_AGE;
    if (num < MIN_AGE) num = MIN_AGE;
    if (num > MAX_AGE) num = MAX_AGE;
    const currentMin = parseInt(filters.age_min) || MIN_AGE;
    if (num < currentMin) num = currentMin;
    setFilters({...filters, age_max: num.toString()});
  }

  // NEW: Height handlers - same max>min rule as age
  const handleHeightMinChange = (val: string) => {
    let num = parseInt(val) || MIN_HEIGHT;
    if (num < MIN_HEIGHT) num = MIN_HEIGHT;
    if (num > MAX_HEIGHT) num = MAX_HEIGHT;
    const currentMax = parseInt(filters.height_max) || MAX_HEIGHT;
    if (num > currentMax) {
      setFilters({...filters, height_min: num.toString(), height_max: num.toString()});
    } else {
      setFilters({...filters, height_min: num.toString()});
    }
  }

  const handleHeightMaxChange = (val: string) => {
    let num = parseInt(val) || MAX_HEIGHT;
    if (num < MIN_HEIGHT) num = MIN_HEIGHT;
    if (num > MAX_HEIGHT) num = MAX_HEIGHT;
    const currentMin = parseInt(filters.height_min) || MIN_HEIGHT;
    if (num < currentMin) num = currentMin;
    setFilters({...filters, height_max: num.toString()});
  }

  const loadProfiles = async (genderOverride?:string) => {
    setLoading(true)
    const genderToUse = genderOverride!== undefined? genderOverride : filters.gender
    const { data, error } = await supabase.from('profiles').select('*').neq('is_visible', false).order('created_at',{ascending:false}).limit(100)
    if(error){ console.error(error); setLoading(false); return }
    let filtered = data || []
    filtered = filtered.filter((p:any)=> p.is_visible!== false)
    try{
      const myIdsList = JSON.parse(localStorage.getItem('heesara_my_ids')||'[]');
      if(myIdsList.length>0) filtered = filtered.filter((p:any)=>!myIdsList.includes(p.id))
      const curId = localStorage.getItem('heesara_current_profile_id');
      if(curId) filtered = filtered.filter((p:any)=>p.id!==curId);
    }catch{}

    if(genderToUse!=='any') filtered = filtered.filter((p:any)=>p.gender===genderToUse)

    if(filters.district_si!=='any'){
      const SI_TO_EN: Record<string,string> = {
        'අම්පාර':'Ampara','අනුරාධපුර':'Anuradhapura','බදුල්ල':'Badulla','මඩකලපුව':'Batticaloa','කොළඹ':'Colombo','ගාල්ල':'Galle','ගම්පහ':'Gampaha','හම්බන්තොට':'Hambantota','යාපනය':'Jaffna','කළුතර':'Kalutara','මහනුවර':'Kandy','කෑගල්ල':'Kegalle','කිලිනොච්චිය':'Kilinochchi','කුරුණෑගල':'Kurunegala','මන්නාරම':'Mannar','මාතලේ':'Matale','මාතර':'Matara','මොනරාගල':'Monaragala','මුලතිව්':'Mullaitivu','නුවරඑළිය':'Nuwara Eliya','පොලොන්නරුව':'Polonnaruwa','පුත්තලම':'Puttalam','රත්නපුර':'Ratnapura','ත්‍රිකුණාමලය':'Trincomalee','වවුනියාව':'Vavuniya'
      };
      const en = SI_TO_EN[filters.district_si] || ''
      filtered = filtered.filter((p:any)=>{
        const d_si = p.district_si || p.living_district_si || p.current_district_si || p.birth_district_si
        const d_en = p.district_en || p.living_district_en
        const city = p.living_city || p.birth_city || p.current_city || p.pob_city_en
        return d_si===filters.district_si || d_en===en || d_en===filters.district_si || city===filters.district_si || (en && d_en && d_en.toLowerCase()===en.toLowerCase())
      })
    }
    if(filters.job!=='any') filtered = filtered.filter((p:any)=> p.job_main===filters.job || p.job===filters.job || p.job_main_en===filters.job)
    if(filters.caste!=='any') filtered = filtered.filter((p:any)=> p.caste_main===filters.caste || p.caste===filters.caste)
    if(filters.religion!=='any') filtered = filtered.filter((p:any)=> p.religion===filters.religion)
    if(filters.education!=='any') filtered = filtered.filter((p:any)=> p.education===filters.education || p.education_level===filters.education)

    if(filters.age_min || filters.age_max){
      const min = Math.max(parseInt(filters.age_min)||MIN_AGE, MIN_AGE)
      const max = Math.max(parseInt(filters.age_max)||MAX_AGE, MIN_AGE)
      filtered = filtered.filter((p:any)=>{
        const dob = p.dob || p.birth_date
        if(!dob) return true
        const age = new Date().getFullYear() - new Date(dob).getFullYear()
        return age>=min && age<=max
      })
    }
    if(filters.height_min || filters.height_max){
      const minH = parseInt(filters.height_min)||MIN_HEIGHT
      const maxH = parseInt(filters.height_max)||MAX_HEIGHT
      filtered = filtered.filter((p:any)=>{
        const h = p.height_cm || parseInt(p.height) || 0
        if(!h) return true
        return h>=minH && h<=maxH
      })
    }
    setProfiles(filtered)
    if(filtered.length>0){
      const ids = filtered.map((p:any)=>p.id)
      const { data: photos } = await supabase.from('profile_photos').select('profile_id, url, is_primary').in('profile_id', ids)
      const map: Record<string,string> = {}
      if(photos){
        const grouped: Record<string, any[]> = {}
        photos.forEach((ph:any)=>{ if(!grouped[ph.profile_id]) grouped[ph.profile_id]=[]; grouped[ph.profile_id].push(ph) })
        Object.keys(grouped).forEach(pid=>{
          const arr = grouped[pid]; const primary = arr.find((a:any)=>a.is_primary) || arr[0]; map[pid]=primary.url
        })
      }
      setPhotosMap(map)
    }
    setLoading(false)
  }

  const sendInterest = async (toProfile:any) => {
    if(!myProfile){ alert('මුලින්ම ඔබේ profile එක හදන්න!'); router.push('/create-profile'); return }
    if(myProfile.id===toProfile.id || myIds.includes(toProfile.id)){ alert('ඔබේම profile එකට interest යවන්න බෑ'); return }
    const { error } = await supabase.from('interests').insert({
      from_profile: myProfile.id, to_profile: toProfile.id, status:'pending',
      compatibility_score: Math.floor(Math.random()*20)+70
    })
    if(error) alert('Error: '+error.message)
    else {
      const newInts = {...interests, [toProfile.id]:'sent'};
      localStorage.setItem('heesara_interests', JSON.stringify(newInts));
      setInterests(newInts);
      alert('Interest යැව්වා '+(toProfile.full_name||toProfile.name)+' ට!')
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded p-6 shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#7B1F2A]">🔍 Search කරන්න</h1>
            <div className="flex gap-2">
              {!authChecked ? null : !isLoggedIn ? (
                <Link href="/login" className="text-sm bg-[#5a1620] text-white px-4 py-2 rounded-xl font-bold">🔒 Login</Link>
              ) : (
                <Link href="/" className="text-sm border px-4 py-2 rounded-xl">Home</Link>
              )}
            </div>
          </div>

          {authChecked && !isLoggedIn && (
            <div className='bg-yellow-50 border-2 border-yellow-400 p-4 rounded-xl mt-4 text-center'>
              <h3 className='font-bold text-[#5a1620]'>👀 Guest View</h3>
              <p className='text-xs mt-1'>🔒 Please <Link href='/login' className='text-blue-600 underline font-bold'>Login</Link> or <Link href='/create-profile' className='text-blue-600 underline font-bold'>Create Profile</Link> to view full details, porondam matching & send interest</p>
            </div>
          )}

          {myProfiles.length>0 && (
            <div className='bg-white border-2 border-blue-200 p-3 rounded-xl mt-4 mb-2'>
              <div className='font-bold mb-2 text-sm'>Switch Profiles: ({myProfiles.length}/2) {isAdmin? 'ADMIN '+myEmail : myEmail} {myProfiles.filter((p:any)=>p.is_visible===false).length>0? `(${myProfiles.filter((p:any)=>p.is_visible===false).length} Hidden)` : ''}</div>
              <div className='flex gap-2 flex-wrap'>
                {myProfiles.map((p:any)=>(
                  <button key={p.id} onClick={()=>switchActiveProfile(p.id)} className={'px-4 py-2 rounded-full border font-bold text-sm ' + (currentProfile?.id===p.id?'bg-blue-600 text-white':'bg-white') + (p.is_visible===false?'!bg-yellow-100!border-yellow-400':'')}>{p.name||p.full_name} {currentProfile?.id===p.id?' (Active)':''} {p.is_visible===false?' (Hidden)':''}</button>
                ))}
              </div>
            </div>
          )}
          {currentProfile && (
            <div className='bg-blue-50 border p-3 rounded-xl mb-4 text-xs'>
              <div className='font-bold'>Viewing as: {currentProfile.name||currentProfile.full_name} - Showing: {currentProfile.gender==='male'?'Female':'Male'} only</div>
              <div className='text-[11px] text-gray-600 mt-1'>⚠ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි - 18+ marriage age only</div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs font-bold">ස්ත්‍රී/පුරුෂ</label><select value={filters.gender} onChange={e=>{ const v=e.target.value; setFilters({...filters, gender:v}); loadProfiles(v); }} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300"><option value="any">ඕනෑම</option><option value="male">පුරුෂ</option><option value="female">ස්ත්‍රී</option></select></div>
            <div><label className="text-xs font-bold">දිස්ත්‍රික්කය</label><select value={filters.district_si} onChange={e=>setFilters({...filters, district_si:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300"><option value="any">ඕනෑම</option>{DISTRICTS_SI.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label className="text-xs font-bold">ආගම</label><select value={filters.religion} onChange={e=>setFilters({...filters, religion:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300"><option value="any">ඕනෑම</option>{RELIGIONS.map(r=><option key={r} value={r}>{RELIGIONS_SI[r]} - {r}</option>)}</select></div>
            <div><label className="text-xs font-bold">රැකියාව</label><select value={filters.job} onChange={e=>setFilters({...filters, job:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300"><option value="any">ඕනෑම</option>{JOBS_WITH_NATH.map(j=><option key={j}>{j}</option>)}</select></div>
            <div><label className="text-xs font-bold">කුලය</label><select value={filters.caste} onChange={e=>setFilters({...filters, caste:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300"><option value="any">ඕනෑම</option>{CASTES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold">වයස අවම</label>
                <select value={filters.age_min} onChange={e=>handleAgeMinChange(e.target.value)} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300">
                  {AGE_OPTIONS.map(age=><option key={age} value={age.toString()}>{age}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold">වයස උපරිම</label>
                <select value={filters.age_max} onChange={e=>handleAgeMaxChange(e.target.value)} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300">
                  {AGE_OPTIONS.map(age=><option key={age} value={age.toString()}>{age}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold">උස අවම cm</label>
                <select value={filters.height_min} onChange={e=>handleHeightMinChange(e.target.value)} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300">
                  {HEIGHT_OPTIONS.map(h=><option key={h} value={h.toString()}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold">උස උපරිම cm</label>
                <select value={filters.height_max} onChange={e=>handleHeightMaxChange(e.target.value)} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300">
                  {HEIGHT_OPTIONS.filter(h=> h >= parseInt(filters.height_min || '120')).map(h=><option key={h} value={h.toString()}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold">අධ්‍යාපනය</label>
              <select value={filters.education} onChange={e=>setFilters({...filters, education:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm bg-purple-50 border-purple-300">
                <option value="any">ඕනෑම</option>
                {EDUCATIONS.map(ed=><option key={ed} value={ed}>{ed}</option>)}
              </select>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">⚠ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි - Search shows 18+ only. Porondam matching is cultural belief only.</p>
          <button onClick={()=>loadProfiles()} disabled={loading} className="mt-4 w-full md:w-auto bg-[#7B1F2A] text-white px-6 py-2 rounded-xl text-sm font-bold">{loading?'හොයනවා...':'🔍 Search කරන්න'}</button>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {profiles.map(p=>{
              const dob = p.dob || p.birth_date
              const age = dob? new Date().getFullYear() - new Date(dob).getFullYear() : '?'
              const photo = photosMap[p.id] || p.main_photo_url || p.photo_urls?.[0]
              const interestStatus = interests[p.id] || 'none'
              const isOwn = myIds.includes(p.id)
              const isPrivate =!isOwn && p.photo_privacy!==false && interestStatus!=='accepted'
              const isGuest = !isLoggedIn
              return (
                <div key={p.id} className="bg-gray-50 rounded overflow-hidden border hover:shadow-lg transition">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {photo? <img src={photo} alt={p.full_name||p.name} className="w-full h-full object-cover" style={{filter: isPrivate || isGuest ? 'blur(12px) brightness(0.9)' : 'none'}} /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                    {(isPrivate || isGuest) && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20"><span className="text-xl">🔒</span><span className="text- bg-white/90 px-2 py-0.5 rounded-full font-bold mt-1 text-black text-xs">{isGuest ? 'Login to view' : 'Private until accepted'}</span></div>)}
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-bold">{p.gender==='male'?'👨':'👩'} {age} {p.religion? `| ${p.religion}`:''}</div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{p.full_name || p.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">💼 {p.job_main || p.job} | {p.religion||'Any'} | {p.caste||''} | 🎓 {p.education||p.education_level||''} | 📏 {p.height_cm||p.height||''}cm</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={()=>handleView(p.id)} className="flex-1 border text-center py-2 rounded-xl text-xs bg-white hover:bg-gray-50">
                        {isLoggedIn ? 'View' : '🔒 Login to View'}
                      </button>
                      <button onClick={()=>handleInterestClick(p)} className="flex-1 bg-[#2D8A4E] text-white py-2 rounded-xl text-xs font-bold hover:bg-green-700">
                        {isLoggedIn ? '💌 Interest' : '🔒 Login to Interest'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
