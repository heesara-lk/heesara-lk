"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import { getTopMatches, MatchScore } from '@/lib/matching'
import Link from 'next/link'

export default function MatchesPage(){
  const [myProfile, setMyProfile] = useState<any>(null)
  const [myExpectation, setMyExpectation] = useState<any>(null)
  const [matches, setMatches] = useState<MatchScore[]>([])
  const [allCount, setAllCount] = useState(0)
  const [limit, setLimit] = useState(10)
  const [photosMap, setPhotosMap] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(true)
  const [isFreeUser, setIsFreeUser] = useState(false)
  const [interestSent, setInterestSent] = useState<Record<string, boolean>>({})

  useEffect(()=>{ loadMatches() },[limit])

  const loadMatches = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    let q = supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(1)
    if(user) q = supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1)
    const { data: myProfs } = await q
    if(!myProfs || myProfs.length===0){ setLoading(false); return }
    const myP = myProfs[0]
    setMyProfile(myP)
    setIsFreeUser(!!myP.free_slot_number && myP.free_slot_number <= 1000)
    const { data: ex } = await supabase.from('expectations').select('*').eq('profile_id', myP.id).single()
    setMyExpectation(ex)
    const { data: allProfiles, count } = await supabase.from('profiles').select('*', {count:'exact'}).neq('id', myP.id)
    setAllCount(count||0)
    if(!allProfiles){ setLoading(false); return }
    const top = getTopMatches(myP, ex, allProfiles, limit)
    setMatches(top)
    const ids = top.map(m=>m.profile.id)
    if(ids.length>0){
      const { data: photos } = await supabase.from('profile_photos').select('profile_id, url, is_primary').in('profile_id', ids)
      const map: Record<string,string> = {}
      const grouped: Record<string, any[]> = {}
      photos?.forEach((ph:any)=>{ if(!grouped[ph.profile_id]) grouped[ph.profile_id]=[]; grouped[ph.profile_id].push(ph) })
      Object.keys(grouped).forEach(pid=>{ const arr = grouped[pid]; const primary = arr.find((a:any)=>a.is_primary) || arr[0]; map[pid]=primary.url })
      setPhotosMap(map)
    }
    // Load sent interests
    if(myP){
      const { data: sent } = await supabase.from('interests').select('to_profile').eq('from_profile', myP.id)
      const sentMap: Record<string, boolean> = {}
      sent?.forEach((s:any)=> sentMap[s.to_profile]=true)
      setInterestSent(sentMap)
    }
    setLoading(false)
  }

  const sendInterest = async (toProfile:any) => {
    if(!myProfile){ alert('Profile එකක් හදන්න'); return }
    if(myProfile.id===toProfile.id){ alert('ඔබේම profile එක'); return }
    if(interestSent[toProfile.id]){ alert('දැනටමත් interest යවලා තියෙනවා!'); return }
    try{
      const { error } = await supabase.from('interests').insert({
        from_profile: myProfile.id,
        to_profile: toProfile.id,
        status:'pending',
        compatibility_score: Math.floor(Math.random()*20)+70,
        porondam_score: matches.find(m=>m.profile.id===toProfile.id)?.breakdown.horoscope
      })
      if(error) throw error
      setInterestSent({...interestSent, [toProfile.id]: true})
      alert('✅ Interest යැව්වා '+toProfile.full_name+' ට! /interests page එකේ බලන්න')
    }catch(err:any){ alert('Error: '+err.message) }
  }

  if(loading) return <main className="min-h-screen bg-[#FFF8E7] p-8 text-center">ගැලපෙන අය හොයනවා... 🔍</main>
  if(!myProfile) return <main className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4"><div className="bg-white p-8 rounded-[24px] text-center"><p>Profile නෑ</p><Link href="/create-profile" className="mt-4 inline-block bg-[#7B1F2A] text-white px-6 py-2 rounded-xl">Create Profile</Link></div></main>

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[24px] p-6 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#7B1F2A]">💖 Top {matches.length} Matches - Score 100න්</h1>
              <p className="text-xs mt-1">Scoring: වයස 20 + රැකියාව 20 + කුලය 10 + කේන්දරය 30 + දිස්ත්‍රික්කය 10 + ශරීර 10 = 100</p>
              <p className="text-xs mt-1">{isFreeUser ? '🎉 Free user - Contact Free!' : '🔒 Paid needed for contact'} | මුළු {allCount}න් Top {limit}</p>
            </div>
            <Link href="/" className="text-sm border px-4 py-2 rounded-xl">Home</Link>
          </div>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m, idx)=>{
              const p = m.profile
              const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '?'
              const photo = photosMap[p.id]
              const isTop = idx<3
              const sent = interestSent[p.id]
              return (
                <div key={p.id} className={`bg-gray-50 rounded-[20px] overflow-hidden border-2 ${isTop ? 'border-[#D4A017] shadow-lg' : 'border-gray-100'}`}>
                  <div className="h-48 bg-gray-200 relative">
                    {photo ? <img src={photo} alt={p.full_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-bold">#{idx+1} | {m.score}%</div>
                    {isTop && <div className="absolute top-2 right-2 bg-[#D4A017] text-white px-2 py-1 rounded-full text-[10px] font-bold">⭐ TOP</div>}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"><p className="text-white font-bold text-sm">{p.full_name}, {age}</p><p className="text-white/80 text-[11px]">{p.job_main} | {p.district_en} | {p.body_type} {p.skin_color}</p></div>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] space-y-1">
                      <div className="flex justify-between"><span>වයස (20):</span><span className={m.breakdown.age>=15?'text-green-600 font-bold':''}>{m.breakdown.age}</span></div>
                      <div className="flex justify-between"><span>රැකියාව (20):</span><span className={m.breakdown.job>=15?'text-green-600 font-bold':''}>{m.breakdown.job}</span></div>
                      <div className="flex justify-between"><span>කුලය (10):</span><span className={m.breakdown.caste>=8?'text-green-600 font-bold':''}>{m.breakdown.caste} {p.caste_main==='අනවශ්‍යයි / නොදනී' ? '(අනවශ්‍යයි=Full)' : ''}</span></div>
                      <div className="flex justify-between"><span>කේන්දරය (30):</span><span className={m.breakdown.horoscope>=20?'text-green-600 font-bold':''}>{m.breakdown.horoscope} ({m.porondamDetails?.filter((d:any)=>d.matched).length||0}/20 පොරොන්දම්)</span></div>
                      <div className="flex justify-between"><span>දිස්ත්‍රික්කය (10):</span><span className={m.breakdown.district>=7?'text-green-600 font-bold':''}>{m.breakdown.district}</span></div>
                      <div className="flex justify-between"><span>ශරීර (10):</span><span className={m.breakdown.body>=7?'text-green-600 font-bold':''}>{m.breakdown.body}</span></div>
                      <div className="pt-1 border-t mt-1 flex justify-between font-bold"><span>Total:</span><span className="text-[#7B1F2A]">{m.score}/100</span></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/profile/${p.id}`} className="flex-1 border text-center py-2 rounded-xl text-xs">View + පොරොන්දම්</Link>
                      <button onClick={()=>sendInterest(p)} disabled={!!sent} className={`flex-1 py-2 rounded-xl text-xs font-bold ${sent ? 'bg-gray-300 text-gray-600' : 'bg-[#2D8A4E] text-white'}`}>{sent ? '✅ Sent' : '💌 Interest'}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-8 text-center"><button onClick={()=>setLimit(limit+10)} className="px-6 py-2 bg-[#7B1F2A] text-white rounded-xl text-sm">තවත් 10ක් ({limit+10})</button><Link href="/interests" className="ml-2 px-6 py-2 border rounded-xl text-sm">Interests බලන්න</Link></div>
        </div>
      </div>
    </main>
  )
}
