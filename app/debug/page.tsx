"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'

export default function DebugPage(){
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [testResult, setTestResult] = useState('')

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>setUser(data.user))
    supabase.auth.getSession().then(({data})=>setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, s)=>{
      setSession(s); setUser(s?.user || null)
    })
    return ()=>subscription.unsubscribe()
  },[])

  const testSave = async () => {
    setTestResult('Trying...')
    try{
      const { data, error } = await supabase.from('profiles').insert({
        account_type:'self', full_name:'Debug Test '+Date.now(), gender:'male',
        dob:'1995-01-01', tob:'10:00', pob_district_en:'Colombo', pob_city_en:'Colombo',
        district_en:'Colombo', job_main:'IT', caste_main:'Govi', bio:'debug', free_slot_number:1
      }).select().single()
      if(error) setTestResult('❌ FAILED: '+error.message+'\\nCode: '+error.code+'\\nDetails: '+error.details)
      else setTestResult('✅ SUCCESS! Saved with ID: '+data.id+'\\nNow create-profile will work!')
    }catch(e:any){ setTestResult('❌ Exception: '+e.message) }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[24px] p-6">
        <h1 className="text-xl font-bold">Debug - Auth & Save Test</h1>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="font-bold">Auth Status:</p>
          <p className="text-sm mt-2">User: {user ? `✅ Logged in as ${user.email} (${user.id.slice(0,8)}...)` : '❌ NOT logged in (anonymous)'}</p>
          <p className="text-sm">Session: {session ? '✅ Exists' : '❌ No session'}</p>
          {!user && <p className="text-xs mt-2 text-red-600">You must login first, or run Nuclear Fix to allow anonymous save</p>}
        </div>

        <button onClick={testSave} className="mt-4 w-full bg-[#7B1F2A] text-white p-3 rounded-xl">Test Save to profiles table</button>
        
        {testResult && <pre className="mt-4 p-3 bg-yellow-50 rounded-xl text-xs whitespace-pre-wrap border">{testResult}</pre>}

        <div className="mt-6 text-xs text-gray-600">
          <p>Steps:</p>
          <p>1. Run supabase-nuclear-fix.sql in Supabase</p>
          <p>2. Come here /debug and click Test Save</p>
          <p>3. If ✅, then go to /create-profile - it will work</p>
          <p>4. If ❌, copy the error and send me</p>
        </div>

        <div className="mt-4 flex gap-2">
          <a href="/login" className="px-4 py-2 border rounded-xl text-sm">Go to Login</a>
          <a href="/create-profile" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm">Go to Create Profile</a>
        </div>
      </div>
    </main>
  )
}
