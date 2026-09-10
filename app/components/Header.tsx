"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'

export default function Header(){
  const [user, setUser] = useState<any>(null)
  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e,s)=>{ setUser(s?.user||null) })
    return ()=>subscription.unsubscribe()
  },[])
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-[#D4A017]/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Heesara.lk" className="h-9 w-auto" />
          <div className="leading-none">
            <h1 className="font-bold text-[#7B1F2A] text-[22px] tracking-tight" style={{fontFamily:'Noto Serif Sinhala, serif'}}>හීසර.lk</h1>
            <p className="text-[9px] text-[#D4A017] tracking-[0.2em] font-bold -mt-0.5">HEESARA</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/matches" className="text-xs md:text-sm px-4 py-2 rounded-full bg-[#7B1F2A] text-white font-bold hover:bg-[#5a1620] shadow">💖 Matches</Link>
          <Link href="/search" className="text-xs md:text-sm px-3 py-2 rounded-full border bg-white font-bold hover:bg-gray-50">🔍 Search</Link>
          <Link href="/account" className="w-8 h-8 rounded-full bg-[#FFF8E7] border-2 border-[#D4A017]/30 flex items-center justify-center hover:border-[#7B1F2A]">👤</Link>
        </nav>
      </div>
    </header>
  )
}
