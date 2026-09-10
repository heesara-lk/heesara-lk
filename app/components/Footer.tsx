import Link from 'next/link'

export default function Footer(){
  return (
    <footer className="bg-[#5a1620] text-white mt-10">
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
           Professional    Secure    Verified
          </p>
          <div className="mt-4 flex gap-2">
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">✓ Verified</span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">✓ පොරොන්දම් 20</span>
            <span className="text-xs bg-[#D4A017] text-[#5a1620] px-3 py-1 rounded-full font-bold">මුල් 1000 Free</span>
          </div>
        </div>

        <div>
          <p className="font-bold text-white mb-3">Features</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Auto Top ගැලපීම් විස්තර සමගින්</li>
            <li>• පොරොන්දම් 20 ✅❌ details</li>
            <li>• Photo WebP compress</li>
            <li>• email 1 - profiles 2 / anti-scam</li>            
            <li>• ශරීර + වර්ණය + උස ගැලපීම්</li>
          </ul>
        </div>

        <div>          
          <p className="text-sm text-white/70 leading-relaxed mt-2">
            ආදරයේ මල් හීසර<br/>
            හදවතට වදින ආදරය - විශ්වාසයෙන් බැඳෙන තැන
          </p>
          <p className="text-xs text-white/40 mt-6">© 2026 Heesara.lk • Made in Sri Lanka LK</p>
          <div className="mt-3 flex gap-3 text-xs text-white/50">
            <Link href="/privacy" className="hover:text-white underline">Privacy</Link>
            <Link href="/terms" className="hover:text-white underline">Terms</Link>
            <Link href="/refund" className="hover:text-white underline">Refund</Link>
            <Link href="/contact" className="hover:text-white underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
