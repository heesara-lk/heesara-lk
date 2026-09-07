// lib/photo.ts - V10.15 Photo Upload helper
import { supabase } from './supabase-heesara';

export async function uploadProfilePhotos(files: File[], profileId?: string) {
  const urls: string[] = [];
  const folder = profileId || `temp-${Date.now()}`;
  
  for(let i=0; i<files.length && i<3; i++){
    const file = files[i];
    if(file.size > 5*1024*1024){ alert(`${file.name} too big - max 5MB`); continue; }
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${i}.${ext}`;
    
    const {error} = await supabase.storage.from('profile-photos').upload(path, file, { upsert:true });
    if(error){ console.error(error); alert(`Upload failed ${file.name}: ${error.message}`); continue; }
    
    const {data} = supabase.storage.from('profile-photos').getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export function getPhotoUrl(url?: string){
  if(!url) return '/placeholder-avatar.png';
  return url;
}
