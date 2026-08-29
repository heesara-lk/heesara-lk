"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-heesara'

export default function PhotosPage(){
  const [profile, setProfile] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    loadData()
  },[])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // Try with user, or get latest profile if no user (test mode)
    let q = supabase.from('profiles').select('*').order('created_at', {ascending:false}).limit(1)
    if(user) q = supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at', {ascending:false}).limit(1)
    const { data: profs } = await q
    if(profs && profs.length>0){
      setProfile(profs[0])
      const { data: ph } = await supabase.from('profile_photos').select('*').eq('profile_id', profs[0].id).order('created_at')
      setPhotos(ph || [])
    }
  }

  const compressImage = (file:File): Promise<Blob> => {
    return new Promise((resolve, reject)=>{
      const img = new Image()
      img.onload = ()=>{
        const canvas = document.createElement('canvas')
        const maxW = 800
        const scale = Math.min(1, maxW / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(b=>{ if(b) resolve(b); else reject('compress failed') }, 'image/webp', 0.6)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(!files || !profile){ setMsg('Profile එකක් හදාගන්න මුලින්ම'); return }
    if(photos.length + files.length > 3){ setMsg('උපරිම photos 3යි! දැන් තියෙන්නේ '+photos.length); return }

    setUploading(true); setMsg('')
    try{
      for(let i=0;i<files.length;i++){
        const file = files[i]
        if(file.size > 10*1024*1024){ setMsg('File එක 10MB වඩා ලොකුයි'); continue }
        const blob = await compressImage(file)
        const fileName = `${profile.id}/${Date.now()}_${i}.webp`
        const { error: upErr } = await supabase.storage.from('heesara-photos').upload(fileName, blob, { contentType:'image/webp', upsert:true })
        if(upErr) throw upErr
        const { data: urlData } = supabase.storage.from('heesara-photos').getPublicUrl(fileName)
        const url = urlData.publicUrl
        const { error: dbErr } = await supabase.from('profile_photos').insert({ profile_id: profile.id, url, is_primary: photos.length===0 && i===0 })
        if(dbErr) throw dbErr
      }
      setMsg('✅ Photos upload වුණා!')
      loadData()
    }catch(err:any){ setMsg('❌ Error: '+err.message) }
    finally{ setUploading(false) }
  }

  const handleDelete = async (id:string, url:string) => {
    if(!confirm('Photo එක delete කරන්නද?')) return
    try{
      const path = url.split('/heesara-photos/')[1]
      await supabase.storage.from('heesara-photos').remove([path])
      await supabase.from('profile_photos').delete().eq('id', id)
      setPhotos(photos.filter(p=>p.id!==id))
      setMsg('Deleted')
    }catch(err:any){ setMsg('Delete error: '+err.message) }
  }

  const setPrimary = async (id:string) => {
    await supabase.from('profile_photos').update({is_primary:false}).eq('profile_id', profile.id)
    await supabase.from('profile_photos').update({is_primary:true}).eq('id', id)
    loadData()
  }

  if(!profile){
    return <main className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[24px] text-center">
        <p>Profile එකක් නෑ</p><p className="text-xs mt-2">මුලින්ම profile එකක් හදන්න</p>
        <a href="/create-profile" className="mt-4 inline-block bg-[#7B1F2A] text-white px-6 py-2 rounded-xl">Create Profile</a>
      </div>
    </main>
  }

  return (
    <main className="min-h-screen bg-[#FFF8E7] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[24px] p-6 shadow">
        <h1 className="text-2xl font-bold text-[#7B1F2A]">📸 Photos Upload</h1>
        <p className="text-sm text-gray-600 mt-1">Profile: {profile.full_name} | Photos {photos.length}/3</p>
        <p className="text-xs text-gray-500 mt-1">Auto compress to WebP 800px - fast loading!</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {photos.map(p=>(
            <div key={p.id} className="relative group">
              <img src={p.url} alt="photo" className="w-full h-32 object-cover rounded-xl border-2 border-gray-200" />
              {p.is_primary && <span className="absolute top-1 left-1 bg-[#7B1F2A] text-white text-[10px] px-2 py-1 rounded-full">Main</span>}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center gap-1 transition">
                <button onClick={()=>setPrimary(p.id)} className="text-[10px] bg-white px-2 py-1 rounded">Set Main</button>
                <button onClick={()=>handleDelete(p.id, p.url)} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
          {Array.from({length: Math.max(0, 3-photos.length)}).map((_,i)=>(
            <div key={'empty'+i} className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">Empty</div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block w-full bg-[#7B1F2A] text-white text-center p-3 rounded-xl font-bold cursor-pointer">
            {uploading ? 'Uploading & Compressing...' : '📤 Photos තෝරන්න (3 දක්වා)'}
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading || photos.length>=3} />
          </label>
          <p className="text-[11px] text-gray-500 mt-2 text-center">JPG/PNG -> auto WebP 60% quality, max 800px width. Fast for Sri Lanka data!</p>
        </div>

        {msg && <p className="mt-4 text-sm p-3 bg-yellow-50 rounded-xl border text-center">{msg}</p>}

        <div className="mt-6 flex gap-2">
          <a href="/create-profile" className="flex-1 border p-3 rounded-xl text-center text-sm">⬅️ Edit Profile</a>
          <a href="/" className="flex-1 bg-[#2D8A4E] text-white p-3 rounded-xl text-center text-sm font-bold">✅ Finish -> Home</a>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
          <p className="font-bold">Tip:</p>
          <p>• පළමු photo එක Main photo එක වේ</p>
          <p>• Hover කර Set Main / Delete කරන්න</p>
          <p>• Photos 3ක් දාන්න - profile එක වැඩියෙන් පේනවා</p>
        </div>
      </div>
    </main>
  )
}
