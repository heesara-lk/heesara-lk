import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const APP_NAME='හීසර.lk'
export const FREE_SLOTS=1000

// 25 දිස්ත්‍රික්ක
export const DISTRICTS_SI=['අම්පාර','අනුරාධපුර','බදුල්ල','මඩකලපුව','කොළඹ','ගාල්ල','ගම්පහ','හම්බන්තොට','යාපනය','කළුතර','මහනුවර','කෑගල්ල','කිලිනොච්චිය','කුරුණෑගල','මන්නාරම','මාතලේ','මාතර','මොණරාගල','මුලතිව්','නුවරඑළිය','පොළොන්නරුව','පුත්තලම','රත්නපුර','ත්‍රිකුණාමලය','වව්නියාව']

// 38 ප්‍රධාන නගර
export const CITIES_SI=['කොළඹ','දෙහිවල','මොරටුව','ගම්පහ','මීගමුව','කළුතර','පානදුර','මහනුවර','පේරාදෙනිය','මාතලේ','දඹුල්ල','නුවරඑළිය','හැටන්','ගාල්ල','මාතර','වැලිගම','හම්බන්තොට','තංගල්ල','කුරුණෑගල','කුලියාපිටිය','පුත්තලම','හලාවත','අනුරාධපුර','පොළොන්නරුව','රත්නපුර','ඇඹිලිපිටිය','බදුල්ල','බණ්ඩාරවෙල','මොණරාගල','අම්පාර','මඩකලපුව','ත්‍රිකුණාමලය','යාපනය','කිලිනොච්චිය','මුලතිව්','මන්නාරම','වව්නියාව','කෑගල්ල']

// 2. රැකියා - වෙන වෙනම split
export const JOBS=[
  'රජයේ සේවක',
  'ගුරු',
  'විදුහල්පති',
  'වෛද්‍ය',
  'හෙද',
  'ඉංජිනේරු',
  'IT / මෘදුකාංග',
  'බැංකු / මූල්‍ය',
  'ව්‍යාපාරික',
  'ස්වයං රැකියා',
  'විදේශගත',
  'ගොවිතැන්',
  'හමුදා',
  'පොලිස් / ආරක්ෂක',
  'නීතීඥ',
  'ගණකාධිකාරී',
  'රූපලාවන්‍ය / මෝස්තර',
  'වෙනත් (type කරන්න)'
]

// 3. කුලය - අනවශ්‍යයි එකතු කළා
export const CASTES=[
  'අනවශ්‍යයි / නොදනී',
  'ගොවිගම',
  'කරාව',
  'සලාගම',
  'දේව',
  'බත්ගම',
  'වහුම්පුර',
  'නවන්දන්නා',
  'රදා',
  'හේන',
  'වෙනත් (type කරන්න)'
]

// 5. ශරීර ලක්ෂණ
export const BODY_TYPES=['කෙට්ටු','සාමාන්‍ය','මහත','ක්‍රීඩා ශරීර']
export const SKIN_COLORS=['ඉතා සුදු','සුදු','තලෙළු','අඳුරු තලෙළු']

// Email OTP - Phase 1 $0
export async function sendEmailOtp(email:string){
  return await supabase.auth.signInWithOtp({ email, options:{ shouldCreateUser:true } })
}
export async function verifyEmailOtp(email:string, token:string){
  return await supabase.auth.verifyOtp({ email, token, type:'email' })
}

// Free slots check
export async function checkFreeSlots(){
  const { data } = await supabase.rpc('get_free_slots_count')
  return { count: data||0, isFreeAvailable: (data||0) < FREE_SLOTS }
}

// Photo compress + upload
export async function compressAndUpload(file:File, profileId:string){
  const blob = await new Promise<Blob>((resolve)=>{
    const img=new Image()
    img.onload=()=>{
      const c=document.createElement('canvas')
      const s=Math.min(1,800/img.width)
      c.width=img.width*s; c.height=img.height*s
      c.getContext('2d')!.drawImage(img,0,0,c.width,c.height)
      c.toBlob(b=>resolve(b!),'image/webp',0.6)
    }
    img.src=URL.createObjectURL(file)
  })
  const name=`${profileId}/${Date.now()}.webp`
  const { error } = await supabase.storage.from('heesara-photos').upload(name, blob, {contentType:'image/webp'})
  if(error) throw error
  return supabase.storage.from('heesara-photos').getPublicUrl(name).data.publicUrl
}
