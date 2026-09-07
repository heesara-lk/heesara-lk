export default function Privacy(){
 return (
 <main className="min-h-screen bg-[#FFF8E7] p-6" style={{fontFamily:"'Noto Sans Sinhala', sans-serif"}}>
  <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow border border-[#D4A017]/20">
   <h1 className="text-3xl font-bold text-[#7B1F2A]">Privacy Policy - heesara.lk</h1>
   <p className="text-sm text-gray-500 mt-1">Last updated: 07 Sep 2026</p>
   <div className="mt-6 space-y-5 text-sm leading-6 text-gray-700">
    <p>heesara.lk respects your privacy under Sri Lanka Personal Data Protection Act No.9 of 2022.</p>
    <h2 className="font-bold text-[#7B1F2A]">1. Data We Collect</h2>
    <p>Name, DOB, district, religion, education, job, photos, contact (phone/email), interests and consents.</p>
    <h2 className="font-bold text-[#7B1F2A]">2. How We Use</h2>
    <p>To show your profile only when is_visible=true, to match, to allow contact only after mutual interest accept + both accounts active/paid, to prevent scraping.</p>
    <h2 className="font-bold text-[#7B1F2A]">3. Sharing</h2>
    <p>We never sell data. Contact details visible only after mutual consent and paid status check (has_accepted_interest + is_user_paid).</p>
    <h2 className="font-bold text-[#7B1F2A]">4. Your Rights</h2>
    <p>You can edit, deactivate (is_visible=false), delete your profile from /my-profiles. Email us to delete account.</p>
    <h2 className="font-bold text-[#7B1F2A]">5. Contact</h2>
    <p>privacy@heesara.lk</p>
   </div>
  </div>
 </main>
 )
}