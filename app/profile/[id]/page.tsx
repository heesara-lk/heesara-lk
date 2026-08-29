"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { calculateMatchScore } from '@/lib/matching'

export default function ProfileDetail(){
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [expectation, setExpectation] = useState<any>(null)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [myExpectation, setMyExpectation] = useState<any>(null)
  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ if(id) load() },[id])

  const load = async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile(p)
    if(p){
      const { data: ph } = await supabase.from('profile_photos').select('*').eq('profile_id', p.id).order('created_at')
      setPhotos(ph||[])
      const { data: ex } = await supabase.from('expectations').select('*').eq('profile_id', p.id).single()
      setExpectation(ex)

      // Load my profile for porondam compare
      const { data: { user } } = await supabase.auth.getUser()
      let q = supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(1)
      if(user) q = supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1)
      const { data: myP } = await q
      if(myP && myP[0]){
        setMyProfile(myP[0])
        const { data: myEx } = await supabase.from('expectations').select('*').eq('profile_id', myP[0].id).single()
        setMyExpectation(myEx)
        const m = calculateMatchScore(myP[0], myEx, p)
        setMatch(m)
      }
    }
    setLoading(false)
  }

  if(loading) return <main className="p-8 text-center">Loading...</main>
  if(!profile) return <main className="p-8 text-center">Profile not found</main>
  const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '?'

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[24px] p-6 shadow">
        <Link href="/matches" className="text-sm border px-3 py-1 rounded-xl">⬅️ Matches</Link>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <div>
            {photos.length>0 ? (
              <div className="space-y-2">
                <img src={photos.find((p:any)=>p.is_primary)?.url || photos[0].url} alt="main" className="w-full h-80 object-cover rounded-[20px]" />
                <div className="grid grid-cols-3 gap-2">{photos.map((ph:any)=><img key={ph.id} src={ph.url} alt="thumb" className="h-20 object-cover rounded-xl" />)}</div>
              </div>
            ) : <div className="h-80 bg-gray-100 rounded-[20px] flex items-center justify-center text-gray-400">No photos</div>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#7B1F2A]">{profile.full_name} ({age})</h1>
            <p className="text-sm text-gray-600 mt-1">{profile.gender==='male'?'පුරුෂ':'ස්ත්‍රී'} | {profile.district_en} | {profile.height_cm}cm | {profile.body_type} | {profile.skin_color}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p><b>📅 උපන්:</b> {profile.dob} {profile.tob}</p>
              <p><b>📍 උපන් තැන:</b> {profile.pob_city_en}, {profile.pob_district_en}</p>
              <p><b>💼 රැකියාව:</b> {profile.job_main}</p>
              <p><b>👪 කුලය:</b> {profile.caste_main}</p>
              <p><b>🔮 ලග්නය:</b> {profile.lagna} | රාශිය: {profile.rashi}</p>
              <p><b>📝 Bio:</b> {profile.bio}</p>
            </div>
            {expectation && <div className="mt-4 p-3 bg-[#FFF8E7] rounded-xl border text-xs"><p className="font-bold">බලාපොරොත්තු:</p><p>වයස {expectation.age_min}-{expectation.age_max} | රැකියාව {expectation.job_pref_main} | කුලය {expectation.caste_pref_main} | පොරොන්දම් {expectation.min_porondam}+</p></div>}

            {match && (
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="font-bold text-[#7B1F2A]">💖 ඔබත් {profile.full_name} අතර ගැලපීම: {match.score}/100</p>
                <div className="mt-2 text-xs space-y-1">
                  <p>වයස 20න්: {match.breakdown.age} | රැකියාව 20න්: {match.breakdown.job} | කුලය 10න්: {match.breakdown.caste} {profile.caste_main==='අනවශ්‍යයි / නොදනී' ? '(අනවශ්‍යයි = Full)' : ''}</p>
                  <p>දිස්ත්‍රික්කය 10න්: {match.breakdown.district} | ශරීර 10න්: {match.breakdown.body} | කේන්දරය 30න්: {match.breakdown.horoscope}</p>
                </div>
                <div className="mt-3">
                  <p className="font-bold text-xs">🔮 පොරොන්දම් 20 ගැලපීම ({match.porondamDetails?.filter((d:any)=>d.matched).length}/20):</p>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                    {match.porondamDetails?.map((por:any, i:number)=>(
                      <div key={i} className={`p-1 rounded flex justify-between ${por.matched ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span>{por.si}</span><span>{por.matched ? '✅' : '❌'}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] mt-2 text-gray-500">* මේක mock calculation එකක් - සැබෑ කේන්දර ගණනය පසුව API එකකින්</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
