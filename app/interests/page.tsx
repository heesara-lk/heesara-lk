"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import Link from 'next/link'

export default function InterestsPage(){
  const [sent, setSent] = useState<any[]>([])
  const [received, setReceived] = useState<any[]>([])
  const [myProfileId, setMyProfileId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ load() },[])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    let myId = ''
    if(user){
      const { data: p } = await supabase.from('profiles').select('id').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1).single()
      if(p) myId = p.id
    } else {
      const { data: p } = await supabase.from('profiles').select('id').order('created_at',{ascending:false}).limit(1).single()
      if(p) myId = p.id
    }
    setMyProfileId(myId)
    if(!myId){ setLoading(false); return }

    const { data: sentData } = await supabase.from('interests').select('*, to_profile_data:to_profile(*)').eq('from_profile', myId).order('created_at',{ascending:false})
    const { data: recData } = await supabase.from('interests').select('*, from_profile_data:from_profile(*)').eq('to_profile', myId).order('created_at',{ascending:false})
    
    // Fetch profiles manually if join fails
    const fetchProfiles = async (interests:any[], field:string) => {
      const enriched = []
      for(let interest of interests||[]){
        const pid = interest[field]
        const { data: prof } = await supabase.from('profiles').select('id, full_name, job_main, district_en, dob').eq('id', pid).single()
        enriched.push({...interest, profile: prof})
      }
      return enriched
    }

    if(sentData){
      const enriched = await fetchProfiles(sentData, 'to_profile')
      setSent(enriched)
    }
    if(recData){
      const enriched = await fetchProfiles(recData, 'from_profile')
      setReceived(enriched)
    }
    setLoading(false)
  }

  if(loading) return <main className="p-8 text-center">Loading interests...</main>

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[24px] p-6 shadow">
        <div className="flex justify-between"><h1 className="text-2xl font-bold text-[#7B1F2A]">💌 Interests</h1><Link href="/matches" className="border px-4 py-2 rounded-xl text-sm">Matches</Link></div>
        
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold">📤 ඔබ යැවූ (Sent) - {sent.length}</h2>
            <div className="mt-2 space-y-2">
              {sent.map((s:any)=>(
                <div key={s.id} className="p-3 bg-gray-50 rounded-xl text-sm flex justify-between">
                  <div><p className="font-bold">{s.profile?.full_name || s.to_profile}</p><p className="text-xs">{s.profile?.job_main} | {s.status} | Score {s.compatibility_score}</p></div>
                  <Link href={`/profile/${s.to_profile}`} className="text-xs border px-2 py-1 rounded h-fit">View</Link>
                </div>
              ))}
              {sent.length===0 && <p className="text-xs text-gray-500">තවම නෑ</p>}
            </div>
          </div>
          <div>
            <h2 className="font-bold">📥 ඔබට ආව (Received) - {received.length}</h2>
            <div className="mt-2 space-y-2">
              {received.map((r:any)=>(
                <div key={r.id} className="p-3 bg-green-50 rounded-xl text-sm flex justify-between border border-green-200">
                  <div><p className="font-bold">{r.profile?.full_name || r.from_profile}</p><p className="text-xs">{r.profile?.job_main} | {r.status}</p></div>
                  <Link href={`/profile/${r.from_profile}`} className="text-xs bg-[#2D8A4E] text-white px-2 py-1 rounded h-fit">View</Link>
                </div>
              ))}
              {received.length===0 && <p className="text-xs text-gray-500">තවම නෑ</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
