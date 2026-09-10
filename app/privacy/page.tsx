export default function Privacy(){
 return (
 <main className="min-h-screen bg-[#FFF8E7] p-6" style={{fontFamily:"'Noto Sans Sinhala', sans-serif"}}>
  <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow border border-[#D4A017]/20">
   <h1 className="text-3xl font-bold text-[#7B1F2A]">Privacy Policy - heesara.lk</h1>
   <p className="text-sm text-gray-500 mt-1">Last updated: 10 Sep 2026 | PDPA Act No.9 of 2022 Compliant</p>
   
   <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-3 text-xs">
     <p className="font-bold text-green-800">✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි | 18+ Marriage Age Only</p>
     <p className="text-gray-700 mt-1">Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. No guarantee of marriage.</p>
   </div>

   <div className="mt-6 space-y-6 text-sm leading-6 text-gray-700">
    
    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">Who We Are - Data Controller</h2>
      <p className="mt-2">Heesara.lk, Galle, Sri Lanka. Community matrimony membership platform.<br/>
      Contact: <b>support@heesara.lk</b> | <b>contact@heesara.lk</b> | privacy@heesara.lk (forwards to same)<br/>
      Website: https://heesara.lk | OTP emails from noreply@heesara.lk via Resend</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">1. Data We Collect</h2>
      <p className="mt-2"><b>Basic:</b> Full name, gender, DOB (18+ validated, Minimum age check), age, district (birth & living), city, religion, caste, marital status, education, job, height, body type, skin color, bio, photos (max 3, WebP compressed), phone, email, expectations (age, height, district, job, caste, religion, horoscope preference), interests, consent flags.</p>
      <p className="mt-2"><b>Sensitive - Special Handling:</b> Birth Time (Hr/Min/AM-PM) - <span className="bg-amber-100 px-2 py-0.5 rounded font-bold">PRIVATE & NEVER SHOWN TO OTHERS</span>. Only profile owner can see own TOB in /account. We hide TOB from matches/search/profile view. Used internally only to calculate Porondam 20 matching score. Not displayed on public profile. If someone needs TOB to re-check outside, they must contact owner using contact details that appear only after mutual interest accepted.</p>
      <p className="mt-2"><b>We show:</b> Date of birth, birth district/city, living district/city - but NOT birth time to others.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">2. How We Use & Lawful Basis (PDPA Act No.9 of 2022)</h2>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li><b>Consent:</b> You check ✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) බව තහවුරු කරමි before creating profile</li>
        <li><b>Contract:</b> To show your profile only when your profile is in active state, to generate matches (score 100), Porondam 20 ✅❌ details, to allow contact only after mutual interest accept + both paid/active</li>
        <li><b>Legitimate Interest:</b> Prevent scam (1 account = 2 profiles max, anti-scrape, to stop visibility deactivation), WebP photo compression, security logs</li>
        <li>TOB is processed only for internal porondam calculation, never for public display - legitimate cultural matching purpose</li>
      </ul>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">3. Sharing - We Never Sell Data</h2>
      <p className="mt-2">We never sell data. Sharing only:</p>
      <ul className="list-disc ml-5 mt-1">
        <li>Contact details (phone/email) visible ONLY after accept interest and only for paid users, both accounts must in active state</li>
        <li>Supabase (database/storage), Resend (OTP email from noreply@heesara.lk) - data processors under contract</li>
        <li>Legal if required by Sri Lankan law / court order</li>
        <li>TOB never shared with other users, never in API response for other profiles</li>
      </ul>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">4. Security</h2>
      <p className="mt-2">HTTPS, Supabase Row Level Security, photo blur until accepted option, hide phone/hide email until match, private profile option, WebP compression, rate limiting. TOB encrypted in DB, access restricted to owner only. OTP via Resend with domain verification (SPF/DKIM for heesara.lk).</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">5. Retention</h2>
      <p className="mt-2">Profiles kept while account active + 6 months after free/paid expiry. Deleted profiles removed from storage (profile photo bucket) and contacts, interests. You can deactivate via button available or request deletion.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">6. Your Rights (PDPA)</h2>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        <li>Access: See your data in /account /my-profiles - including your own TOB</li>
        <li>Rectify: Edit via 'edit profile' button</li>
        <li>Deactivate: hidden from search</li>
        <li>Delete: Email support@heesara.lk with profile ID - we delete within 30 days</li>
        <li>Withdraw consent: Deactivate or delete; TOB can be deleted on request - porondam will then show N/A</li>
        <li>Complain: Data Protection Authority of Sri Lanka</li>
      </ul>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">7. Children's Privacy - 18+ Only</h2>
      <p className="mt-2"><b>⚠️ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි.</b> We block DOB less than 18, search age dropdown 18-70 only, input min=18, server validation Age less than 18 rejects. If you are under 18, do not use. If we find under-18 profile, we delete immediately. This is not adult content site - it's family matrimonial.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">8. Porondam & No Guarantee Disclaimer</h2>
      <p className="mt-2">🔮 <b>පොරොන්දම් 20 is cultural belief for information only, not astrological guarantee.</b> TOB is used only for internal cultural matching calculation. Heesara does NOT guarantee marriage. Profiles are posted by users, we only show matches. User must verify details before proceeding. Birth time is private, never shown to others to prevent misuse.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">9. Cookies & Logs</h2>
      <p className="mt-2">We use localStorage for heesara ids, heesara profile id, heesara interests (client only), Supabase auth session. No third-party tracking cookies. No ads.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">10. International Transfer</h2>
      <p className="mt-2">Data stored in Supabase (region) and Resend (US/EU for email delivery). By using heesara.lk you consent to this transfer for OTP delivery.</p>
    </div>

    <div>
      <h2 className="font-bold text-[#7B1F2A] text-base">11. Contact & Updates</h2>
      <p className="mt-2">For privacy questions, deletion, TOB privacy: <b>support@heesara.lk</b> / <b>contact@heesara.lk</b> - Galle, Sri Lanka. We will update this policy when law changes. Check last updated date. OTP from noreply@heesara.lk - reply goes to support@heesara.lk.</p>
      <p className="mt-3 text-[11px] text-gray-500 border-t pt-3">Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. Secure • Verified • විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) • No Guarantee of Marriage • PDPA Act No.9 of 2022 Compliant</p>
    </div>

   </div>
  </div>
 </main>
 )
}
