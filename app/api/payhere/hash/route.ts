import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
export async function POST(req:NextRequest){
  const { order_id, amount } = await req.json();
  const merchant_id = process.env.PAYHERE_MERCHANT_ID!;
  const secret = process.env.PAYHERE_MERCHANT_SECRET!;
  const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
  const amountFormatted = Number(amount).toFixed(2);
  const hash = crypto.createHash('md5').update(merchant_id + order_id + amountFormatted + 'LKR' + hashedSecret).digest('hex').toUpperCase();
  return NextResponse.json({ hash, merchant_id, sandbox: process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true' });
}