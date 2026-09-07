import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req:NextRequest){
  const form = await req.formData();
  const order_id = form.get('order_id') as string;
  const payhere_amount = form.get('payhere_amount') as string;
  const status_code = form.get('status_code') as string; // 2 = success
  const md5sig = form.get('md5sig') as string;

  // Verify
  const secret = process.env.PAYHERE_MERCHANT_SECRET!;
  const merchant_id = process.env.PAYHERE_MERCHANT_ID!;
  const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
  const localSig = crypto.createHash('md5').update(merchant_id + order_id + payhere_amount + 'LKR' + status_code + hashedSecret).digest('hex').toUpperCase();

  if(localSig!== md5sig || status_code!== '2'){
    return NextResponse.json({error:'invalid'}, {status:400});
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: pay } = await supabase.from('payments').select('*').eq('id', order_id).single();
  if(!pay) return NextResponse.json({ok:false});

  if(pay.status!== 'completed'){
    const six = new Date(); six.setMonth(six.getMonth()+6);
    await supabase.from('profiles').update({
      subscription_status:'active', is_free:false,
      plan_expires_at: six.toISOString(), free_until: six.toISOString().split('T')[0],
      plan_type:'normal_6m'
    }).eq('id', pay.profile_id);
    await supabase.from('payments').update({status:'completed'}).eq('id', order_id);
  }
  return NextResponse.json({ok:true});
}