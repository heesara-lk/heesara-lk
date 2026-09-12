'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-heesara'

const ADMIN_EMAILS_RAW = [
  'manjula.upashantha@gmail.com',
  'akm.upashantha@gmail.com',
  'akmupashantha@gmail.com',
  'heesara@gmail.com',
  'manjulaupashantha@gmail.com',
  'heesara.support@gmail.com'
]
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase())
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e))
function isAdminEmail(email?:string|null){
  if(!email) return false
  const low=email.toLowerCase()
  const norm=normalizeEmail(email)
  return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm)
}

export default function Footer(){
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if(user?.email && isAdminEmail(user.email)){
        setIsAdmin(true)
        setAdminEmail(user.email)
      }
    })()
  },[])

  return (
    <footer className="bg-[#5a1620] text-white mt-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="heesara" className="h-8 w-auto brightness-0 invert" />
            <div>
              <p className="font-bold text-xl">හීසර.lk</p>
              <p className="text-xs text-[#D4A017]">HEESARA</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            ලංකාවේ විශ්වාසනීයම මංගල යෝජනා web පිටුව.<br/>
            Professional • Secure • Verified • PDPA Compliant
          </p>
          <div className="mt-3 text-[11px] leading-relaxed text-white/50 bg-white/5 border border-white/10 rounded-lg p-2.5">
            <p>⚠️ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි. Heesara does NOT guarantee marriage. Profiles are posted by users, we only show matches. Please verify before proceeding.</p>
            <p className="mt-1">🔮 පොරොන්දම් 20 is cultural belief for information only, not astrological guarantee.</p>
            <p className="mt-1">🛡️ Guardian verification required — contacts hidden until admin verifies guardian contact to prevent spam/fun profiles.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">✓ Verified</span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">✓ පොරොන්දම් 20</span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස)</span>
            <span className="text-xs bg-[#D4A017] text-[#5a1620] px-3 py-1 rounded-full font-bold">මුල් 100 Free</span>
            <span className="text-xs bg-orange-400 text-[#5a1620] px-3 py-1 rounded-full font-bold">ඊළඟ 900 @ Rs.500 Verified</span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Profiles 1000 ට පසු Rs.1500</span>
          </div>
        </div>

        <div>
          <p className="font-bold text-white mb-3">Features</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Auto Top 10 ගැලපීම් 100න් score</li>
            <li>• පොරොන්දම් 20 ✅❌ details</li>
            <li>• Photo WebP compress</li>
            <li>• 1 Account = 2 Profiles, anti-scam</li>            
            <li>• Hr/Min/AM-PM උපන් වේලාව</li>
            <li>• ශරීර + වර්ණය + උස ගැලපීම්</li>
            <li>• 🛡️ Guardian Verified + 3 Report = Block</li>            
          </ul>
        </div>

        <div>          
          <p className="text-sm text-white/70 leading-relaxed">
            <span className="text-white font-bold">ආදරයේ මල් හීසර</span><br/>
            හදවතට වදින ආදරය - විශ්වාසයෙන් බැඳෙන තැන
          </p>
          <div className="mt-4 text-xs text-white/60 space-y-1">
            <p>📧 support@heesara.lk</p>
            <p>📧 contact@heesara.lk</p>
            <p>📞 +94 91 427 0377</p>
            <p>📍 Galle, Sri Lanka</p>
          </div>
          <p className="text-xs text-white/40 mt-5">© 2026 Heesara.lk • Made in Sri Lanka LK<br/>PDPA Act No.9 of 2022 Compliant</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
            <Link href="/privacy" className="hover:text-white underline">Privacy</Link>
            <Link href="/terms" className="hover:text-white underline">Terms</Link>
            <Link href="/refund" className="hover:text-white underline">Refund</Link>
            <Link href="/contact" className="hover:text-white underline">Contact</Link>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-white/40">
          <p>Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat.</p>
          <p>🔐 Secure • Verified • විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) • Guardian Verified • No Guarantee</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-yellow-400 text-black border-t-2 border-yellow-500">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span>👑 Admin: {adminEmail}</span>
              <span className="bg-black text-yellow-400 px-2 py-0.5 rounded text-[10px]">ONLY YOU SEE THIS</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/pending" className="bg-[#5a1620] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-black transition">🛡️ Pending (Guardian Verify)</Link>
              <Link href="/admin/reports" className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-700 transition">🚩 Reports (3=Block)</Link>
              <Link href="/account" className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition">👤 My Account</Link>
              <a href="https://heesara.lk/sitemap.xml" target="_blank" className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-700 transition">🗺️ Sitemap</a>
              <a href="https://search.google.com/search-console" target="_blank" className="bg-green-700 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-800 transition">🔍 Search Console</a>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
