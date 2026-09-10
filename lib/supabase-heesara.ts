// lib/supabase-heesara.ts - V10.3 FULL COMPATIBILITY FIX
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Test Mode Account Switching ----
export function getCurrentProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('heesara_current_profile_id');
}
export function setCurrentProfileId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('heesara_current_profile_id', id);
  window.dispatchEvent(new Event('heesara_profile_changed'));
}
export function clearCurrentProfileId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('heesara_current_profile_id');
  window.dispatchEvent(new Event('heesara_profile_changed'));
}
export async function getMyProfile() {
  const currentId = getCurrentProfileId();
  if (currentId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', currentId).single();
    if (data) return data;
  }
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true }).limit(1).single();
  return data;
}

// ---- OLD CONSTANTS (needed for create-profile page) ----
export const DISTRICTS_SI = ['කොළඹ','ගම්පහ','කළුතර','මහනුවර','මාතලේ','නුවරඑළිය','ගාල්ල','මාතර','හම්බන්තොට','යාපනය','මඩකලපුව','අම්පාර','ත්‍රිකුණාමලය','කුරුණෑගල','පුත්තලම','අනුරාධපුර','පොලොන්නරුව','බදුල්ල','මොනරාගල','රත්නපුර','කෑගල්ල'];
export const DISTRICTS_EN = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Batticaloa','Ampara','Trincomalee','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura','Kegalle'];
export const DISTRICTS = DISTRICTS_SI; // alias for old code
export const CITIES_SI = ['කොළඹ','දෙහිවල','මහරගම','මහනුවර','ගම්පහ','කුරුණෑගල','ගාල්ල','මාතර','යාපනය','අනුරාධපුර','රත්නපුර','බදුල්ල','කෑගල්ල','කළුතර','නුවරඑළිය'];
export const CITIES_EN = ['Colombo','Dehiwala','Maharagama','Kandy','Gampaha','Kurunegala','Galle','Matara','Jaffna','Anuradhapura','Ratnapura','Badulla','Kegalle','Kalutara','Nuwara Eliya'];

export const JOBS = ['ගුරු','විදුහල්පති','අධ්‍යාපන ක්ෂේත්‍රය','හෙද','වෛද්‍ය','සෞඛ්‍ය අංශය','ඉංජිනේරු','තාක්ෂණ නිලධාරී','ඉදිකිරීම් ක්ෂේත්‍රය','ඝනකාධිකාරි','ව්‍යාපාරික','ව්‍යවසායක','ස්වයං රැකියා','හමුදා','පොලිස්/ආරක්ෂක','රජයේ සේවක','නීතිඥ','නීති ක්ෂේත්‍රය','පෞද්ගලික සේවක','ඉඩම්හිමි වැවිලිකරු','ගොවිතැන','වෙනත්','නැත'];
export const JOBS_SPLIT = JOBS;
export const JOBS_EN = ['Teacher','Principal','Education Sector','Nurse','Doctor','Health sector','Engineer','Technical Officer','Construction Sector','Accountant','Business','Entrepreneur','Self-employed','Army','Police/Security','Government','Lawyer','Law sector','Private','Own Plantation','Farming','Any Other','No'];

export const CASTES = ['අනවශ්‍යයි / නොදනී','ගොවිගම','කරාව','දුරාව','සලාගම','බත්ගම','වහුම්පුර','වෙනත්'];
export const CASTES_EN = ['Unwanted/Unknown','Govigama','Karawa','Durawa','Salagama','Bathgama','Wahumpura','Other'];

export const BODY_TYPES = ['කෙට්ටු','සාමාන්‍ය','මහත','ක්‍රීඩා ශරීර'];
export const SKIN_COLORS = ['ඉතා සුදු','සුදු','තලෙළු','අඳුරු තලෙළු'];

export const HEIGHTS = ['4.5ft','5.0ft','5.2ft','5.5ft','5.8ft','6.0ft','6.2ft'];
