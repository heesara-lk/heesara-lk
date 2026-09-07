export default function Contact(){
 return (
 <main className="min-h-screen bg-[#FFF8E7] p-6" style={{fontFamily:"'Noto Sans Sinhala', sans-serif"}}>
  <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow border border-[#D4A017]/20">
   <h1 className="text-3xl font-bold text-[#7B1F2A]">Contact Us</h1>
   <p className="mt-4 text-sm">Need help with heesara.lk?</p>
   <div className="mt-6 space-y-3 text-sm">
    <p><b>Email:</b> support@heesara.lk / privacy@heesara.lk</p>
    <p><b>WhatsApp:</b> +94 91 427 0377 </p>
    <p><b>Address:</b> Galle, Sri Lanka</p>
    <p><b>Hours:</b> 9am - 6pm</p>
   </div>
   <p className="mt-6 text-xs text-gray-500">We reply within 24h. For profile delete request, email from same email.</p>
  </div>
 </main>
 )
}