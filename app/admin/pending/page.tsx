'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

export default function AdminPendingPage(){
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filter, setFilter] = useState<'limited'|'blocked'|'all'>('limited');
  const [stats, setStats] = useState({limited:0, blocked:0, verified:0, total:0, free100:0, fee500:0, fee1500:0});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if(!user || !isAdminEmail(user.email)){
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      setEmail(user.email||'');
      await fetchData(user.email);
    })();
  },[]);

  const fetchData = async (adminEmail?:string) => {
    setLoading(true);
    try{
      // Fetch all with verification_status
      let query = supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(200);
      if(filter !== 'all'){
        query = query.eq('verification_status', filter);
      } else {
        query = query.in('verification_status', ['limited','blocked','pending','pending_guardian']);
      }
      const { data, error } = await query;
      if(error) throw error;
      setProfiles(data||[]);

      // Stats
      const { count: total } = await supabase.from('profiles').select('id',{count:'exact',head:true});
      const { count: limited } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_status','limited');
      const { count: blocked } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_status','blocked');
      const { count: verified } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_status','verified');
      const { count: free100 } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_fee_type','free_100');
      const { count: fee500 } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_fee_type','fee_500');
      const { count: fee1500 } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_fee_type','fee_1500');
      setStats({
        limited: limited||0,
        blocked: blocked||0,
        verified: verified||0,
        total: total||0,
        free100: free100||0,
        fee500: fee500||0,
        fee1500: fee1500||0
      });
    }catch(e:any){
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(()=>{ if(isAdmin) fetchData(); },[filter]);

  const handleVerify = async (p:any) => {
    if(!confirm(`Verify ${p.full_name}?\nGuardian: ${p.guardian_contact} (${p.guardian_relationship})\nCall guardian first then confirm.`)) return;
    setVerifyingId(p.id);
    try{
      const { error } = await supabase.from('profiles').update({
        verification_status: 'verified',
        guardian_verified: true,
        verified_badge: true,
        report_count: 0
      }).eq('id', p.id);
      if(error) throw error;
      setProfiles(profiles.map(pro => pro.id===p.id ? {...pro, verification_status:'verified', guardian_verified:true, verified_badge:true, report_count:0} : pro));
      // If filter is limited, remove from list after verify
      if(filter==='limited'){
        setProfiles(prev => prev.filter(pr => pr.id !== p.id));
      }
      alert(`✅ ${p.full_name} verified and released!`);
    }catch(e:any){ alert('Error: '+e.message); }
    setVerifyingId(null);
  };

  const handleBlock = async (p:any) => {
    if(!confirm(`Block ${p.full_name}? This will hide from search.`)) return;
    setVerifyingId(p.id);
    try{
      await supabase.from('profiles').update({ verification_status: 'blocked' }).eq('id', p.id);
      setProfiles(profiles.map(pro => pro.id===p.id ? {...pro, verification_status:'blocked'} : pro));
      alert('🚫 Blocked');
    }catch(e:any){ alert(e.message); }
    setVerifyingId(null);
  };

  const handleUnblock = async (p:any) => {
    if(!confirm(`Unblock ${p.full_name} and set back to limited?`)) return;
    setVerifyingId(p.id);
    try{
      await supabase.from('profiles').update({ verification_status: 'limited' }).eq('id', p.id);
      setProfiles(profiles.map(pro => pro.id===p.id ? {...pro, verification_status:'limited'} : pro));
    }catch(e:any){ alert(e.message); }
    setVerifyingId(null);
  };

  if(loading) return <div className='p-8 text-center'>Loading admin...</div>;
  if(!isAdmin) return <div className='max-w-3xl mx-auto p-8 text-center bg-red-50 border-2 border-red-300 rounded-2xl mt-10'><h1 className='text-2xl font-bold text-red-700'>Access Denied ❌</h1><p className='mt-2'>Only admin emails can access. Your email: {email || 'not logged in'}</p><Link href='/login' className='mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-full'>Login</Link></div>;

  return (
    <div className='max-w-7xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>👑 Admin — Pending Verification</h1>
        <div className='flex gap-2'>
          <Link href='/' className='border bg-white px-4 py-2 rounded-full text-sm'>Home</Link>
          <Link href='/account' className='border bg-white px-4 py-2 rounded-full text-sm'>Account</Link>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-7 gap-2 mb-4'>
        <div className='bg-yellow-50 border-2 border-yellow-300 p-3 rounded-xl text-center'><div className='text-2xl font-bold'>{stats.limited}</div><div className='text-xs'>Limited / Pending</div></div>
        <div className='bg-red-50 border-2 border-red-300 p-3 rounded-xl text-center'><div className='text-2xl font-bold'>{stats.blocked}</div><div className='text-xs'>Blocked</div></div>
        <div className='bg-green-50 border-2 border-green-300 p-3 rounded-xl text-center'><div className='text-2xl font-bold'>{stats.verified}</div><div className='text-xs'>Verified</div></div>
        <div className='bg-blue-50 border-2 border-blue-200 p-3 rounded-xl text-center'><div className='text-2xl font-bold'>{stats.total}</div><div className='text-xs'>Total</div></div>
        <div className='bg-green-50 border p-3 rounded-xl text-center'><div className='font-bold'>{stats.free100}</div><div className='text-[10px]'>Free 100</div></div>
        <div className='bg-orange-50 border p-3 rounded-xl text-center'><div className='font-bold'>{stats.fee500}</div><div className='text-[10px]'>Rs.500 (900)</div></div>
        <div className='bg-purple-50 border p-3 rounded-xl text-center'><div className='font-bold'>{stats.fee1500}</div><div className='text-[10px]'>Rs.1500+</div></div>
      </div>

      <div className='flex gap-2 mb-4'>
        <button onClick={()=>setFilter('limited')} className={`px-4 py-2 rounded-full text-sm font-bold border ${filter==='limited'?'bg-yellow-500 text-white':'bg-white'}`}>🟡 Limited ({stats.limited})</button>
        <button onClick={()=>setFilter('blocked')} className={`px-4 py-2 rounded-full text-sm font-bold border ${filter==='blocked'?'bg-red-600 text-white':'bg-white'}`}>🚫 Blocked ({stats.blocked})</button>
        <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold border ${filter==='all'?'bg-blue-600 text-white':'bg-white'}`}>All Pending</button>
        <button onClick={()=>fetchData()} className='ml-auto bg-gray-200 px-4 py-2 rounded-full text-sm'>🔄 Refresh</button>
      </div>

      <div className='bg-white border rounded-2xl shadow overflow-hidden'>
        <div className='p-3 bg-gray-50 border-b font-bold text-sm'>Showing {profiles.length} profiles — {filter}</div>
        {profiles.length===0 ? <div className='p-8 text-center text-gray-500'>No profiles in {filter}</div> : (
          <div className='divide-y'>
            {profiles.map((p:any)=>(
              <div key={p.id} className='p-4 flex flex-col md:flex-row gap-4 hover:bg-gray-50'>
                <img src={p.main_photo_url || p.photo_urls?.[0] || '/logo.png'} className='w-20 h-20 rounded-xl object-cover border flex-shrink-0' />
                <div className='flex-1'>
                  <div className='font-bold flex flex-wrap gap-2 items-center'>
                    {p.full_name} - {p.age}y {p.gender} 
                    <span className={`text-xs px-2 py-1 rounded-full ${p.verification_status==='limited'?'bg-yellow-100 text-yellow-800 border border-yellow-300':'bg-red-100 text-red-800'}`}>{p.verification_status}</span>
                    {p.verified_badge && <span className='text-xs bg-green-600 text-white px-2 py-1 rounded-full'>✓ Verified</span>}
                    {p.report_count>0 && <span className='text-xs bg-red-600 text-white px-2 py-1 rounded-full'>🚩 {p.report_count}/3 reports</span>}
                  </div>
                  <div className='text-xs mt-1 text-gray-700'>
                    Living: {p.living_city || p.current_city} - {p.living_district_si} | Birth: {p.birth_district_si} {p.birth_date} | Job: {p.job} | Religion: {p.religion} | Caste: {p.caste} | Height: {p.height_cm}cm | Edu: {p.education}
                  </div>
                  <div className='text-xs mt-1 bg-yellow-50 border border-yellow-200 p-2 rounded'>
                    <span className='font-bold'>Guardian:</span> <a href={`tel:${p.guardian_contact}`} className='text-blue-600 underline font-bold'>{p.guardian_contact || 'NULL - old profile'}</a> ({p.guardian_relationship || '-'}) | 
                    <span className='font-bold ml-2'>Fee:</span> {p.verification_fee_type} {p.verification_fee_paid? 'Paid' : 'Not Paid'} | 
                    <span className='font-bold ml-2'>DOB Orig:</span> {p.dob_original || p.dob} | 
                    <span className='font-bold ml-2'>Time edits:</span> {p.time_edit_count || 0} | 
                    <span className='font-bold ml-2'>Created:</span> {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <div className='text-[11px] text-gray-500 mt-1'>ID: {p.id} | User: {p.user_id} | Bio: {(p.bio||'').slice(0,80)}</div>
                </div>
                <div className='flex md:flex-col gap-2 flex-shrink-0'>
                  <Link href={`/profile/${p.id}`} className='bg-white border px-4 py-2 rounded-full text-xs text-center'>View Profile</Link>
                  {p.verification_status!=='verified' ? (
                    <button disabled={verifyingId===p.id} onClick={()=>handleVerify(p)} className='bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold disabled:bg-gray-300'>
                      {verifyingId===p.id? '...' : `✅ Verify ${p.guardian_contact ? p.guardian_contact.slice(-4) : ''} & Release`}
                    </button>
                  ) : (
                    <div className='bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded-full text-xs text-center'>Verified</div>
                  )}
                  {p.verification_status==='blocked' ? (
                    <button disabled={verifyingId===p.id} onClick={()=>handleUnblock(p)} className='bg-blue-600 text-white px-4 py-2 rounded-full text-xs'>Unblock → Limited</button>
                  ) : (
                    <button disabled={verifyingId===p.id} onClick={()=>handleBlock(p)} className='bg-red-600 text-white px-4 py-2 rounded-full text-xs'>🚫 Block</button>
                  )}
                  <a href={`tel:${p.guardian_contact}`} className='bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-full text-xs text-center font-bold'>📞 Call Guardian</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='mt-4 text-xs text-gray-500 bg-white border p-3 rounded-xl'>
        <b>How to use:</b> 1) Click Call Guardian to call {`07xxxxxxx`} and verify family. 2) Click Verify & Release → profile becomes verified, contacts visible. 3) If spam/fun, click Block. Reports 3/3 auto block. Admin only page — checks {ADMIN_EMAILS_RAW.join(', ')}.
      </div>
    </div>
  );
}
