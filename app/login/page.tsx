"use client"
import { useState, useEffect } from 'react'
import { supabase, sendEmailOtp, verifyEmailOtp } from '@/lib/supabase-heesara'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email'|'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(()=>{
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session)=>{
      if(session?.user){
        setMsg('✅ Login success! Redirecting...')
        setTimeout(()=>router.push('/create-profile'), 1000)
      }
    })
    return ()=>subscription.unsubscribe()
  },[router])

  const handleSend = async () => {
    if(!email.includes('@')){ setMsg('වලංගු email එකක් දාන්න'); return }
    setLoading(true); setMsg('')
    const { error } = await sendEmailOtp(email)
    setLoading(false)
    if(error){ setMsg('Error: '+error.message) }
    else { 
      setMsg('📧 Email එක '+email+' ට යැව්වා! 2 options තියෙනවා: 1) Email එකේ තියෙන Confirm link එක click කරන්න, 2) එහෙම නැත්තම් OTP code එක පහළ දාන්න. Spam folder එකත් බලන්න!'); 
      setStep('otp') 
    }
  }

  const handleVerify = async () => {
    if(otp.length<6){ setMsg('OTP එක අංක 6ක් වෙන්න ඕන'); return }
    setLoading(true); setMsg('')
    const { error } = await verifyEmailOtp(email, otp)
    setLoading(false)
    if(error){ setMsg('OTP වැරදියි: '+error.message+' . ඒ වෙනුවට Email එකේ තියෙන Confirm link එක click කරලා බලන්න!') }
    else { setMsg('✅ හරි! Login වුණා!'); setTimeout(()=>router.push('/create-profile'), 1000) }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-xl border border-[#D4A017]/20">
        <h1 className="text-3xl font-bold text-[#7B1F2A] text-center">හීසර.lk</h1>
        <p className="text-center text-gray-600 mt-2 text-sm">Email එකෙන් Login - Free 1000</p>
        
        <div className="mt-8">
          {step==='email' ? (
            <>
              <label className="text-sm font-semibold">Email එක</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="oyage.email@gmail.com" className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200 focus:border-[#7B1F2A] outline-none" />
              <button onClick={handleSend} disabled={loading} className="w-full mt-4 bg-[#7B1F2A] text-white p-3 rounded-xl font-bold disabled:opacity-50">
                {loading ? 'යවනවා...' : 'OTP / Link යවන්න'}
              </button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mb-4">
                <p className="text-sm font-bold text-blue-800">📧 Email එක check කරන්න!</p>
                <p className="text-xs mt-1">ඔබට ලැබුණු email එකේ <b>Confirm email address</b> link එක click කරන්න - එතකොට auto login වෙනවා!</p>
                <p className="text-xs mt-1">හෝ OTP code එකක් තියෙනවා නම් පහළ දාන්න</p>
              </div>
              <label className="text-sm font-semibold">OTP කේතය (තියෙනවා නම්)</label>
              <p className="text-xs text-gray-500 mt-1">{email}</p>
              <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="123456" className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200 focus:border-[#7B1F2A] outline-none text-center text-xl tracking-widest" maxLength={6} />
              <button onClick={handleVerify} disabled={loading} className="w-full mt-4 bg-[#2D8A4E] text-white p-3 rounded-xl font-bold disabled:opacity-50">
                {loading ? 'check කරනවා...' : 'OTP Verify කරන්න'}
              </button>
              <button onClick={()=>setStep('email')} className="w-full mt-2 text-sm text-gray-500">Email එක වෙනස් කරන්න</button>
              <button onClick={handleSend} className="w-full mt-2 text-sm text-blue-600 underline">Email එක ආපහු යවන්න</button>
            </>
          )}
          {msg && <p className="mt-4 text-sm p-3 bg-yellow-50 rounded-xl border text-center">{msg}</p>}
        </div>
      </div>
    </main>
  )
}
