"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email'|'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if(data.session?.user){
        setMsg('✅ Already logged in! Redirecting...')
        setTimeout(()=>router.push('/account'), 800)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session)=>{
      if(event==='SIGNED_IN' && session?.user){
        setMsg('✅ Login success! Redirecting to account...')
        setTimeout(()=>router.push('/account'), 1000)
      }
    })
    const hash = window.location.hash
    if(hash.includes('error')){
      const params = new URLSearchParams(hash.replace('#','?'))
      const err = params.get('error_description') || params.get('error')
      if(err) setMsg('❌ Link error: '+ decodeURIComponent(err))
    }
    return ()=>subscription.unsubscribe()
  },[router])

  const handleSend = async () => {
    if(!email.includes('@')){ setMsg('❌ වලංගු email එකක් දාන්න'); return }
    setLoading(true); setMsg('')
    try{
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          shouldCreateUser: true,
        }
      })
      if(error) throw error
      setMsg(`📧 Email එක ${email} ට යැව්වා! Code එක check කරන්න`);
      setStep('otp')
    } catch(e:any){
      setMsg('❌ Error: '+e.message)
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    if(otp.length<6){ setMsg('❌ OTP එක අංක 6ක් වෙන්න ඕන'); return }
    setLoading(true); setMsg('')
    try{
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })
      if(error) throw error
      if(data.session){
        setMsg('✅ හරි! Login වුණා! Account එකට යනවා...')
        setTimeout(()=>router.push('/account'), 1000)
      }
    } catch(e:any){
      setMsg('❌ OTP වැරදියි: '+e.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true); setMsg('Google වෙත යනවා...')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` }
    })
    if(error){ setMsg('❌ Google error: '+error.message); setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4" style={{fontFamily: "'Noto Sans Sinhala', sans-serif"}}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border border-[#D4A017]/20">
        <h1 className="text-3xl font-bold text-[#7B1F2A] text-center" style={{fontFamily: "'Noto Sans Sinhala', sans-serif"}}>හීසර.lk</h1>
        <p className="text-center text-gray-600 mt-2 text-sm">Email එකෙන් Login - Free 1000</p>

        <button onClick={handleGoogle} disabled={loading} className="w-full mt-6 bg-white border-2 border-gray-200 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50">
          <span>🔍</span> Continue with Google
        </button>
        <div className="flex items-center gap-2 my-4"><div className="flex-1 h-px bg-gray-200"></div><span className="text-xs text-gray-400">OR</span><div className="flex-1 h-px bg-gray-200"></div></div>

        <div className="mt-2">
          {step==='email'? (
            <>
              <label className="text-sm font-semibold">Email එක ඇතුළු කරන්න</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="oyage.email@gmail.com" className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200 focus:border-[#7B1F2A] outline-none" />
              <button onClick={handleSend} disabled={loading} className="w-full mt-4 bg-[#7B1F2A] text-white p-3 rounded-xl font-bold disabled:opacity-50">
                {loading? 'යවනවා...' : 'OTP යවන්න'}
              </button>
              <p className="text-[11px] text-gray-500 mt-2 text-center">එක email එකෙන් account 1යි, profile 2යි හදන්න පුළුවන්</p>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mb-4">
                <p className="text-sm font-bold text-blue-800">📧 Email එක check කරන්න!</p>
                <p className="text-xs mt-1">ඔබට ලැබුණු අංක 6 code එක පහළ දාන්න</p>
                <p className="text-xs mt-1 text-gray-600">To: {email}</p>
              </div>
              <label className="text-sm font-semibold">OTP කේතය</label>
              <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="123456" className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200 focus:border-[#7B1F2A] outline-none text-center text-xl tracking-widest" maxLength={6} />
              <button onClick={handleVerify} disabled={loading} className="w-full mt-4 bg-[#2D8A4E] text-white p-3 rounded-xl font-bold disabled:opacity-50">
                {loading? 'check කරනවා...' : 'OTP Verify කරන්න'}
              </button>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={()=>setStep('email')} className="text-sm text-gray-500 border p-2 rounded-xl">Email වෙනස්</button>
                <button onClick={handleSend} disabled={loading} className="text-sm text-blue-600 border border-blue-200 p-2 rounded-xl">Resend</button>
              </div>
            </>
          )}
          {msg && <p className="mt-4 text-sm p-3 bg-yellow-50 rounded-xl border text-center whitespace-pre-line">{msg}</p>}
        </div>
      </div>
    </main>
  )
}
