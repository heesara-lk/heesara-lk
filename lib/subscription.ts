// lib/subscription.ts - V10.16 - Freemium Contact Paywall - Safe
import { supabase } from './supabase-heesara';

export const PRICING = {
  NORMAL_6M: 1500,
  DISCOUNTED_6M: 750, // 50% off for first 1000 after 6 months
  FREE_LIMIT: 5,
};

export async function checkFreeSlots(){
  // count only is_free=true - accurate + safe
  const { count: total } = await supabase.from('profiles').select('*', {count:'exact', head:true});
  const { count: freeCount } = await supabase.from('profiles').select('*', {count:'exact', head:true}).eq('is_free', true);
  
  const free = freeCount || 0;
  const remaining = PRICING.FREE_LIMIT - free;
  
  return { 
    total: total || 0, 
    freeCount: free,
    count: total || 0, // backward compat
    remaining, 
    isFreeAvailable: free < PRICING.FREE_LIMIT 
  };
}

// === NEW: Active ද කියලා check කරන function ===
export function isProfileActive(profile:any){
  if(!profile) return false;
  if(profile.subscription_status === 'pending_payment') return false;
  const expStr = profile.plan_expires_at || profile.free_until;
  if(!expStr) return true; // no expiry = active (old profiles)
  const exp = new Date(expStr);
  return exp.getTime() > new Date().getTime();
}

// === NEW: Contact බලන්න පුළුවන්ද? (Viewer ගේ profile එක check කරන්නේ) ===
export function canViewContact(myProfile:any){
  if(!myProfile) return false;
  return isProfileActive(myProfile);
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
  return PRICING.NORMAL_6M;
}