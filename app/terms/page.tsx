export default function Terms(){
 return (
 <main className="min-h-screen bg-[#FFF8E7] p-6" style={{fontFamily:"'Noto Sans Sinhala', sans-serif"}}>
  <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow border border-[#D4A017]/20">
   <h1 className="text-3xl font-bold text-[#7B1F2A]">Terms & Conditions - heesara.lk</h1>
   <p className="text-sm text-gray-500 mt-1">Last updated: 10 Sep 2026 | PDPA Act No.9 of 2022 Compliant</p>

   <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-3 text-xs">
     <p className="font-bold text-green-800">✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි | 18+ Marriage Age Only</p>
     <p className="text-gray-700 mt-1">Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. No guarantee of marriage.</p>
   </div>

   <div className="mt-6 space-y-6 text-sm leading-6 text-gray-700">
    
    <div>
      <h2 className="font-bold text-[#7B1F2A]">1. Eligibility - විවාහ වයස</h2>
      <p className="mt-2"><b>✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි.</b> You must be 18+ years old. We enforce via automated checking system (DOB must be 18 years before today), Age checkers blocks less than 18 profiles create, search dropdown 18-70 only, minimum age checkers prevents typing less than 18. If under 18, do not use. If found, profile deleted immediately. This platform is for marriage proposals arranged by families, not dating or adult chat.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">2. Account & Profiles</h2>
      <p className="mt-2"><b>One email = 1 account, max 2 profiles</b> (yourself + child/sibling). Verified via supabase autherised User id number and server count check (count exact). Admin emails have unlimited for support. Local profile id numbers filtered against data base ids to prevent ghost ids. You are responsible for password/OTP (via noreply@heesara.lk). 1 account = 2 profiles to prevent scam.</p>      
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">3. Free 1000 & Pricing</h2>
      <p className="mt-2"><b>මුල් 1000 Free:</b> First 1000 profiles get free 6 months. After free limit over or 6 months expiry, Rs.1500 / 6 months. Free profiles renew at Rs.750 (50% off). Payment order created with status pending, profile data contains full name. Go to /pay/:id to pay. No extra charges. Prices in LKR.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">4. Visibility & Privacy - Birth Time Hidden</h2>
      <p className="mt-2"><b>Profile shows in matches and search only when profile status is paid and active.</b> Deactivated profiles hidden. Private profile option, hide phone, hide email until match, photo blur until accepted.</p>
      <p className="mt-2"><b>🔒 Birth Time (TOB) Privacy:</b> We hide birth time (Hr/Min/AM-PM) from matches page - viewer cannot see birth time of candidate. Only profile owner can see own TOB in /account. We show date and place (birth_district, living district) but NOT time. If viewer needs TOB to re-check from outside astrologer, they must contact owner using contact details that appear only after interest accepted + both paid/active. TOB is stored encrypted, never in public API for other profiles, used internally only for Porondam 20 calculation.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">5. Interest & Contact</h2>
      <p className="mt-2">Contact (phone/email) visible only after both parties Accept interest and both accounts Active (not expired, must be passed paid check, has accepted interest). Before that, contact hidden as per hide phone/hide email settings. Interest sends from compatibility score page or Top auto matching page. You cannot send interest to own profile.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">6. Porondam & No Guarantee Disclaimer</h2>
      <p className="mt-2">🔮 <b>පොරොන්දම් 20 is cultural belief for information only, not astrological guarantee.</b> TOB is used only for internal porondam matching. <b>Heesara does NOT guarantee marriage.</b> Profiles are posted by users, we only show matches. User must verify details (job, education, religion, caste, photos) before proceeding. We are not responsible for false info. Birth time privacy is to prevent misuse.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">7. Conduct</h2>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li>No fake photos, no celebrity photos, no abuse, no adult chat, no harassment</li>
        <li>Photos max 3, 5MB each, WebP compress, stored in profile-photos bucket</li>
        <li>We can block profiles violating, set to non visible or delete</li>
        <li>Search age locked 18+ only - cannot search under 18</li>        
      </ul>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">8. Refund</h2>
      <p className="mt-2">No refund after contact viewed (after interest accepted and phone/email shown). If no match found, you can deactivate anytime and your data kept 6 months then deleted per privacy policy. For refund disputes, email support@heesara.lk with payment ID. See /refund page for full policy. Free 1000 profiles get free 6 months, no payment needed.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">9. Data & PDPA</h2>
      <p className="mt-2">Under Sri Lanka PDPA Act No.9 of 2022, you consent to data processing for matching. TOB is sensitive personal data - processed only for porondam, never shown to others. You can edit, deactivate, delete via /my-profiles or email support@heesara.lk. Data stored in Supabase, OTP via Resend (noreply@heesara.lk). We never sell data. See /privacy for full policy.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A]">10. Law & Contact</h2>
      <p className="mt-2">Governed by Sri Lanka law. Contact: support@heesara.lk | contact@heesara.lk | Galle, Sri Lanka. OTP from noreply@heesara.lk, reply goes to support. By creating profile you confirm ✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) බව තහවුරු කරමි and accept these terms.</p>
      <p className="mt-3 text-[11px] text-gray-500 border-t pt-3">Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. Secure • Verified • විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) • No Guarantee of Marriage • PDPA Act No.9 of 2022 Compliant • TOB Private</p>
    </div>

   </div>
  </div>
 </main>
 )
}
