'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProfileExpiryInfo, getRenewalPrice, isProfileActive } from '@/lib/subscription';

const ADMIN_EMAILS_RAW = ['manjula.upashantha@gmail.com','akm.upashantha@gmail.com','akmupashantha@gmail.com','heesara@gmail.com','manjulaupashantha@gmail.com'];
function normalizeEmail(e:string){ return e.toLowerCase().replace(/\./g,'').replace(/\+.*@/, '@'); }
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map(e=>e.toLowerCase());
const ADMIN_NORMALIZED = ADMIN_EMAILS_RAW.map(e=>normalizeEmail(e));
function isAdminEmail(email?:string|null){ if(!email) return false; const low=email.toLowerCase(); const norm=normalizeEmail(email); return ADMIN_EMAILS.includes(low) || ADMIN_NORMALIZED.includes(norm); }

export default function AccountPage(){
  const router=useRouter();
  const [profiles,setProfiles]=useState<any[]>([]);
  const [allCount,setAllCount]=useState(0);
  const [loading,setLoading]=useState(true);
  const [user,setUser]=useState<any>(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [received,setReceived]=useState<any[]>([]);
  const [sent,setSent]=useState<any[]>([]);

  async function load(){
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if(!authUser){ router.push('/login'); return; }
    setUser(authUser);
    setIsAdmin(isAdminEmail(authUser.email));
    const { data, count } = await supabase.from('profiles').select('*', {count:'exact'}).eq('user_id', authUser.id).order('created_at',{ascending:false});
    setProfiles(data||[]); setAllCount(count||0);
    if(data && data.length>0){
      const ids = data.map((p:any)=>p.id);
      localStorage.setItem('heesara_my_ids', JSON.stringify(ids.slice(0,10)));
      if(!localStorage.getItem('heesara_current_profile_id')){
        localStorage.setItem('heesara_current_profile_id', data[0].id);
      }
      const {data: allRec} = await supabase.from('interests').select('*').in('receiver_profile_id', ids).order('created_at',{ascending:false});
      const {data: allRecByUser} = await supabase.from('interests').select('*').eq('receiver_user_id', authUser.id).order('created_at',{ascending:false});
      const {data: allSent} = await supabase.from('interests').select('*').in('sender_profile_id', ids).order('created_at',{ascending:false});
      const {data: allSentByUser} = await supabase.from('interests').select('*').eq('sender_user_id', authUser.id).order('created_at',{ascending:false});
      const mergedRec = [...(allRec||[]),...(allRecByUser||[])];
      const mergedSent = [...(allSent||[]),...(allSentByUser||[])];
      const uniqueRec = Array.from(new Map(mergedRec.map((i:any)=>[i.id,i])).values());
      const uniqueSent = Array.from(new Map(mergedSent.map((i:any)=>[i.id,i])).values());
      const allIds = [...uniqueRec.map((r:any)=>r.sender_profile_id), ...uniqueSent.map((s:any)=>s.receiver_profile_id)].filter(Boolean) as string[];
const needIds = Array.from(new Set(allIds));
      let profileMap:any = {};
      if(needIds.length>0){
        const {data: needProfiles} = await supabase.from('profiles').select('*').in('id', needIds);
        (needProfiles||[]).forEach((p:any)=> profileMap[p.id]=p);
      }
      const recWith = uniqueRec.map((r:any)=> ({...r, sender: profileMap[r.sender_profile_id], receiver: data.find((p:any)=>p.id===r.receiver_profile_id) || profileMap[r.receiver_profile_id]}));
      const sentWith = uniqueSent.map((s:any)=> ({...s, sender: data.find((p:any)=>p.id===s.sender_profile_id) || profileMap[s.sender_profile_id], receiver: profileMap[s.receiver_profile_id]}));
      setReceived(recWith);
      setSent(sentWith);
    }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  // --- NEW: Deactivate / Reactivate instead of Delete ---
  const handleDeactivate = async (p:any) => {
    const ok = confirm(`Hide "${p.full_name}" from search?\n\nYour paid period will stay safe. You can Reactivate anytime.\n\nIf you want totally new profile, use Edit instead.`);
    if(!ok) return;
    const { error } = await supabase.from('profiles').update({ is_visible: false }).eq('id', p.id).eq('user_id', user.id);
    if(error){ alert(error.message); return; }
    load();
  };

  const handleReactivate = async (p:any) => {
    const { error } = await supabase.from('profiles').update({ is_visible: true }).eq('id', p.id).eq('user_id', user.id);
    if(error){ alert(error.message); return; }
    load();
  };

  const handleRenew = async (profile:any) => {
    const price = getRenewalPrice(profile);
    const { data: order, error } = await supabase.from('payments').insert({
      user_id: user.id, amount: price, status: 'pending',
      profile_id: profile.id, profile_data: { full_name: profile.full_name },
      plan_type: profile.is_free? 'discounted_6m' : 'normal_6m'
    }).select().single();
    if(error){ alert('Order error: '+error.message); return; }
    router.push(`/pay/${order.id}`);
  };
  const acceptInterest = async (id:string) => {
    await supabase.from('interests').update({status:'accepted'}).eq('id', id);
    load();
  };
  const rejectInterest = async (id:string) => {
    await supabase.from('interests').update({status:'rejected'}).eq('id', id);
    load();
  };

  // View correct pair, not active profile
  const viewPair = (it:any) => {
    const myProfileId = profiles.find((p:any)=>p.id===it.sender_profile_id)?.id
    ? it.sender_profile_id
      : profiles.find((p:any)=>p.id===it.receiver_profile_id)?.id
    ? it.receiver_profile_id
      : profiles[0]?.id;
    const otherId = myProfileId === it.sender_profile_id? it.receiver_profile_id : it.sender_profile_id;
    if(myProfileId){
      localStorage.setItem('heesara_current_profile_id', myProfileId);
    }
    router.push(`/profile/${otherId}`);
  };

  if(loading) return <div className='p-8 text-center'>Loading...</div>;
  const canCreate = isAdmin? true : profiles.length<2;
  const pendingProfiles = profiles.filter((p:any)=>p.subscription_status==='pending_payment');
  const receivedPending = received.filter((r:any)=>r.status==='sent');
  const receivedAccepted = received.filter((r:any)=>r.status==='accepted');

  return (
    <div className='max-w-4xl mx-auto p-4 bg-[#FFFBEB] min-h-screen'>
      <div className='flex justify-between mb-4'>
        <button onClick={()=>router.back()} className='border bg-white px-4 py-2 rounded-full'>Back</button>
        <Link href='/' className='border bg-white px-4 py-2 rounded-full'>Home</Link>
      </div>
      <h1 className='text-2xl font-bold mb-2'>My Profiles</h1>
      <div className='bg-white border-2 p-4 rounded-xl mb-4'>
        <div className='font-bold'>{user?.email} {isAdmin?'👑 Admin':''}</div>
        <div className='text-sm'>My Profiles: {allCount}/{isAdmin?'∞':'2'} | Received: {receivedPending.length} (Total {received.length}) | Sent: {sent.length} | Accepted: {receivedAccepted.length}</div>
      </div>

      {receivedPending.length>0 && (
        <div className='bg-green-50 border-2 border-green-500 p-4 rounded-2xl mb-4'>
          <div className='font-bold text-green-800 text-xl'>💌 {receivedPending.length} New Interest Received!</div>
          {receivedPending.map((it:any)=>(
            <div key={it.id} className='mt-3 bg-white border-2 border-green-200 p-3 rounded-xl flex justify-between items-center'>
              <div className='flex gap-3 items-center'>
                <div className='w-12 h-12 rounded-full bg-gray-100 overflow-hidden'>{it.sender?.main_photo_url && <img src={it.sender.main_photo_url} className='w-full h-full object-cover'/>}</div>
                <div><b>{it.sender?.full_name||'Someone'}</b> ({it.sender?.age}y) → {it.receiver?.full_name} <div className='text-xs text-gray-600'>{it.sender?.job} | {it.sender?.living_city}</div></div>
              </div>
              <div className='flex gap-2'>
                <button onClick={()=>acceptInterest(it.id)} className='bg-green-600 text-white px-5 py-2 rounded-full font-bold'>Accept</button>
                <button onClick={()=>rejectInterest(it.id)} className='bg-gray-200 px-4 py-2 rounded-full'>Reject</button>
                <button onClick={()=>viewPair(it)} className='bg-blue-600 text-white px-4 py-2 rounded-full text-sm'>View Pair</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {receivedAccepted.length>0 && (
        <div className='bg-blue-50 border-2 border-blue-300 p-4 rounded-2xl mb-4'>
          <div className='font-bold text-blue-700'>✅ {receivedAccepted.length} Accepted</div>
          {receivedAccepted.map((it:any)=>(
            <div key={it.id} className='mt-2 bg-white border p-2 rounded-xl flex justify-between text-sm'>
              <div>{it.sender?.full_name} → {it.receiver?.full_name} - Accepted</div>
              <button onClick={()=>viewPair(it)} className='text-blue-600 underline'>View Pair</button>
            </div>
          ))}
        </div>
      )}

      {sent.length>0 && (
        <div className='bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl mb-4'>
          <div className='font-bold'>📤 {sent.length} Sent</div>
          {sent.map((it:any)=>(
            <div key={it.id} className='mt-2 bg-white border p-2 rounded-xl flex justify-between text-sm'>
              <div>{it.sender?.full_name} → {it.receiver?.full_name} - {it.status}</div>
              <button onClick={()=>viewPair(it)} className='text-blue-600 underline'>View Pair</button>
            </div>
          ))}
        </div>
      )}

      {pendingProfiles.length>0 && (
        <div className='bg-red-50 border-2 border-red-400 p-4 rounded-2xl mb-4'>
          <div className='font-bold text-red-700 text-lg'>🔒 {pendingProfiles.length} Pending Payment</div>
          {pendingProfiles.map((p:any)=>(
            <div key={p.id} className='mt-3 bg-white border p-3 rounded-xl flex justify-between'>
              <div><b>{p.full_name}</b> - Rs.{getRenewalPrice(p)}</div>
              <button onClick={()=>handleRenew(p)} className='bg-green-600 text-white px-5 py-2 rounded-full font-bold'>Pay Rs.{getRenewalPrice(p)}</button>
            </div>
          ))}
        </div>
      )}

      <div className='flex gap-3 mb-6'>
        {canCreate? <Link href='/create-profile' className='bg-green-600 text-white px-5 py-3 rounded-full font-bold'>+ Create New ({profiles.length}/{isAdmin?'∞':'2'})</Link> : <button disabled className='bg-gray-300 px-5 py-3 rounded-full'>Max 2 reached</button>}
        <Link href='/matches' className='bg-blue-600 text-white px-5 py-3 rounded-full'>Matches</Link>
        <button onClick={async()=>{ await supabase.auth.signOut(); router.push('/login'); }} className='bg-gray-200 px-5 py-3 rounded-full'>Logout</button>
      </div>

      <div className='grid gap-4'>
        {profiles.map((p:any)=>{
          const info = getProfileExpiryInfo(p); const active = isProfileActive(p); const main=p.main_photo_url||p.photo_urls?.[0];
          const isVisible = p.is_visible!== false; // null/true = visible
          return (
            <div key={p.id} className={`border-2 rounded-2xl p-4 bg-white shadow flex gap-4 ${!active?'border-red-300':''} ${!isVisible?'border-yellow-400 bg-yellow-50':''}`}>
              <div className='w-24 h-24'>{main? <img src={main} className='w-full h-full object-cover rounded-xl border-2'/> : <div className='w-full h-full bg-gray-100 rounded-xl flex items-center justify-center'>P</div>}</div>
              <div className='flex-1'>
                <div className='flex justify-between'>
                  <div>
                    <div className='font-bold text-lg'>{p.full_name} - {p.age}y - {p.birth_district_si}
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${p.subscription_status==='pending_payment'?'bg-red-100 text-red-700': active?'bg-green-100 text-green-700':'bg-orange-100'}`}>{p.subscription_status}</span>
                      {!isVisible && <span className='ml-2 text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800'>Hidden</span>}
                    </div>
                    <div className='text-sm'>Job: {p.job} | {p.height_cm}cm | {info?.message}</div>
                  </div>
                  <div className='flex flex-col gap-2 items-end'>
                    <div className='flex gap-2'>
                      <Link href={`/profile/${p.id}`} className='text-blue-600 underline text-sm border bg-white px-3 py-1 rounded-full'>View Own</Link>
                      <Link href={`/create-profile?edit=${p.id}`} className='text-green-600 underline text-sm border bg-white px-3 py-1 rounded-full'>Edit</Link>
                    </div>
                    {!active && <button onClick={()=>handleRenew(p)} className='bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold'>Pay Rs.{getRenewalPrice(p)}</button>}
                    {isVisible? (
                      <button onClick={()=>handleDeactivate(p)} className='bg-yellow-50 text-yellow-700 border border-yellow-300 px-3 py-1 rounded-full text-xs'>Hide / Deactivate</button>
                    ) : (
                      <button onClick={()=>handleReactivate(p)} className='bg-green-50 text-green-700 border border-green-300 px-3 py-1 rounded-full text-xs font-bold'>Reactivate</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}