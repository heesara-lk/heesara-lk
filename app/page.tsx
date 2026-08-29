"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home(){
  const [count, setCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [myProfiles, setMyProfiles] = useState(0)
  useEffect(()=>{
    supabase.from('profiles').select('id', {count:'exact'}).then(({count})=>setCount(count||0))
    supabase.auth.getUser().then(async ({data})=>{
      if(data.user){
        setUser(data.user)
        const { count } = await supabase.from('profiles').select('id', {count:'exact', head:true}).eq('user_id', data.user.id)
        setMyProfiles(count||0)
      }
    })
  },[])
  return (
    <main className="min-h-screen bg-[#FFF8E7]">
      <Header />
      {/* Hero - Professional */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7B1F2A] via-[#7B1F2A] to-[#2D2D2D]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,#D4A017_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#D4A017_0%,transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> {count}/1000 Free Joined • Live
            </div>
            <h1 className="mt-6 text-[36px] md:text-[56px] font-bold text-white leading-[0.9] tracking-tight">
              හීසරෙන්<br/>
              <span className="text-[#D4A017]">හීසරයට</span><br/>
              <span className="text-[20px] md:text-[24px] font-normal text-white/80">හරි කෙනා හමුවන තැන</span>
            </h1>
            <div className="mt-4 flex items-start gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
              <img src="/logo.png" alt="arrow" className="h-8 w-auto brightness-0 invert opacity-80 mt-0.5" />
              <p className="text-xs text-white/70 leading-relaxed">අනංගයාගේ ආදර මල් ඊතලය. හදවතට වදින ආදරය, හරි කෙනා හමුවන තැන. Professional, Secure, Verified.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create-profile" className="px-7 py-3.5 bg-[#D4A017] text-[#7B1F2A] rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition flex items-center gap-2">👤 Profile හදන්න <span className="text-[10px] bg-[#7B1F2A] text-white px-2 py-0.5 rounded-full">FREE</span></Link>
              <Link href="/matches" className="px-7 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full font-bold hover:bg-white/20 flex items-center gap-2">🏹 Matches බලන්න</Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-2"><p className="text-white font-bold">{count}</p><p className="text-[10px] text-white/60">Profiles</p></div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-2"><p className="text-white font-bold">{1000-count}</p><p className="text-[10px] text-white/60">Free Left</p></div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-2"><p className="text-[#D4A017] font-bold">20</p><p className="text-[10px] text-white/60">Porondam</p></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#D4A017]/20 rounded-full blur-3xl" />
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-[32px] p-2 shadow-2xl border border-white/20">
              <div className="bg-white rounded-[24px] p-5 shadow-xl">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-[#7B1F2A] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#FFF8E7] border flex items-center justify-center">🏹</span> Top Matches • Auto 100න්</p>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">● Live</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    {name:'නිමල්, 28', job:'IT', score:94, dist:'Colombo', body:'සාමාන්‍ය', por:'18/20'},
                    {name:'අමිලා, 26', job:'ගුරු', score:88, dist:'Gampaha', body:'කෙට්ටු', por:'16/20'},
                    {name:'චාමර, 30', job:'වෛද්‍ය', score:85, dist:'Kandy', body:'ක්‍රීඩා', por:'15/20'},
                  ].map((m,i)=>(
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border hover:shadow-sm transition" style={{background: i===0 ? 'linear-gradient(135deg,#FFF8E7,#fff)' : '#f9f9f9'}}>
                      <div className="flex gap-2.5 items-center">
                        <div className="w-10 h-10 rounded-full bg-[#7B1F2A]/10 flex items-center justify-center text-[#7B1F2A] font-bold">{m.name[0]}</div>
                        <div><p className="font-bold text-sm">{m.name}</p><p className="text-[11px] text-gray-500">{m.job} • {m.dist} • {m.body} • {m.por} පොරොන්දම්</p></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-[#7B1F2A] text-sm">{m.score}%</p><p className="text-[10px] text-green-600 font-bold">Match</p></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-6 gap-1 text-[9px]">
                  <span className="bg-[#FFF8E7] px-1.5 py-1 rounded text-center">වයස 20</span>
                  <span className="bg-[#FFF8E7] px-1.5 py-1 rounded text-center">රැකියා 20</span>
                  <span className="bg-[#FFF8E7] px-1.5 py-1 rounded text-center">කුලය 10</span>
                  <span className="bg-[#7B1F2A] text-white px-1.5 py-1 rounded text-center">කේන්දර 30</span>
                  <span className="bg-[#FFF8E7] px-1.5 py-1 rounded text-center">දිස්ත්‍රික් 10</span>
                  <span className="bg-[#FFF8E7] px-1.5 py-1 rounded text-center">ශරීර 10</span>
                </div>
                <Link href="/matches" className="mt-4 block text-center w-full bg-[#7B1F2A] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#5a1620]">🏹 Top 10 Matches බලන්න →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-4">
        {[
          {icon:'🏹', title:'අනංගයාගේ ආදර ඊතලය සංකල්පය', desc:'හදවතට වදින ආදරය'},
          {icon:'🎯', title:'Auto Top 10', desc:'Score 100න් - වයස 20+රැකියා 20+කුලය 10+කේන්දර 30+දිස්ත්‍රික් 10+ශරීර 10'},
          {icon:'🔮', title:'පොරොන්දම් 20', desc:'20 පොරොන්දම් ✅❌ එක්ක detail - ගැලපුණු අයුරු පේනවා'},
          {icon:'🛡️', title:'Professional & Secure', desc:'2/email limit, WebP photos, Hr/Min/AM-PM, body type/skin color'},
        ].map((f,i)=>(
          <div key={i} className="bg-white rounded-[20px] p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition">
            <div className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-lg">{f.icon}</div>
            <p className="font-bold mt-3 text-[#7B1F2A] text-sm">{f.title}</p>
            <p className="text-xs mt-1.5 text-gray-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Quick actions */}
      <section className="max-w-7xl mx-auto px-4 pb-2">
        <div className="bg-white rounded-[24px] p-5 border shadow-sm grid md:grid-cols-4 gap-3">
          <Link href="/create-profile" className="p-4 bg-[#FFF8E7] rounded-xl border hover:shadow text-center"><div className="text-xl">👤</div><p className="font-bold text-sm mt-1">Create Profile</p><p className="text-[11px] text-gray-500">{myProfiles}/2 limit</p></Link>
          <Link href="/photos" className="p-4 bg-green-50 rounded-xl border hover:shadow text-center"><div className="text-xl">📸</div><p className="font-bold text-sm mt-1">Photos</p><p className="text-[11px] text-gray-500">3 WebP compress</p></Link>
          <Link href="/matches" className="p-4 bg-gradient-to-br from-[#7B1F2A] to-[#5a1620] text-white rounded-xl shadow hover:shadow-lg text-center"><div className="text-xl">🏹</div><p className="font-bold text-sm mt-1">Top Matches</p><p className="text-[11px] text-white/70">Auto 100න් score</p></Link>
          <Link href="/account" className="p-4 bg-blue-50 rounded-xl border hover:shadow text-center"><div className="text-xl">👤</div><p className="font-bold text-sm mt-1">My Account</p><p className="text-[11px] text-gray-500">{user ? user.email.split('@')[0] : 'Login/Switch'}</p></Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
