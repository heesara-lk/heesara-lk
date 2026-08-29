
export default function Footer(){
  return (
    <footer className="mt-16 bg-[#7B1F2A] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 relative">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-10 w-auto brightness-0 invert" />
            <div><p className="font-bold text-lg" style={{fontFamily:'Noto Serif Sinhala, serif'}}>හීසර.lk</p><p className="text-[10px] text-[#D4A017] tracking-widest">HEESARA • ඊ තලය • අනංගයාගේ ආදර ඊතලය</p></div>
          </div>
          <p className="text-sm mt-4 text-white/80 max-w-md">හීසරෙන් හීසරයට — අනංගයාගේ ඊතලයෙන් හරි කෙනා හමුවන තැන. ලංකාවේ විශ්වාසනීයම, Professional, Secure මංගල යෝජනා.</p>
          <div className="mt-4 inline-flex gap-2 text-[11px]">
            <span className="bg-white/10 px-2 py-1 rounded-full">✓ Verified</span>
            <span className="bg-white/10 px-2 py-1 rounded-full">✓ පොරොන්දම් 20</span>
            <span className="bg-[#D4A017] text-[#7B1F2A] px-2 py-1 rounded-full font-bold">මුල් 1000 Free</span>
          </div>
        </div>
        <div><p className="font-bold text-sm">Features</p><ul className="text-xs mt-3 space-y-1.5 text-white/70"><li>• Auto Top 10 Matching 100න්</li><li>• පොරොන්දම් 20 ✅❌ details</li><li>• Photo WebP compress</li><li>• 2 profiles/email anti-scam</li><li>• Hr/Min/AM-PM TOB</li><li>• Body type + Skin color</li></ul></div>
        <div><p className="font-bold text-sm">අර්ථය</p><p className="text-xs mt-3 text-white/70 leading-relaxed">ආදරයේ මල් ඊතලය. හදවතට වදින ආදරය. හරි කෙනා හමුවන තැන.</p><p className="text-[10px] mt-4 text-white/40">© 2026 Heesara.lk • Made in Sri Lanka 🇱🇰</p></div>
      </div>
    </footer>
  )
}
