"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import Link from 'next/link'

const MAX_PROFILES_PER_USER = 2 // 2 profiles per email to avoid scam

export default function AccountPage(){
  const [user, setUser] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [allProfilesCount, setAllProfilesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ load() },[])

  const load = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()
    setUser(u || session?.user || null)

    if(u || session?.user){
      const uid = (u || session?.user)?.id
      const { data: myProfs } = await supabase.from('profiles').select('*').eq('user_id', uid).order('created_at',{ascending:false})
      setProfiles(myProfs||[])
    } else {
      // Test mode - show latest profiles as if they are yours
      const { data: myProfs } = await supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(5)
      setProfiles(myProfs||[])
    }

    const { count } = await supabase.from('profiles').select('id', {count:'exact', head:true})
    setAllProfilesCount(count||0)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    alert('Logout වුණා! දැන් වෙන email එකකින් login වෙන්න පුළුවන්')
    window.location.href='/login'
  }

  const handleDeleteProfile = async (id:string) => {
    if(!confirm('Profile එක delete කරන්නද? Photos + interests ඔක්කොම delete වෙනවා!')) return
    await supabase.from('profile_photos').delete().eq('profile_id', id)
    await supabase.from('interests').delete().or(`from_profile.eq.${id},to_profile.eq.${id}`)
    await supabase.from('expectations').delete().eq('profile_id', id)
    await supabase.from('profiles').delete().eq('id', id)
    alert('Deleted')
    load()
  }

  if(loading) return <main className="p-8 text-center">Loading...</main>

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[24px] p-6 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#7B1F2A]">👤 My Account</h1>
          <Link href="/" className="border px-4 py-2 rounded-xl text-sm">Home</Link>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="font-bold text-sm">Login Status:</p>
          {user ? (
            <>
              <p className="text-sm mt-1">✅ Logged in as: <b>{user.email}</b></p>
              <p className="text-xs text-gray-500">User ID: {user.id.slice(0,8)}... | Created: {new Date(user.created_at).toLocaleDateString()}</p>
              <p className="text-xs mt-2">මේ email එකෙන් profiles {profiles.length}/{MAX_PROFILES_PER_USER} හදලා තියෙනවා (Limit to avoid scam)</p>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600">❌ Not logged in (Test Mode - Anonymous)</p>
              <p className="text-xs text-gray-500 mt-1">Test mode නිසා ඕනෑම කෙනෙක්ට profiles හදන්න පුළුවන්. Production එකේදී login අනිවාර්යයි!</p>
            </>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {user ? (
            <button onClick={handleLogout} className="bg-red-500 text-white p-3 rounded-xl text-sm font-bold">🚪 Logout (වෙන user කෙනෙක්ට මාරු වෙන්න)</button>
          ) : (
            <Link href="/login" className="bg-[#7B1F2A] text-white p-3 rounded-xl text-sm font-bold text-center">🔑 Login වෙන්න</Link>
          )}
          <Link href="/create-profile" className="border p-3 rounded-xl text-sm font-bold text-center">➕ New Profile {profiles.length>=MAX_PROFILES_PER_USER ? '(Limit!)' : ''}</Link>
        </div>

        <div className="mt-6">
          <h2 className="font-bold">📊 Stats</h2>
          <p className="text-sm mt-1">මුළු profiles: {allProfilesCount} / 1000 Free | ඔබේ profiles: {profiles.length}</p>
          <p className="text-xs text-gray-500">මුල් 1000ට Free | ඊට පස්සේ Paid. එක email එකකට profiles {MAX_PROFILES_PER_USER}යි (scam වලක්වන්න)</p>
        </div>

        <div className="mt-6">
          <h2 className="font-bold">👤 ඔබේ Profiles ({profiles.length})</h2>
          <div className="mt-2 space-y-2">
            {profiles.map((p:any)=>(
              <div key={p.id} className="p-3 bg-[#FFF8E7] rounded-xl border flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{p.full_name} ({p.gender==='male'?'පුරුෂ':'ස්ත්‍රී'}) - {p.district_en}</p>
                  <p className="text-xs text-gray-600">{p.job_main} | {p.dob} | Free #{p.free_slot_number || '?'}</p>
                  <p className="text-[10px] text-gray-400">ID: {p.id.slice(0,8)}...</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/profile/${p.id}`} className="text-xs border px-2 py-1 rounded bg-white text-center">View</Link>
                  <Link href="/photos" className="text-xs border px-2 py-1 rounded bg-white text-center">Photos</Link>
                  <button onClick={()=>handleDeleteProfile(p.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
            {profiles.length===0 && <p className="text-xs text-gray-500">Profiles නෑ - Create Profile කරන්න</p>}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs">
          <p className="font-bold">💡 User මාරු වෙන්නේ කොහොමද?</p>
          <p className="mt-1">1. Interest එකක් යැව්වා -> අනිත් userට පේනවද බලන්න ඕන නම්:</p>
          <p>2. My Account -> Logout click කරන්න</p>
          <p>3. Login page එකේ අනිත් email එක දාන්න (උදා: test2@gmail.com)</p>
          <p>4. Magic link click කරලා login වෙන්න</p>
          <p>5. Interests page එකේ Received වල පේනවා!</p>
          <p className="mt-2 font-bold">🔒 Scam වලක්වන්නේ කොහොමද?</p>
          <p>• එක email එකකට profiles {MAX_PROFILES_PER_USER}යි max</p>
          <p>• මුල් 1000ට Free - ඊට පස්සේ Payment එකක් දාන්න ඕන</p>
          <p>• OTP එකෙන් verify කරලා තියෙන email විතරයි</p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link href="/matches" className="flex-1 bg-[#7B1F2A] text-white p-3 rounded-xl text-center text-sm font-bold">💖 Matches</Link>
          <Link href="/interests" className="flex-1 border p-3 rounded-xl text-center text-sm">💌 Interests</Link>
        </div>
      </div>
    </main>
  )
}
