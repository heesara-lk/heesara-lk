// lib/subscription.ts - V11 - Tiered Verification + Guardian System
// First 100 Free Verified, Next 900 @ Rs.500 Verified, 1000+ @ Rs.1500 - All need admin guardian verification
import { supabase } from './supabase-heesara';

export const PRICING = {
  NORMAL_6M: 1500,
  DISCOUNTED_6M: 750,
  VERIFICATION_500: 500,
  FREE_100: 0,
  FREE_LIMIT: 1000, // old compat
  FREE_100_LIMIT: 100,
  FEE_500_LIMIT: 1000,
  // New tiered
  TIERS: {
    free_100: { limit: 100, amount: 0, label: 'මුල් 100 Free Verified' },
    fee_500: { limit: 1000, amount: 500, label: '900 @ Rs.500 Verified' },
    fee_1500: { limit: Infinity, amount: 1500, label: '1500+ Rs.1500' }
  }
};

export async function checkFreeSlots(){
  // New logic: tier based on TOTAL profiles count, not just freeCount
  const { count: total } = await supabase.from('profiles').select('*', {count:'exact', head:true});
  const { count: freeCount } = await supabase.from('profiles').select('*', {count:'exact', head:true}).eq('is_free', true);
  
  const totalCount = total || 0;
  const free = freeCount || 0;

  // Determine tier
  let feeType: 'free_100' | 'fee_500' | 'fee_1500' = 'free_100';
  let feeAmount = 0;
  let isFreeAvailable = false;
  let remainingFree100 = 0;
  let remaining500 = 0;

  if(totalCount < PRICING.FREE_100_LIMIT){
    feeType = 'free_100';
    feeAmount = 0;
    isFreeAvailable = true;
    remainingFree100 = PRICING.FREE_100_LIMIT - totalCount;
    remaining500 = PRICING.FEE_500_LIMIT - PRICING.FREE_100_LIMIT;
  } else if(totalCount < PRICING.FEE_500_LIMIT){
    feeType = 'fee_500';
    feeAmount = PRICING.VERIFICATION_500;
    isFreeAvailable = false;
    remainingFree100 = 0;
    remaining500 = PRICING.FEE_500_LIMIT - totalCount;
  } else {
    feeType = 'fee_1500';
    feeAmount = PRICING.NORMAL_6M;
    isFreeAvailable = false;
    remainingFree100 = 0;
    remaining500 = 0;
  }

  const remaining = PRICING.FREE_LIMIT - free; // old compat
  
  return { 
    total: totalCount, 
    freeCount: free,
    count: totalCount, // old compat alias
    remaining, // old compat
    remainingFree100,
    remaining500,
    isFreeAvailable, // true only for first 100
    isVerificationFee500: feeType === 'fee_500',
    isVerificationFee1500: feeType === 'fee_1500',
    feeType,
    feeAmount,
    tierLabel: PRICING.TIERS[feeType].label
  };
}

// New helper for new create-profile logic
export async function getVerificationFeeInfo(){
  const { count: total } = await supabase.from('profiles').select('*', {count:'exact', head:true});
  const totalCount = total || 0;
  if(totalCount < PRICING.FREE_100_LIMIT){
    return { feeType: 'free_100' as const, amount: 0, isFree: true, message: `Free! ${PRICING.FREE_100_LIMIT - totalCount} free slots left out of 100` };
  } else if(totalCount < PRICING.FEE_500_LIMIT){
    return { feeType: 'fee_500' as const, amount: 500, isFree: false, message: `Rs.500 verification fee - ${PRICING.FEE_500_LIMIT - totalCount} slots left at Rs.500` };
  } else {
    return { feeType: 'fee_1500' as const, amount: 1500, isFree: false, message: `Rs.1500 after 1000 profiles` };
  }
}

export function isProfileActive(profile:any){
  if(!profile) return false;
  if(profile.subscription_status === 'pending_payment') return false;
  // NEW: blocked profiles not active
  if(profile.verification_status === 'blocked') return false;
  const expStr = profile.plan_expires_at || profile.free_until;
  if(!expStr) return true;
  const exp = new Date(expStr);
  return exp.getTime() > new Date().getTime();
}

export function canViewContact(myProfile:any){
  if(!myProfile) return false;
  // Must be active AND verified
  if(!isProfileActive(myProfile)) return false;
  const verStatus = myProfile.verification_status || 'verified'; // backward compat: old profiles treated as verified
  if(verStatus !== 'verified' && myProfile.verification_status) return false;
  if(myProfile.guardian_verified === false) return false;
  return true;
}

export function canViewContactPair(viewer:any, candidate:any){
  // Both must be active and verified for contact to be visible
  if(!viewer || !candidate) return false;
  if(!isProfileActive(viewer) || !isProfileActive(candidate)) return false;
  const vStatus = viewer.verification_status || 'verified';
  const cStatus = candidate.verification_status || 'verified';
  if(viewer.verification_status && vStatus !== 'verified') return false;
  if(candidate.verification_status && cStatus !== 'verified') return false;
  if(viewer.guardian_verified === false) return false;
  if(candidate.guardian_verified === false) return false;
  if(candidate.verification_status === 'blocked') return false;
  return true;
}

export function getProfileExpiryInfo(profile:any){
  if(!profile) return null;
  const today = new Date();
  const freeUntil = profile.free_until ? new Date(profile.free_until) : null;
  const planExpires = profile.plan_expires_at ? new Date(profile.plan_expires_at) : freeUntil;
  if(!planExpires) return { status:'free', daysLeft: 180, message:'Free - 6 months' };
  
  const diffMs = planExpires.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000*60*60*24));
  
  if(daysLeft < 0) return { status:'expired', daysLeft, message:`Expired ${Math.abs(daysLeft)} days ago`, needsRenewal:true, renewalPrice: profile.is_free ? PRICING.DISCOUNTED_6M : PRICING.NORMAL_6M };
  if(daysLeft <= 30) return { status:'expiring_soon', daysLeft, message:`Expiring in ${daysLeft} days`, needsRenewalSoon:true, renewalPrice: profile.is_free ? PRICING.DISCOUNTED_6M : PRICING.NORMAL_6M };
  return { status: profile.subscription_status || 'free', daysLeft, message: profile.is_free ? `Free - ${daysLeft} days left` : `Active - ${daysLeft} days left` };
}

export function getRenewalPrice(profile:any){
  if(profile.is_free && profile.subscription_status === 'free') return PRICING.DISCOUNTED_6M;
  if(profile.verification_fee_type === 'fee_500') return PRICING.VERIFICATION_500;
  return PRICING.NORMAL_6M;
}
