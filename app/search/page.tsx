"use client"
import { useState, useEffect } from 'react'
import { supabase, DISTRICTS_SI, JOBS, CASTES } from '@/lib/supabase-heesara'
import Link from 'next/link'

const DISTRICTS_EN = ['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya']

export default function SearchPage(){
  const [profiles, setProfiles] = useState<any[]>([])
  const [photosMap, setPhotosMap] = useState<Record<string,string>>({})
  const [filters, setFilters] = useState({ gender:'any', district_si:'any', job:'any', caste:'any', age_min:'18', age_max:'60' })
  const [loading, setLoading] = useState(false)
  const [myProfile, setMyProfile] = useState<any>(null)

  useEffect(()=>{ loadProfiles(); loadMyProfile() },[])

  const loadMyProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    let q = supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(1)
    if(user) q = supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1)
    const { data } = await q
    if(data && data[0]) setMyProfile(data[0])
  }

  const loadProfiles = async () => {
    setLoading(true)
    let query = supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(50)
    
    if(filters.gender!=='any') query = query.eq('gender', filters.gender)
    if(filters.district_si!=='any'){
      const idx = DISTRICTS_SI.indexOf(filters.district_si)
      const en = DISTRICTS_EN[idx]
      if(en) query = query.eq('district_en', en)
    }
    if(filters.job!=='any') query = query.eq('job_main', filters.job)
    if(filters.caste!=='any') query = query.eq('caste_main', filters.caste)

    const { data, error } = await query
    if(error){ console.error(error); setLoading(false); return }
    
    let filtered = data || []
    // Age filter client side
    if(filters.age_min || filters.age_max){
      const min = parseInt(filters.age_min)||0
      const max = parseInt(filters.age_max)||100
      filtered = filtered.filter((p:any)=>{
        if(!p.dob) return true
        const age = new Date().getFullYear() - new Date(p.dob).getFullYear()
        return age>=min && age<=max
      })
    }

    setProfiles(filtered)

    // Load photos for these profiles
    if(filtered.length>0){
      const ids = filtered.map((p:any)=>p.id)
      const { data: photos } = await supabase.from('profile_photos').select('profile_id, url, is_primary').in('profile_id', ids)
      const map: Record<string,string> = {}
      if(photos){
        // Prefer primary, else first
        const grouped: Record<string, any[]> = {}
        photos.forEach((ph:any)=>{
          if(!grouped[ph.profile_id]) grouped[ph.profile_id]=[]
          grouped[ph.profile_id].push(ph)
        })
        Object.keys(grouped).forEach(pid=>{
          const arr = grouped[pid]
          const primary = arr.find((a:any)=>a.is_primary) || arr[0]
          map[pid]=primary.url
        })
      }
      setPhotosMap(map)
    }
    setLoading(false)
  }

  const sendInterest = async (toProfile:any) => {
    if(!myProfile){ alert('මුලින්ම ඔබේ profile එක හදන්න!'); return }
    if(myProfile.id===toProfile.id){ alert('ඔබේම profile එකට interest යවන්න බෑ'); return }
    const { error } = await supabase.from('interests').insert({
      from_profile: myProfile.id,
      to_profile: toProfile.id,
      status:'pending',
      compatibility_score: Math.floor(Math.random()*20)+70
    })
    if(error) alert('Error: '+error.message+' (maybe already sent)')
    else alert('✅ Interest යැව්වා '+toProfile.full_name+' ට!')
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[24px] p-6 shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#7B1F2A]">🔍 හොයන්න</h1>
            <Link href="/" className="text-sm border px-4 py-2 rounded-xl">Home</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
            <div>
              <label className="text-xs font-bold">ස්ත්‍රී/පුරුෂ</label>
              <select value={filters.gender} onChange={e=>setFilters({...filters, gender:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm">
                <option value="any">ඕනෑම</option><option value="male">පුරුෂ</option><option value="female">ස්ත්‍රී</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold">දිස්ත්‍රික්කය</label>
              <select value={filters.district_si} onChange={e=>setFilters({...filters, district_si:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm">
                <option value="any">ඕනෑම</option>{DISTRICTS_SI.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold">රැකියාව</label>
              <select value={filters.job} onChange={e=>setFilters({...filters, job:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm">
                <option value="any">ඕනෑම</option>{JOBS.map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold">කුලය</label>
              <select value={filters.caste} onChange={e=>setFilters({...filters, caste:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm">
                <option value="any">ඕනෑම</option>{CASTES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold">වයස අවම</label>
              <input type="number" value={filters.age_min} onChange={e=>setFilters({...filters, age_min:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold">වයස උපරිම</label>
              <input type="number" value={filters.age_max} onChange={e=>setFilters({...filters, age_max:e.target.value})} className="w-full mt-1 p-2 border rounded-xl text-sm" />
            </div>
          </div>

          <button onClick={loadProfiles} disabled={loading} className="mt-4 w-full md:w-auto bg-[#7B1F2A] text-white px-6 py-2 rounded-xl text-sm font-bold">
            {loading?'හොයනවා...':'🔍 Search කරන්න'}
          </button>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {profiles.map(p=>{
              const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '?'
              const photo = photosMap[p.id]
              return (
                <div key={p.id} className="bg-gray-50 rounded-[20px] overflow-hidden border hover:shadow-lg transition">
                  <div className="h-48 bg-gray-200 relative">
                    {photo ? <img src={photo} alt={p.full_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-bold">{p.gender==='male'?'👨':'👩'} {age}</div>
                    <div className="absolute top-2 right-2 bg-[#7B1F2A] text-white px-2 py-1 rounded-full text-[10px]">{p.district_en}</div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{p.full_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">💼 {p.job_main}</p>
                    <p className="text-xs text-gray-600">👪 {p.caste_main} | 📍 {p.pob_city_en}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.bio || 'Bio නෑ'}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Lagna: {p.lagna || '?'} | Rashi: {p.rashi || '?'}</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/profile/${p.id}`} className="flex-1 border text-center py-2 rounded-xl text-xs">View</Link>
                      <button onClick={()=>sendInterest(p)} className="flex-1 bg-[#2D8A4E] text-white py-2 rounded-xl text-xs font-bold">💌 Interest</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {profiles.length===0 && !loading && <p className="mt-8 text-center text-gray-500 text-sm">Profiles නෑ - Filter වෙනස් කරලා Search කරන්න, නැත්තම් අලුත් profiles හදන්න</p>}
        </div>
      </div>
    </main>
  )
}
