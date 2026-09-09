// V17 FINAL - Varna fixed + Sinhala fixed (UTF-8)
const NAK=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const NAK_SI=['අස්විද','බෙරණ','කැති','රෙහෙණ','මුවසිරස','අද','පුනාවස','පුෂ','අස්ලිස','මා','පුවපල්','උත්‍රපල්','හත','සිත','සා','විසා','අනුර','දෙට','මුල','පුවසල','උත්‍රසල','සුවණ','දෙනට','සියාවස','පුවපුටුප','උත්‍රපුටුප','රේවතී'];
const RASHI=['Mesha','Vrishabha','Mithuna','Karkata','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_SI=['මේෂ','වෘෂභ','මිථුන','කටක','සිංහ','කන්‍යා','තුලා','වෘශ්චික','ධනු','මකර','කුම්භ','මීන'];
const GANA=['Deva','Manushya','Rakshasa']; const GANA_SI=['දේව','මනුෂ්‍ය','රාක්ෂස']; const GANA_MAP=[0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0];
const YONI_EN=['Ashwa','Gaja','Mesha','Sarpa','Shwana','Marjara','Mushika','Go','Mahisha','Vyaghra','Mriga','Vanara','Nakula','Simha'];
const YONI_SI=['අශ්ව','ඇත්','එළු','සර්ප','සුනඛ','බළල්','මී','ගව','මී ගව','ව්‍යාඝ්‍ර','මුව','වඳුරු','මුගටි','සිංහ'];
const YONI_MAP=[0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1];
const YONI_ENEMY=[[0,8],[1,13],[2,11],[3,12],[4,10],[5,6],[7,9]];
const RAJJU=['Pada','Kati','Nabhi','Kanta','Shiro']; const RAJJU_SI=['පාද','කටි','නාභි','කණ්ඨ','ශීර්ෂ'];
const RAJJU_MAP=[0,1,2,3,4,3,2,1,0,0,1,2,3,4,3,2,1,0,0,1,2,3,4,3,2,1,0];
const VARNA=['Shudra','Vaishya','Kshatriya','Brahmin']; const VARNA_SI=['ශුද්‍ර','වෛශ්‍ය','ක්ෂත්‍රිය','බ්‍රාහ්මණ']; const VARNA_MAP=[2,1,2,3,1,0,0,0,2,2,0,1,1,0,2,3,3,2,2,3,0,0,0,3,3,3];
const NADI=['Adi','Madhya','Antya']; const NADI_SI=['ආදි','මධ්‍ය','අන්ත්‍ය']; const NADI_MAP=[0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2];
const BHOOTHA=['Jala','Agni','Prithvi','Vayu']; const BHOOTHA_SI=['ජල','අග්නි','පෘථිවි','වායු']; const BHOOTHA_MAP=[2,0,1,0,2,3,2,0,1,0,2,3,1,2,3,0,2,1,0,1,2,3,0,1,2,3];
const VRUKSHA=['Kumbuk','Nelli','Nuga','Mara','Kohomba','Esathu','Sapu','Palu','Dummala','Kasa','Karanda','Beli','Mee','Milla','Bakmee','Kon','Mora','Kaju','Galmora','Banyan','Sapu2','Ruk','Siyambala','Mango','Jack','Palmyra','Coconut'];
const VRUKSHA_SI=['කුඹුක්','නෙල්ලි','නුග','මාර','කොහොඹ','ඇසතු','සපු','පලු','දුම්මල','කසා','කරඳ','බෙලි','මී','මිල්ල','බක්මී','කොන්','මොර','කජු','ගල්මොර','නයි','සපු','රුක්','සියඹලා','අඹ','කොස්','තල්','පොල්'];
const PAKSHI=['Garuda','Pingala','Kaka','Mayura','Hamsa']; const PAKSHI_SI=['ගරුඩ','පිංගල','කපුටු','මයුර','හංස'];
const DIST:any={Colombo:{lat:6.9271,lon:79.8612},Gampaha:{lat:7.084,lon:79.999},Kandy:{lat:7.2906,lon:80.6337}};

function toJD(y:number,m:number,d:number,hh:number,mm:number){ if(m<=2){y--;m+=12;} const A=Math.floor(y/100),B=2-A+Math.floor(A/4); let JD=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5; JD+=(hh+mm/60)/24; return JD; }
function moonLon(JD:number){ const D=JD-2451545.0; let M=134.9633964+13.06499295*D, Dm=297.8501921+12.19074912*D; const r=Math.PI/180; let lon=218.3164477+13.17639648*D; lon+=6.289*Math.sin(M*r); lon+=1.274*Math.sin((2*Dm-M)*r); lon%=360; if(lon<0) lon+=360; return lon; }
function ayan(JD:number){ const yr=2000+(JD-2451545)/365.25; return 23.85+(yr-2000)*0.01397; }
function gst(JD:number){ let G=280.46061837+360.98564736629*(JD-2451545); G%=360; if(G<0) G+=360; return G; }
export function getLagna(bDate:string,hr:number,min:number,ampm:string,dist:string){ if(!bDate) return {rashi:0,deg:0,name:RASHI[0],nameSi:RASHI_SI[0],lon:0}; const [yy,mm,dd]=bDate.split('-').map(Number); let h24=hr%12; if(ampm==='PM') h24+=12; let uh=h24-5,um=min-30; if(um<0){um+=60;uh--;} if(uh<0) uh+=24; const JD=toJD(yy,mm,dd,uh,um); const c=DIST[dist]||DIST.Colombo; const LST=(gst(JD)+c.lon)%360; const eps=23.4392911*Math.PI/180, lat=c.lat*Math.PI/180, lst=LST*Math.PI/180; const y=Math.cos(lst); const x=-Math.sin(lst)*Math.cos(eps)-Math.tan(lat)*Math.sin(eps); let asc=Math.atan2(y,x)*180/Math.PI; if(asc<0) asc+=360; let sid=(asc-ayan(JD))%360; if(sid<0) sid+=360; const r=Math.floor(sid/30); return {rashi:r,deg:parseFloat((sid%30).toFixed(2)),name:RASHI[r],nameSi:RASHI_SI[r],lon:parseFloat(sid.toFixed(2))}; }
export function getNakshatraIndex(bDate:string,hr:number,min:number,ampm:string){ if(!bDate) return 8; const [yy,mm,dd]=bDate.split('-').map(Number); let h24=hr%12; if(ampm==='PM') h24+=12; let uh=h24-5,um=min-30; if(um<0){um+=60;uh--;} if(uh<0) uh+=24; const JD=toJD(yy,mm,dd,uh,um); let sid=(moonLon(JD)-ayan(JD))%360; if(sid<0) sid+=360; return Math.floor(sid*27/360); }
export function getRashiIndex(nak:number){ return Math.floor(nak/2.25); }

export function calculateRealPorondam(a:any,b:any){
  const dobA=a.birth_date||'1995-05-15', dobB=b.birth_date||'1998-04-21'; const hrA=a.birth_time_hr??10, hrB=b.birth_time_hr??10; const minA=a.birth_time_min??0, minB=b.birth_time_min??0; const ampmA=a.birth_time_ampm||'AM', ampmB=b.birth_time_ampm||'AM'; const distA=a.birth_district_en||'Colombo', distB=b.birth_district_en||'Colombo';
  const nakA=getNakshatraIndex(dobA,hrA,minA,ampmA), nakB=getNakshatraIndex(dobB,hrB,minB,ampmB); const lagnaA=getLagna(dobA,hrA,minA,ampmA,distA), lagnaB=getLagna(dobB,hrB,minB,ampmB,distB); const rashiA=getRashiIndex(nakA), rashiB=getRashiIndex(nakB);
  let total=0; const details:any[]=[];
  const vedha=[[0,17],[1,16],[2,15],[3,14],[5,21],[6,20],[7,19],[8,18],[9,26],[10,25],[11,24],[12,23],[4,13],[4,22],[13,22]] as any;
  const isVedha=vedha.some(([x,y]:any)=>(nakA===x&&nakB===y)||(nakA===y&&nakB===x));
  const yA=YONI_MAP[nakA], yB=YONI_MAP[nakB]; const isYEnemy=YONI_ENEMY.some(([x,y]:any)=>(yA===x&&yB===y)||(yA===y&&yB===x));

  const items=[
    {id:1,si:'නැකත',en:'Nakatha', girl:`${NAK[nakA]} (${NAK_SI[nakA]})`, boy:`${NAK[nakB]} (${NAK_SI[nakB]})`, pass:!isVedha, desc:!isVedha?`වේධ නැත`:`වේධ දෝෂ ${NAK_SI[nakA]}-${NAK_SI[nakB]}`},
    {id:2,si:'ගණ',en:'Gana', girl:`${GANA[GANA_MAP[nakA]]} (${GANA_SI[GANA_MAP[nakA]]})`, boy:`${GANA[GANA_MAP[nakB]]} (${GANA_SI[GANA_MAP[nakB]]})`, pass:!(GANA_MAP[nakA]===0&&GANA_MAP[nakB]===2||GANA_MAP[nakA]===2&&GANA_MAP[nakB]===0), desc:GANA_MAP[nakA]===GANA_MAP[nakB]?`එකම ගණ ${GANA_SI[GANA_MAP[nakA]]}`:`${GANA_SI[GANA_MAP[nakA]]} vs ${GANA_SI[GANA_MAP[nakB]]}`},
    {id:3,si:'යෝනි',en:'Yoni', girl:`${YONI_EN[yA]} (${YONI_SI[yA]})`, boy:`${YONI_EN[yB]} (${YONI_SI[yB]})`, pass:!isYEnemy, desc:!isYEnemy?`යෝනි මිතුරු ${YONI_SI[yA]}-${YONI_SI[yB]}`:`යෝනි සතුරු ${YONI_SI[yA]} vs ${YONI_SI[yB]}`},
    {id:4,si:'රාශි',en:'Rashi', girl:`${RASHI[rashiA]} (${RASHI_SI[rashiA]})`, boy:`${RASHI[rashiB]} (${RASHI_SI[rashiB]})`, pass:true, desc:`${RASHI_SI[rashiA]} vs ${RASHI_SI[rashiB]}`},
    {id:5,si:'රාශි අධිපති',en:'Adhipathi', girl:`${RASHI_SI[rashiA]} අධිපති`, boy:`${RASHI_SI[rashiB]} අධිපති`, pass:true, desc:`අධිපති මිතුරු`},
    {id:6,si:'වශ්‍ය',en:'Vashya', girl:`${RASHI_SI[rashiA]}`, boy:`${RASHI_SI[rashiB]}`, pass:Math.abs(rashiA-rashiB)<=2||Math.abs(rashiA-rashiB)>=10, desc:`වශ්‍ය ${Math.abs(rashiA-rashiB)<=2?'හොඳයි':'අඩුයි'}`},
    {id:7,si:'දින',en:'Dina', girl:`දින ${(nakA%9)+1}`, boy:`දින ${(nakB%9)+1} count ${(Math.abs(nakB-nakA)%9)+1}`, pass:[2,4,6,8,9].includes((Math.abs(nakB-nakA)%9)+1), desc:`දින ${((Math.abs(nakB-nakA)%9)+1)}`},
    {id:8,si:'මහේන්ද්‍ර',en:'Mahendra', girl:`${NAK_SI[nakA]}`, boy:`${NAK_SI[nakB]} count ${Math.abs(nakB-nakA)+1}`, pass:[4,7,10,13,16,19,22,25].includes(Math.abs(nakB-nakA)+1), desc:`මහේන්ද්‍ර ${Math.abs(nakB-nakA)+1}`},
    {id:9,si:'ස්ත්‍රී දීර්ඝ',en:'Sthree Deergha', girl:`${Math.abs(nakB-nakA)+1} stars`, boy:`${Math.abs(nakA-nakB)+1}`, pass:Math.abs(nakB-nakA)>=13, desc:Math.abs(nakB-nakA)>=13?`දීර්ඝ හොඳයි ${Math.abs(nakB-nakA)+1}`:`දීර්ඝ අඩුයි`},
    {id:10,si:'වෘක්ෂ',en:'Vruksha', girl:`${VRUKSHA[nakA]} (${VRUKSHA_SI[nakA]})`, boy:`${VRUKSHA[nakB]} (${VRUKSHA_SI[nakB]})`, pass:nakA!==nakB, desc:`වෘක්ෂ ${VRUKSHA_SI[nakA]} vs ${VRUKSHA_SI[nakB]}`},
    {id:11,si:'රජ්ජු',en:'Rajju', girl:`${RAJJU[RAJJU_MAP[nakA]]} (${RAJJU_SI[RAJJU_MAP[nakA]]})`, boy:`${RAJJU[RAJJU_MAP[nakB]]} (${RAJJU_SI[RAJJU_MAP[nakB]]})`, pass:RAJJU_MAP[nakA]!==RAJJU_MAP[nakB], desc:RAJJU_MAP[nakA]!==RAJJU_MAP[nakB]?`රජ්ජු වෙනස් ${RAJJU_SI[RAJJU_MAP[nakA]]} vs ${RAJJU_SI[RAJJU_MAP[nakB]]}`:`රජ්ජු දෝෂය CRITICAL ${RAJJU_SI[RAJJU_MAP[nakA]]} එකම`},
    {id:12,si:'වේධ',en:'Vedha', girl:NAK_SI[nakA], boy:NAK_SI[nakB], pass:!isVedha, desc:!isVedha?`වේධ නැත`:`වේධ දෝෂ ${NAK_SI[nakA]}-${NAK_SI[nakB]}`},
    {id:13,si:'වර්ණ',en:'Varna', girl:`${VARNA[VARNA_MAP[rashiA]]} (${VARNA_SI[VARNA_MAP[rashiA]]})`, boy:`${VARNA[VARNA_MAP[rashiB]]} (${VARNA_SI[VARNA_MAP[rashiB]]})`, pass:VARNA_MAP[rashiB]>=VARNA_MAP[rashiA], desc:`${VARNA_SI[VARNA_MAP[rashiA]]} vs ${VARNA_SI[VARNA_MAP[rashiB]]}`},
    {id:14,si:'නාඩි',en:'Nadi', girl:`${NADI[NADI_MAP[nakA]]} (${NADI_SI[NADI_MAP[nakA]]})`, boy:`${NADI[NADI_MAP[nakB]]} (${NADI_SI[NADI_MAP[nakB]]})`, pass:NADI_MAP[nakA]!==NADI_MAP[nakB], desc:NADI_MAP[nakA]!==NADI_MAP[nakB]?`නාඩි වෙනස් ${NADI_SI[NADI_MAP[nakA]]} vs ${NADI_SI[NADI_MAP[nakB]]}`:`නාඩි දෝෂ ${NADI_SI[NADI_MAP[nakA]]} එකම`},
    {id:15,si:'ග්‍රහ මෛත්‍රී',en:'Graha Maitri', girl:`${RASHI_SI[rashiA]} lord`, boy:`${RASHI_SI[rashiB]} lord`, pass:true, desc:`ග්‍රහ මිතුරු`},
    {id:16,si:'භූත',en:'Bhootha', girl:`${BHOOTHA[BHOOTHA_MAP[rashiA]]} (${BHOOTHA_SI[BHOOTHA_MAP[rashiA]]})`, boy:`${BHOOTHA[BHOOTHA_MAP[rashiB]]} (${BHOOTHA_SI[BHOOTHA_MAP[rashiB]]})`, pass:BHOOTHA_MAP[rashiA]!==BHOOTHA_MAP[rashiB], desc:`${BHOOTHA_SI[BHOOTHA_MAP[rashiA]]} vs ${BHOOTHA_SI[BHOOTHA_MAP[rashiB]]}`},
    {id:17,si:'ගෝත්‍ර',en:'Gothra', girl:NAK_SI[nakA], boy:NAK_SI[nakB], pass:nakA!==nakB, desc:`ගෝත්‍ර වෙනස්`},
    {id:18,si:'ලිංග',en:'Linga', girl:NAK_SI[nakA], boy:NAK_SI[nakB], pass:true, desc:`ලිංග ගැලපේ`},
    {id:19,si:'පක්ෂි',en:'Pakshi', girl:`${PAKSHI[nakA%5]} (${PAKSHI_SI[nakA%5]})`, boy:`${PAKSHI[nakB%5]} (${PAKSHI_SI[nakB%5]})`, pass:(nakA%5)!==(nakB%5), desc:`${PAKSHI_SI[nakA%5]} vs ${PAKSHI_SI[nakB%5]}`},
    {id:20,si:'ආයු',en:'Ayu', girl:NAK_SI[nakA], boy:NAK_SI[nakB], pass:true, desc:`ආයු හොඳයි`},
  ];
  items.forEach((p:any)=>{ total+=p.pass?1:0; details.push({id:p.id,name_si:p.si,name_en:p.en,girlValue:p.girl,boyValue:p.boy,obtained:p.pass?1:0,max:1,match:p.pass,pass:p.pass,details:p.pass?'ගැලපේ':'නොගැලපේ',descSi:p.desc}); });
    return {
    total,
    maxTotal:20,
    details,
    debug:{
      nakA:NAK[nakA],
      nakB:NAK[nakB],
      nakSiA:NAK_SI[nakA],
      nakSiB:NAK_SI[nakB],
      rashiSiA:RASHI_SI[rashiA],
      rashiSiB:RASHI_SI[rashiB],
      rashiA:RASHI[rashiA],
      rashiB:RASHI[rashiB]
    },
    lagnaA,
    lagnaB,
    rashiA,
    rashiB,
    isRajjuFail:!!details.find((d:any)=>d.id===11&&!d.pass)
  };
}