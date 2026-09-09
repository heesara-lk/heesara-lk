"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import Header from './components/Header'
import Footer from './components/Footer'

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

export default function Home(){
  const [count, setCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [myProfiles, setMyProfiles] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myEmail, setMyEmail] = useState('')
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(()=>{
    (async()=>{
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser||null)
      setLoadingUser(false)
      const admin = isAdminEmail(authUser?.email)
      setIsAdmin(!!admin)
      setMyEmail(authUser?.email||'')
      let q = supabase.from('profiles').select('id', {count:'exact', head:true})
      if(!admin) q = q.eq('is_private', false)
      const { count } = await q
      setCount(count||0)
      if(authUser){
        const { count: myC } = await supabase.from('profiles').select('id', {count:'exact', head:true}).eq('user_id', authUser.id)
        setMyProfiles(myC||0)
      }
    })()
  },[])

  return (
    <main className="min-h-screen bg-[#FFF8E7]">
      <Header />
      {!loadingUser &&!user && (
        <div className="bg-yellow-100 border-b border-yellow-300 text-center py-2 text-sm font-bold">
          🔐 Login වෙලා profile එක හදන්න → <Link href="/login" className="underline text-blue-700">Login / Signup</Link>
        </div>
      )}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7B1F2A] via-[#7B1F2A] to-[#2D2D2D]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,#D4A017_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#D4A017_0%,transparent_40%)]" />
        {/* Bottom align fix: items-stretch + h-full */}
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-stretch">
          {/* LEFT - flex column to push title to bottom */}
          <div className="flex flex-col h-full">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> {count}/1000 Free Joined • {isAdmin? `👑 Admin ${myEmail} sees all` : 'Public'} • Live
              </div>
              {/* SMALLER IMAGE - was 300px, now 200px to match right height */}
              <div className="mt-4 flex justify-center md:justify-start">
                <img src="/heesara_couple_line.png" alt="Heesara couple" className="w-[300px] md:w-[400px] h-auto opacity-80" />
              </div>
            </div>
            {/* TITLE pushed to bottom to align with right stats */}
            <div className="mt-auto pt-100">
               <h1 className="mt-1 text-4xl md:text-6xl font-bold text-white leading-[.85] tracking-tight">
              හීසරයෙන්<br/>
              <span className="text-[#D4A017] mt-6">හීසරයට</span><br/>
              <span className="text-2xl md:text-3xl font-normal text-white/80 px-1 py-3 block mt-2">හදවතින් හදවතට</span>
              <span className="text-2xl md:text-3xl font-normal text-[#D4A017] px-1 py-1 block">සිහින සැබෑ වෙන තැන</span>
            </h1>
            </div>
          </div>

          {/* RIGHT - flex column with space-between to align bottoms */}
          <div className="relative flex flex-col h-full justify-between gap-5">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#D4A017]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-2 shadow-2xl border border-white/20">
              <div className="bg-white rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-[#7B1F2A] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#FFF8E7] border flex items-center justify-center">🏹</span> Top Matches • Auto 100න්</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">● Live</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    {name:'නිමල්, 28', job:'IT', score:94, dist:'Colombo', body:'සාමාන්‍ය', por:'18/20'},
                    {name:'අමිලා, 26', job:'ගුරු', score:88, dist:'Gampaha', body:'කෙට්ටු', por:'16/20'},
                    {name:'චාමර, 30', job:'වෛද්‍ය', score:85, dist:'Kandy', body:'ක්‍රීඩා', por:'15/20'},
                  ].map((m,i)=>(
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border" style={{background: i===0? 'linear-gradient(135deg,#FFF8E7,#fff)' : '#f9f9f9'}}>
                      <div className="flex gap-2.5 items-center">
                        <div className="w-10 h-10 rounded-full bg-[#7B1F2A]/10 flex items-center justify-center text-[#7B1F2A] font-bold">{m.name[0]}</div>
                        <div><p className="font-bold text-sm">{m.name}</p><p className="text-xs text-gray-500">{m.job} • {m.dist} • {m.body} • {m.por} පොරොන්දම්</p></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-[#7B1F2A] text-sm">{m.score}%</p><p className="text-xs text-green-600 font-bold">Match</p></div>
                    </div>
                  ))}
                </div>
                <Link href={user? "/matches" : "/login"} className="mt-4 block text-center w-full bg-[#7B1F2A] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#5a1620]">🏹 Top 10 Matches බලන්න →</Link>
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-auto">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5">
                <span className="text-lg">🤍</span>
                <p className="text-xs text-white/70">Professional, Secure, Verified.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={user? "/create-profile" : "/login"} className="px-6 py-3 bg-[#D4A017] text-[#7B1F2A] rounded-full font-bold shadow-xl flex items-center gap-2 text-sm">
                  👤 {user? "Profile හදන්න" : "Sign Up වෙලා Profile හදන්න"} <span className="text- bg-[#7B1F2A] text-white px-2 py-0.5 rounded-full">FREE</span>
                </Link></div>
               <div className="flex flex-wrap gap-4">             
                <Link href={user? "/matches" : "/login"} className="px-7 py-3.5 bg-white text-[#7B1F2A] rounded-full font-bold shadow-xl flex items-center gap-2 text-sm">{user? "🏹 Matches බලන්න" : "🔐 Login"}</Link>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-2.5"><p className="text-white font-bold">{count}</p><p className="text- text-white/60">All Profiles</p></div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-2.5"><p className="text-white font-bold">{1000-count}</p><p className="text- text-white/60">Free Left</p></div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-2.5"><p className="text-[#D4A017] font-bold">20</p><p className="text- text-white/60">Porondam</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-4">
        {[
          {icon:'🏹', title:'අනංගයාගේ ආදර මල් හීසරය', desc:'හදවතට වදින ආදරය'},
          {icon:'🎯', title:'Auto Top 10', desc:'Score 100න්'},
          {icon:'🔮', title:'පොරොන්දම් 20', desc:'20 පොරොන්දම් ✅❌ එක්ක detail'},
          {icon:'🛡', title:'Professional & Secure', desc:'1 Account 2 Profiles, Privacy switches'},
        ].map((f,i)=>(
          <div key={i} className="bg-white rounded-2xl p-5 border shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-lg">{f.icon}</div>
            <p className="font-bold mt-3 text-[#7B1F2A] text-sm">{f.title}</p>
            <p className="text-xs mt-1.5 text-gray-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-2">
        <div className="bg-white rounded-2xl p-5 border shadow-sm grid md:grid-cols-4 gap-3">
          <Link href={user? "/create-profile" : "/login"} className="p-4 bg-[#FFF8E7] rounded-xl border text-center"><div className="text-xl">👤</div><p className="font-bold text-sm mt-1">{user? "Create Profile" : "Login to Create"}</p><p className="text-xs text-gray-500">{myProfiles}/2 limit {isAdmin?'👑':''}</p></Link>
          <Link href="/photos" className="p-4 bg-green-50 rounded-xl border text-center"><div className="text-xl">📸</div><p className="font-bold text-sm mt-1">Photos</p><p className="text-xs text-gray-500">3 WebP compress</p></Link>
          <Link href={user? "/matches" : "/login"} className="p-4 bg-gradient-to-br from-[#7B1F2A] to-[#5a1620] text-white rounded-xl text-center"><div className="text-xl">🏹</div><p className="font-bold text-sm mt-1">Top Matches</p><p className="text-xs text-white/70">Auto 100න් score</p></Link>
          <Link href={user? "/account" : "/login"} className="p-4 bg-blue-50 rounded-xl border text-center"><div className="text-xl">👤</div><p className="font-bold text-sm mt-1">{user? "My Account" : "Login"}</p><p className="text-xs text-gray-500">{user? user.email.split('@')[0] : 'Login / Signup'}</p></Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}