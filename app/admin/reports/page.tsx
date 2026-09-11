'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import Link from 'next/link';

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

export default function AdminReportsPage(){
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all'|'blocked'|'1'|'2'|'3'>('all');
  const [stats, setStats] = useState({r1:0,r2:0,r3:0,total:0, blocked:0});
  const [actingId, setActingId] = useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if(!user || !isAdminEmail(user.email)){ setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      await fetchData();
    })();
  },[]);

  const fetchData = async () => {
    setLoading(true);
    try{
      let q = supabase.from('profiles').select('*').gte('report_count',1).order('report_count',{ascending:false}).order('created_at',{ascending:false}).limit(200);
      if(filter==='blocked') q = q.eq('verification_status','blocked');
      else if(filter==='1') q = q.eq('report_count',1);
      else if(filter==='2') q = q.eq('report_count',2);
      else if(filter==='3') q = q.gte('report_count',3);
      const { data } = await q;
      setProfiles(data||[]);

      const { data: repData } = await supabase.from('reports').select('*, reporter:reporter_profile_id(full_name), reported:reported_profile_id(full_name)').order('created_at',{ascending:false}).limit(100);
      setReports(repData||[]);

      const { count: c1 } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('report_count',1);
      const { count: c2 } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('report_count',2);
      const { count: c3 } = await supabase.from('profiles').select('id',{count:'exact',head:true}).gte('report_count',3);
      const { count: blocked } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('verification_status','blocked');
      setStats({r1:c1||0, r2:c2||0, r3:c3||0, total:(c1||0)+(c2||0)+(c3||0), blocked: blocked||0});
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ if(isAdmin) fetchData(); },[filter]);

  const handleClearReports = async (p:any) => {
    if(!confirm(`Clear all reports for ${p.full_name} and set to verified?`)) return;
    setActingId(p.id);
    try{
      await supabase.from('reports').delete().eq('reported_profile_id', p.id);
      await supabase.from('profiles').update({ report_count:0, verification_status:'verified', guardian_verified:true, verified_badge:true }).eq('id', p.id);
      setProfiles(profiles.map(pr=> pr.id===p.id ? {...pr, report_count:0, verification_status:'verified'} : pr).filter(pr=> filter==='all' ? pr.report_count>0 : true));
      alert('✅ Reports cleared and verified');
      fetchData();
    }catch(e:any){ alert(e.message); }
    setActingId(null);
  };

  const handleBlock = async (p:any) => {
    if(!confirm(`Block ${p.full_name}?`)) return;
    setActingId(p.id);
    await supabase.from('profiles').update({ verification_status:'blocked' }).eq('id', p.id);
    setProfiles(profiles.map(pr=> pr.id===p.id ? {...pr, verification_status:'blocked'} : pr));
    setActingId(null);
  };

  const handleUnblock = async (p:any) => {
    setActingId(p.id);
    await supabase.from('profiles').update({ verification_status:'limited', report_count:0 }).eq('id', p.id);
    await supabase.from('reports').delete().eq('reported_profile_id', p.id);
    setProfiles(profiles.filter(pr=> pr.id!==p.id));
    setActingId(null);
  };

  if(loading) return <div className='p-8 text-center'>Loading reports...</div>;
  if(!isAdmin) return <div className='max-w-3xl mx-auto p-8 text-center bg-red-50 border-2 border-red-300 rounded-2xl mt-10'><h1 className='text-2xl font-bold text-red-700'>Access Denied ❌</h1><p>Admin only</p></div>;

  return (
    <div className='max-w-7xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>🚩 Admin — Reports (Spam / Fun)</h1>
        <div className='flex gap-2'>
          <Link href='/admin/pending' className='border bg-yellow-50 px-4 py-2 rounded-full text-sm font-bold'>🟡 Pending Verification</Link>
          <Link href='/' className='border bg-white px-4 py-2 rounded-full text-sm'>Home</Link>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-5 gap-2 mb-4'>
        <div className='bg-red-50 border-2 border-red-300 p-3 rounded-xl text-center'><div className='text-2xl font-bold'>{stats.total}</div><div className='text-xs'>Total Reported</div></div>
        <div className='bg-yellow-50 border p-3 rounded-xl text-center'><div className='font-bold text-lg'>{stats.r1}</div><div className='text-[11px]'>1 Report</div></div>
        <div className='bg-orange-50 border p-3 rounded-xl text-center'><div className='font-bold text-lg'>{stats.r2}</div><div className='text-[11px]'>2 Reports</div></div>
        <div className='bg-red-100 border-2 border-red-400 p-3 rounded-xl text-center'><div className='font-bold text-lg'>{stats.r3}</div><div className='text-[11px]'>3+ Auto Blocked</div></div>
        <div className='bg-gray-100 border p-3 rounded-xl text-center'><div className='font-bold'>{stats.blocked}</div><div className='text-[11px]'>Blocked</div></div>
      </div>

      <div className='flex gap-2 mb-4 flex-wrap'>
        <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-full text-sm border font-bold ${filter==='all'?'bg-blue-600 text-white':'bg-white'}`}>All Reported</button>
        <button onClick={()=>setFilter('1')} className={`px-4 py-2 rounded-full text-sm border ${filter==='1'?'bg-yellow-500 text-white':'bg-white'}`}>1 Report</button>
        <button onClick={()=>setFilter('2')} className={`px-4 py-2 rounded-full text-sm border ${filter==='2'?'bg-orange-500 text-white':'bg-white'}`}>2 Reports</button>
        <button onClick={()=>setFilter('3')} className={`px-4 py-2 rounded-full text-sm border font-bold ${filter==='3'?'bg-red-600 text-white':'bg-white'}`}>🚫 3+ Blocked</button>
        <button onClick={()=>setFilter('blocked')} className={`px-4 py-2 rounded-full text-sm border ${filter==='blocked'?'bg-gray-800 text-white':'bg-white'}`}>Blocked Only</button>
        <button onClick={()=>fetchData()} className='ml-auto bg-gray-200 px-4 py-2 rounded-full text-sm'>🔄 Refresh</button>
      </div>

      <div className='bg-white border rounded-2xl shadow overflow-hidden mb-6'>
        <div className='p-3 bg-red-50 border-b font-bold text-sm'>Reported Profiles — {profiles.length} (auto block at 3 reports)</div>
        {profiles.length===0 ? <div className='p-8 text-center text-green-700'>✅ No reported profiles — all clean!</div> : (
          <div className='divide-y'>
            {profiles.map((p:any)=>(
              <div key={p.id} className='p-4 flex flex-col md:flex-row gap-4'>
                <img src={p.main_photo_url || p.photo_urls?.[0] || '/logo.png'} className='w-16 h-16 rounded-xl object-cover border' />
                <div className='flex-1'>
                  <div className='font-bold flex gap-2 items-center flex-wrap'>
                    {p.full_name} - {p.age}y
                    <span className={`text-xs px-2 py-1 rounded-full ${p.report_count>=3?'bg-red-600 text-white':'bg-red-100 text-red-800 border'}`}>🚩 {p.report_count}/3</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.verification_status==='blocked'?'bg-gray-800 text-white':'bg-yellow-100'}`}>{p.verification_status}</span>
                    {p.guardian_contact && <a href={`tel:${p.guardian_contact}`} className='text-xs bg-blue-50 border px-2 py-1 rounded-full text-blue-600'>📞 {p.guardian_contact}</a>}
                  </div>
                  <div className='text-xs mt-1'>Living: {p.living_city} - {p.living_district_si} | Job: {p.job} | {p.religion} | {p.caste} | Fee: {p.verification_fee_type} | Created: {new Date(p.created_at).toLocaleDateString()}</div>
                  <div className='text-[11px] text-gray-500 mt-1'>ID: {p.id.slice(0,8)}... | Bio: {(p.bio||'').slice(0,60)}</div>
                </div>
                <div className='flex md:flex-col gap-2'>
                  <Link href={`/profile/${p.id}`} className='bg-white border px-3 py-2 rounded-full text-xs text-center'>View</Link>
                  <button disabled={actingId===p.id} onClick={()=>handleClearReports(p)} className='bg-green-600 text-white px-3 py-2 rounded-full text-xs font-bold'>✅ Clear & Verify</button>
                  {p.verification_status==='blocked' ? (
                    <button disabled={actingId===p.id} onClick={()=>handleUnblock(p)} className='bg-blue-600 text-white px-3 py-2 rounded-full text-xs'>Unblock</button>
                  ) : (
                    <button disabled={actingId===p.id} onClick={()=>handleBlock(p)} className='bg-red-600 text-white px-3 py-2 rounded-full text-xs'>🚫 Block</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-white border rounded-2xl shadow overflow-hidden'>
        <div className='p-3 bg-gray-50 border-b font-bold text-sm'>Recent Report Details — who reported whom</div>
        {reports.length===0 ? <div className='p-4 text-center text-gray-500 text-sm'>No reports yet</div> : (
          <div className='divide-y max-h-96 overflow-y-auto'>
            {reports.map((r:any)=>(
              <div key={r.id} className='p-3 text-xs flex justify-between'>
                <div><span className='font-bold'>{r.reported?.full_name || r.reported_profile_id.slice(0,8)}</span> reported by <span className='font-bold'>{r.reporter?.full_name || r.reporter_profile_id.slice(0,8)}</span> — {r.reason}</div>
                <div className='text-gray-500'>{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
