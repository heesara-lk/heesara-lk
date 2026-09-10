export default function Refund() {
  return (
    <main className="min-h-screen bg-[#FFF8E7] p-6" style={{fontFamily:"'Noto Sans Sinhala', sans-serif"}}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow border border-[#D4A017]/20">
        <h1 className="text-3xl font-bold text-[#7B1F2A]">Return & Refund Policy - Heesara.lk</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: 10 Sep 2026 | PDPA Act No.9 of 2022 Compliant</p>

        <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-3 text-xs">
          <p className="font-bold text-green-800">✓ විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) පමණයි | 18+ Marriage Age Only</p>
          <p className="text-gray-700 mt-1">Digital membership service for family-arranged marriage proposals. No physical product. No guarantee of marriage. Porondam 20 is cultural belief only.</p>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-6 text-gray-700">
          
          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">1. Nature of Service - Digital</h2>
            <p className="mt-2">Since Heesara.lk provides digital service (profile access, Top 10 matching, Porondam 20 calculation, interest system, contact unlock after mutual accept), there is no physical product return. You buy 6 months membership access to search and contact features.</p>
            <p className="mt-1"><b>Pricing:</b> First 1000 profiles = Free 6 months. After free limit for new profiles Rs.1500 / 6 months. Renewal for free users = Rs.750 (50% off). Prices in LKR. Payment via bank / card / wallet through payment gateway. Order stored in database.</p>
          </div>

          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">2. Refund Policy - Non-Refundable After Activation</h2>
            <p className="mt-2"><b>Subscription fee Rs.1500 is non-refundable after profile is activated and contacts unlocked.</b> Contacts (phone/email) become visible only after both parties Accept interest and both accounts Active. Once you have viewed contact details, service is considered delivered.</p>
            <p className="mt-2"><b>No refund in these cases:</b></p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>After you viewed contact details</li>
              <li>If you found no match - you can deactivate anytime, but fee not refundable because platform access was provided</li>
              <li>any expectation not met - we only show matches, not guarantee marriage</li>
              <li>Porondam mismatch - porondam is cultural belief for information only, not guarantee</li>
              <li>Profile created with wrong DOB/TOB - TOB is private, you can edit any time before interest</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">3. Refund Allowed - Technical Errors Only</h2>
            <p className="mt-2">Refund within 7 days after verification ONLY for:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><b>Double payment:</b> Payment charged twice for same profile id - we refund one after checking payments table</li>
              <li><b>Technical error:</b> Payment deducted but profile not activated - we fix or refund</li>              
              <li><b>Duplicate account:</b> Max 2 profiles reached but charged for 3rd - refund after serverCount check</li>
            </ul>
            <p className="mt-2">To request refund for technical error, email <b>support@heesara.lk</b> with payment ID (/pay/id), email, and screenshot within 7 days. We verify in database and refund to original payment method within 7 working days.</p>
          </div>

          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">4. Cancellation</h2>
            <p className="mt-2">You can delete profile anytime from /my-profiles or email support@heesara.lk. Deactivation sets hidden from search and matching. Deletion removes photos from profile-photos bucket, contacts, expectations, interests. But subscription amount is not refundable after activation as service was delivered. Free profiles expire after 6 months from creation, paid after plan expires. You will be notified before expiry.</p>
          </div>

          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">5. Birth Time Privacy - No Refund for TOB</h2>
            <p className="mt-2">🔒 We hide birth time (Hr/Min/AM-PM) from matches page - viewer cannot see TOB of candidate, only owner can see own. We show date and place only. If you need TOB to re-check from outside astrologer, contact owner using contact details that appear after interest accepted + paid status. TOB privacy is for security, not a defect - no refund for not showing TOB to others.</p>
          </div>

          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">6. No Guarantee</h2>
            <p className="mt-2">⚠️ <b>Heesara does NOT guarantee marriage.</b> Profiles are posted by users, we only show matches based on district, job, religion, caste, age (18+ only), height, body, skin, porondam. User must verify before proceeding. Porondam 20 is cultural belief for information only, not astrological guarantee. No refund if marriage does not happen.</p>
          </div>

          <div>
            <h2 className="font-bold text-[#7B1F2A] text-base">7. Contact & Law</h2>
            <p className="mt-2">For refund issues: <b>support@heesara.lk</b> | <b>contact@heesara.lk</b> | +94 91 427 0377 | Galle, Sri Lanka. OTP from noreply@heesara.lk via Resend. Governed by Sri Lanka law. PDPA Act No.9 of 2022 compliant.</p>
            <p className="mt-3 text-[11px] text-gray-500 border-t pt-3">Heesara.lk is a community membership platform for family-arranged marriage proposals. Not a dating site. No adult chat. Secure • Verified • විවාහ අපේක්ෂිතයන් සඳහා (18+ වයස) • No Guarantee of Marriage • Digital Service - No Physical Return • PDPA Compliant</p>
          </div>

        </div>
      </div>
    </main>
  )
}
