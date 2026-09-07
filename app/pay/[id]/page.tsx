'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-heesara';
import { useRouter, useParams } from 'next/navigation';

declare global { interface Window { payhere:any } }

export default function PayPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [payment, setPayment] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://www.payhere.lk/lib/payhere.js';
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
      if (error ||!data) { alert('Payment not found'); router.push('/account'); return; }
      if (data.user_id!== user.id) { alert('Not your payment'); router.push('/account'); return; }
      if (data.status === 'completed') { alert('Already paid!'); router.push('/account'); return; }
      setPayment(data);
      if (data.profile_id) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', data.profile_id).single();
        setProfile(p);
      }
      setLoading(false);
    })();
  }, [id]);

  const payViaPayHere = async () => {
    setPaying(true);
    try {
      // 1. Get hash from server (secret never exposed)
      const res = await fetch('/api/payhere/hash', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ order_id: payment.id, amount: payment.amount })
      });
      const { hash, merchant_id, sandbox } = await res.json();

      const payhere = (window as any).payhere;
      payhere.onCompleted = async (orderId:string) => {
        alert('Payment completed! Verifying...');
        // Don't update here — wait for notify_url, but show success
        router.push('/account?paid='+orderId);
      };
      payhere.onDismissed = () => setPaying(false);
      payhere.onError = (err:string) => { alert('PayHere error: '+err); setPaying(false); }

      payhere.startPayment({
        sandbox,
        merchant_id,
        return_url: `${window.location.origin}/account`,
        cancel_url: `${window.location.origin}/pay/${id}`,
        notify_url: `${window.location.origin}/api/payhere/notify`,
        order_id: payment.id,
        items: `Heesara - ${profile?.full_name || payment.profile_data?.full_name}`,
        amount: Number(payment.amount).toFixed(2),
        currency: 'LKR',
        hash,
        first_name: profile?.full_name || 'Heesara User',
        last_name: 'User',
        email: (await supabase.auth.getUser()).data.user?.email || 'user@heesara.lk',
        phone: profile?.phone || '0770000000',
        address: 'Colombo', city: 'Colombo', country: 'Sri Lanka'
      });
    } catch(e:any){ alert(e.message); setPaying(false); }
  };

  // Keep your old test button for sandbox
  const handleTestSuccess = async () => {
    setPaying(true);
    const six = new Date(); six.setMonth(six.getMonth() + 6);
    const freeUntil = six.toISOString().split('T')[0];
    await supabase.from('profiles').update({
      is_free:false, plan_expires_at:freeUntil, free_until:freeUntil,
      subscription_status:'active', plan_type:'normal_6m',
    }).eq('id', payment.profile_id);
    await supabase.from('payments').update({ status:'completed' }).eq('id', id);
    alert('TEST Success! 6 months active');
    router.push('/account');
  };

  if (loading) return <div className='p-8 text-center'>Loading payment V10.80...</div>;

  return (
    <div className='max-w-lg mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Heesara.lk - PayHere V10.80</h1>
      <div className='bg-white border-2 p-6 rounded-2xl shadow'>
        <h2 className='font-bold text-lg'>🔓 Unlock {profile?.full_name}</h2>
        <div className='mt-4 bg-yellow-50 border p-4 rounded-xl'>
          <p>Order: {payment.id.slice(0,8)}...</p>
          <p>Amount: <b>Rs. {payment.amount}</b> - 6 months</p>
          <p>Profile: {profile?.full_name || payment.profile_data?.full_name}</p>
          <p className='text-xs'>Per profile - unlocks 1 profile only</p>
        </div>
        <div className='mt-6 space-y-3'>
          <button disabled={paying} onClick={payViaPayHere} className='w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg'>
            {paying? 'Opening PayHere...' : '💳 Pay with PayHere - Rs.'+payment.amount}
          </button>
          <button disabled={paying} onClick={handleTestSuccess} className='w-full bg-green-600 text-white py-3 rounded-full text-sm'>
            ✅ TEST Bypass (sandbox only)
          </button>
          <p className='text-xs text-center text-gray-500'>Card / eZ Cash / Bank — secured by PayHere</p>
          <button onClick={() => router.push('/account')} className='w-full bg-gray-200 py-3 rounded-full'>Cancel</button>
        </div>
      </div>
    </div>
  );
}