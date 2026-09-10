export default function Contact(){
 return (
 <main className="min-h-screen bg-[#FFF8E7] p-6" style={{fontFamily:"'Noto Sans Sinhala', sans-serif"}}>
  <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow border border-[#D4A017]/20">
   <h1 className="text-3xl font-bold text-[#7B1F2A]">Contact Us - heesara.lk</h1>
   <p className="text-sm text-gray-500 mt-1">Last updated: 10 Sep 2026 | Reply within 24h</p>

   <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-3 text-xs">
     <p className="font-bold text-green-800">✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි | 18+ Marriage Age Only</p>
     <p className="text-gray-700 mt-1">Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. No guarantee of marriage. Porondam 20 is cultural belief only.</p>
   </div>

   <p className="mt-4 text-sm">Need help with heesara.lk? We are here to help with profile creation, OTP, search (18+ only), TOB privacy, payments.</p>
   
   <div className="mt-6 grid md:grid-cols-2 gap-4">
    <div className="space-y-3 text-sm bg-[#FFF8E7] border rounded-xl p-4">
      <h3 className="font-bold text-[#7B1F2A]">📧 Email (Best way)</h3>
      <p><b>Support:</b> support@heesara.lk</p>
      <p><b>Contact:</b> contact@heesara.lk</p>
      <p><b>Privacy / Delete:</b> privacy@heesara.lk / support@heesara.lk</p>      
      <p className="text-[11px] text-gray-500 mt-2">All emails forward to us reply within 24h. For profile delete request, email from same email used for account + include profile ID from /my-profiles.</p>
    </div>
    <div className="space-y-3 text-sm bg-[#FFF8E7] border rounded-xl p-4">
      <h3 className="font-bold text-[#7B1F2A]">📞 Phone & Address</h3>
      <p><b>WhatsApp / Phone:</b> +94 91 427 0377</p>
      <p><b>Address:</b> Galle, Sri Lanka</p>
      <p><b>Hours:</b> 9am - 6pm (Mon-Sat) SL Time</p>
      <p><b>Website:</b> https://heesara.lk</p>
      <p className="text-[11px] text-gray-500 mt-2">No physical office visit needed - fully online matrimony membership platform.</p>
    </div>
   </div>

   <div className="mt-6 space-y-4 text-sm leading-6 text-gray-700">
    <div>
      <h3 className="font-bold text-[#7B1F2A]">🔒 Birth Time Privacy - How TOB Works</h3>
      <p className="mt-1">We hide birth time (Hr/Min/AM-PM) from matches page. Viewer cannot see TOB of candidate, only owner can see own TOB in /account. We show date and place only. If you need TOB to re-check from outside astrologer, you must contact owner using contact details that appear after interest accepted. This is for security and PDPA compliance.</p>
    </div>

    <div>
    
    </div>

    <div>
      <h3 className="font-bold text-[#7B1F2A]">🔍 Search Age - 18+ Only</h3>
      <p className="mt-1">Search dropdown shows 18-70 only, cannot show ages less than 18, typing less than 18 auto-corrects to 18 in both age min and max sections. This enforces විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි.</p>
    </div>

    <div>
      <h3 className="font-bold text-[#7B1F2A]">💳 Payments & Refund</h3>
      <p className="mt-1">First 1000 profiles = Free 6 months. After: Rs.1500 / 6 months, renewal Rs.750. Digital service - no physical product. Non-refundable after contact viewed. Refund only for double payment / technical error within 7 days. Email support@heesara.lk with payment ID from /pay/:id. See /refund for full policy.</p>
    </div>

    <div className="bg-[#5a1620]/5 border border-[#5a1620]/20 rounded-xl p-4">
      <h3 className="font-bold text-[#5a1620] text-sm">Quick Contact Form (sends to support@heesara.lk)</h3>
      <p className="text-[11px] text-gray-600 mt-1">For fastest reply, email directly to support@heesara.lk. This form is informational - actual sending via your email client.</p>
      <div className="mt-3 space-y-2">
        <input placeholder="Your email (must be account email for delete)" className="w-full border p-2 rounded text-sm" />
        <input placeholder="Profile ID (from /my-profiles, for delete requests)" className="w-full border p-2 rounded text-sm" />
        <textarea placeholder="Your message - e.g., Need TOB of profile X after interest, or delete my profile, or payment double charged" className="w-full border p-2 rounded text-sm h-24"></textarea>
        <p className="text-[11px] text-gray-500">⚠️ Heesara does NOT guarantee marriage. Profiles posted by users, we only show matches. Please verify before proceeding. Porondam 20 is cultural belief for information only, not astrological guarantee. PDPA Act No.9 of 2022 Compliant.</p>
      </div>
    </div>

    <p className="text-xs text-gray-500 border-t pt-3">We reply within 24h. For profile delete request, email from same email. Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. Secure • Verified • විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) • No Guarantee • TOB Private • support@heesara.lk | contact@heesara.lk | Avissawella, Sri Lanka</p>
   </div>
  </div>
 </main>
 )
}
