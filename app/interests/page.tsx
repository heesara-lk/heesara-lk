'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import Link from 'next/link';

export default function InterestsPage(){
  const [rec,setRec]=useState<any[]>([]); const [sent,setSent]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  async function load(){
    const {data:me}=await supabase.from('profiles').select('*').limit(1).single();
    if(!me){setLoading(false);return;}
    const {data:r}=await supabase.from('interests').select('*,from_profile:from_profile_id(*),to_profile:to_profile_id(*)').eq('to_profile_id',me.id).order('created_at',{ascending:false});
    const {data:s}=await supabase.from('interests').select('*,from_profile:from_profile_id(*),to_profile:to_profile_id(*)').eq('from_profile_id',me.id).order('created_at',{ascending:false});
    setRec(r||[]); setSent(s||[]); setLoading(false);
  }
  useEffect(()=>{load();},[]);
  const upd=async(id:string,st:string)=>{await supabase.from('interests').update({status:st}).eq('id',id); load();};
  if(loading) return <div className='p-8'>Loading...</div>;
  return (
    <div className='max-w-5xl mx-auto p-6 space-y-8'>
      <h1 className='text-3xl font-bold'>💌 Interests V10 - Accept to Unlock Contact</h1>
      <div><h2 className='font-bold text-xl mb-3'>📥 Received {rec.length}</h2>{rec.map((i:any)=><div key={i.id} className='border rounded-xl p-4 flex justify-between'><div><Link href={`/profile/${i.from_profile?.id}`} className='font-bold text-blue-600'>{i.from_profile?.name}</Link><div className='text-sm'>{i.from_profile?.age} - {i.from_profile?.district} - {i.porondam_at_time?.total||'?'} /20</div><div className='text-sm font-bold'>{i.status}</div></div><div>{i.status==='pending' && <><button onClick={()=>upd(i.id,'accepted')} className='bg-green-600 text-white px-4 py-2 rounded-full mr-2'>Accept</button><button onClick={()=>upd(i.id,'rejected')} className='bg-gray-300 px-4 py-2 rounded-full'>Reject</button></>}{i.status==='accepted' && <span className='text-green-600'>✅ Contact unlocked</span>}</div></div>)}</div>
      <div><h2 className='font-bold text-xl mb-3'>📤 Sent {sent.length}</h2>{sent.map((i:any)=><div key={i.id} className='border rounded-xl p-4 flex justify-between'><div><Link href={`/profile/${i.to_profile?.id}`} className='font-bold text-blue-600'>{i.to_profile?.name}</Link><div className='text-sm'>{i.status==='pending'?'⏳ Waiting':i.status==='accepted'?'✅ Accepted - View contact': '❌ Rejected'}</div></div><Link href={`/profile/${i.to_profile?.id}`} className='text-blue-600 underline'>View</Link></div>)}</div>
    </div>
  );
}
