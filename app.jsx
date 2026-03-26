const{useState,useMemo,useRef,useEffect,useCallback}=React;

/* ═══ CONFIG ═══ */
const CC={TW:{n:"台灣",f:"🇹🇼"},US:{n:"美國",f:"🇺🇸"},JP:{n:"日本",f:"🇯🇵"},KR:{n:"韓國",f:"🇰🇷"},TH:{n:"泰國",f:"🇹🇭"},CN:{n:"中國",f:"🇨🇳"}};
const FONTS=[{k:"Noto Sans TC",l:"思源黑體"},{k:"LXGW WenKai TC",l:"霞鶩文楷"},{k:"Ma Shan Zheng",l:"馬山正楷"},{k:"serif",l:"襯線體"},{k:"monospace",l:"等寬體"},{k:"Impact",l:"Impact"},{k:"Comic Sans MS",l:"Comic Sans"},{k:"cursive",l:"手寫體"}];
const STROKES=["none","#000","#fff","#ef4444","#3b82f6","#a855f7","#22c55e","#eab308"];
const BGS=[{k:"none",l:"無"},{k:"solid",l:"實色"},{k:"highlight",l:"螢光"},{k:"translucent",l:"半透明"}];
const FILTERS=[{k:"none",l:"原圖",f:""},{k:"gray",l:"黑白",f:"grayscale(1)"},{k:"sepia",l:"復古",f:"sepia(.8)"},{k:"sat",l:"飽和",f:"saturate(3)"},{k:"hue",l:"迷幻",f:"hue-rotate(90deg)"},{k:"inv",l:"反轉",f:"invert(1)"},{k:"con",l:"對比",f:"contrast(1.5)"}];
const STK=["🤡","💀","🔥","🥺","😭","💅","👀","✨","💯","❤️","💩","🎉","😱","🫠","👑","🐸","🤯","🦊"];
const WM="梗圖產生器";const PG=24;

function imgflipFmt(m){
  const b=m.box_count||2;const ln=[];for(let i=0;i<Math.min(b,4);i++)ln.push({text:i===0?"上方文字":i===1?"下方文字":`文字 ${i+1}`});
  return{id:`if_${m.id}`,c:"US",y:0,pop:Math.round((m.captions||0)/1000),title:m.name,src:"imgflip",tags:["imgflip"],em:"🌐",img:m.url,desc:`imgflip · ${(m.captions||0).toLocaleString()} 次使用`,iL:ln};
}

/* ═══ YT ═══ */
function loadYT(){if(window.YT)return Promise.resolve(window.YT);return new Promise(r=>{const s=document.createElement('script');s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);window.onYouTubeIframeAPIReady=()=>r(window.YT);});}
function YTP({vid,onTime,filter,ts}){const p=useRef(),c=useRef();useEffect(()=>{let pl,iv;if(!vid)return;loadYT().then(YT=>{if(!c.current)return;pl=new YT.Player(c.current,{videoId:vid,playerVars:{autoplay:1,rel:0,controls:1,modestbranding:1},events:{onReady:()=>{pl.playVideo();iv=setInterval(()=>{if(pl?.getCurrentTime)onTime(pl.getCurrentTime());},200);},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){if(!iv)iv=setInterval(()=>{if(pl?.getCurrentTime)onTime(pl.getCurrentTime());},200);}else{clearInterval(iv);iv=null;}}}});p.current=pl;});return()=>{clearInterval(iv);p.current?.destroy?.();};},[vid]);return <div style={{position:"absolute",inset:0,pointerEvents:"auto",filter,overflow:"hidden"}}><div style={{width:"100%",height:"100%",transform:ts,transformOrigin:"center"}}><div ref={c} style={{width:"100%",height:"100%"}}/></div></div>;}

/* ═══ TEXT WRAP ═══ */
function wrap(ctx,t,mw){const l=[];let c='';for(let i=0;i<t.length;i++){const ch=t[i];if(ch==='\n'){l.push(c);c='';continue;}const x=c+ch;if(ctx.measureText(x).width>mw&&i>0){l.push(c);c=ch;}else c=x;}l.push(c);return l;}

/* ═══ DRAW ═══ */
function draw(c,w,h,sc,m,md,lines,stk,cfg,ct,wm){
  if(!m)return;if(md==="vid"&&sc<=2){c.fillStyle="rgba(0,0,0,.05)";c.fillRect(0,0,w,h);}else if(sc<=2)c.clearRect(0,0,w,h);
  const fn=cfg?.font||"Noto Sans TC",co=cfg?.color||"#fff",bs=(cfg?.size||28)*sc,sk=cfg?.stroke||"none",bd=cfg?.bold!==false,bg=cfg?.bgStyle||"none",mw=w*.9;
  let al=lines||[],as=stk||[];
  if(md==="vid"){al=al.filter(l=>l.start==null||l.end==null||(ct>=l.start&&ct<=l.end));as=as.filter(s=>s.start==null||s.end==null||(ct>=s.start&&ct<=s.end));}
  c.font=`${bd?"bold ":""}${bs}px '${fn}',sans-serif`;c.textAlign="center";c.textBaseline="alphabetic";
  const lh=bs*1.35,sp=bs*.5;let tH=0;
  const bl=al.map(ln=>{const d=ln.x==null&&ln.y==null;const wb=ln.text?wrap(c,ln.text,mw):[];if(d&&wb.length)tH+=wb.length*lh+sp;return{ln,wb,d};});
  let cy=h/2-tH/2+lh;
  bl.forEach(({ln,wb,d})=>{if(!wb.length)return;const bx=ln.x!=null?ln.x*w:w/2;let by=ln.y!=null?ln.y*h:cy;
    wb.forEach(t=>{const tw=c.measureText(t).width;c.save();
      if(bg!=="none"){const px=8*sc,py=6*sc,rx=bx-tw/2-px,ry=by-bs*.85-py,rw=tw+px*2,rh=bs+py*2+4*sc;
        if(bg==="solid"){c.fillStyle=sk!=="none"?sk:"#000";c.fillRect(rx,ry,rw,rh);}
        else if(bg==="translucent"){c.fillStyle="rgba(0,0,0,.6)";c.beginPath();c.roundRect?.(rx,ry,rw,rh,4*sc);c.fill();}
        else if(bg==="highlight"){c.fillStyle=sk!=="none"?sk:"#eab308";c.fillRect(rx,by-bs*.3,rw,bs*.4);}}
      else{c.shadowColor="rgba(0,0,0,.8)";c.shadowBlur=8*sc;}
      if(sk&&sk!=="none"&&bg!=="solid"){c.strokeStyle=sk;c.lineWidth=Math.max(2*sc,bs/8);c.lineJoin="round";c.strokeText(t,bx,by);}
      c.fillStyle=co;c.fillText(t,bx,by);c.restore();by+=lh;});
    if(d)cy+=wb.length*lh+sp;});
  as.forEach(s=>{c.save();c.font=`${(s.size||40)*sc}px sans-serif`;c.textAlign="center";c.textBaseline="middle";c.fillText(s.emoji,s.x*w,s.y*h);c.restore();});
  if(wm){c.save();c.font=`${9*sc}px 'Noto Sans TC',sans-serif`;c.textAlign="right";c.textBaseline="bottom";c.fillStyle="rgba(255,255,255,.18)";c.fillText(WM,w-6*sc,h-4*sc);c.restore();}
}

function Cv({m,md,lines,stk,cfg,w=480,h=360,ct=0}){
  const r=useRef();useEffect(()=>{const cv=r.current;if(!cv||!m)return;const c=cv.getContext("2d");const d=devicePixelRatio||1;cv.width=w*d;cv.height=h*d;c.scale(d,d);draw(c,w,h,1,m,md,lines,stk,cfg,ct,true);},[m,md,lines,stk,w,h,cfg,ct]);
  return <canvas ref={r} style={{width:w,height:h,borderRadius:12,display:"block",background:"transparent",pointerEvents:"none"}}/>;
}

/* ═══ LINE ED ═══ */
function LnEd({md,lines,onChange}){
  return <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {lines.map((ln,i)=><div key={i} style={{background:"rgba(255,255,255,.02)",padding:10,borderRadius:10,border:"1px solid rgba(255,255,255,.04)"}}>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <span style={{fontSize:9,color:"rgba(255,255,255,.1)",width:14,textAlign:"center"}}>{i+1}</span>
        <input value={ln.text||""} placeholder="輸入文字..." onChange={e=>{const n=[...lines];n[i]={...ln,text:e.target.value};onChange(n);}} className="inp" style={{flex:1,fontSize:13}}/>
        {lines.length>1&&<button onClick={()=>onChange(lines.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:11,padding:2}}>✕</button>}
      </div>
      <div style={{display:"flex",gap:6,paddingLeft:19,marginTop:5,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:3,flex:1,minWidth:90}}><span style={{fontSize:8,color:"rgba(255,255,255,.12)"}}>◀▶</span><input type="range" min="0" max="1" step="0.01" value={ln.x??0.5} onChange={e=>{const n=[...lines];n[i]={...ln,x:+e.target.value};onChange(n);}} style={{flex:1}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:3,flex:1,minWidth:90}}><span style={{fontSize:8,color:"rgba(255,255,255,.12)"}}>▲▼</span><input type="range" min="0" max="1" step="0.01" value={ln.y??(0.15+i*.18)} onChange={e=>{const n=[...lines];n[i]={...ln,y:+e.target.value};onChange(n);}} style={{flex:1}}/></div>
      </div>
      {md==="vid"&&<div style={{display:"flex",gap:4,paddingLeft:19,marginTop:4,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:9,color:"#22d3ee"}}>⏱</span>
        <input type="number" min="0" step="0.5" value={ln.start||0} onChange={e=>{const n=[...lines];n[i]={...ln,start:+e.target.value};onChange(n);}} className="inp" style={{width:48,padding:3,fontSize:10}}/>
        <span style={{fontSize:9,color:"rgba(255,255,255,.1)"}}>→</span>
        <input type="number" min="0" step="0.5" value={ln.end||5} onChange={e=>{const n=[...lines];n[i]={...ln,end:+e.target.value};onChange(n);}} className="inp" style={{width:48,padding:3,fontSize:10}}/>
        <span style={{fontSize:9,color:"rgba(255,255,255,.1)"}}>秒</span>
      </div>}
    </div>)}
    <button onClick={()=>onChange([...lines,md==="vid"?{text:"",start:0,end:5,x:.5,y:.8}:{text:"",x:.5,y:.8}])} className="btn btn-g btn-s" style={{alignSelf:"flex-start",borderStyle:"dashed"}}>＋ 新增</button>
  </div>;
}

/* ═══ STK ED ═══ */
function StkEd({md,stk,onChange}){
  function add(e){onChange([...stk,{emoji:e,x:Math.random()*.6+.2,y:Math.random()*.6+.2,size:50,...(md==="vid"?{start:0,end:5}:{})}]);}
  return <div style={{display:"flex",flexDirection:"column",gap:6}}>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",padding:6,background:"rgba(0,0,0,.2)",borderRadius:10}}>
      {STK.map(s=><button key={s} onClick={()=>add(s)} style={{background:"none",border:"1px solid rgba(255,255,255,.04)",borderRadius:8,fontSize:18,cursor:"pointer",padding:"3px 5px",transition:"all .2s"}} onMouseOver={e=>{e.target.style.transform="scale(1.2)";e.target.style.background="rgba(255,255,255,.06)";}} onMouseOut={e=>{e.target.style.transform="";e.target.style.background="none";}}>{s}</button>)}
    </div>
    {stk.map((st,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:6,background:"rgba(255,255,255,.015)",borderRadius:8,border:"1px solid rgba(255,255,255,.04)",flexWrap:"wrap"}}>
      <span style={{fontSize:22}}>{st.emoji}</span>
      {[{l:"大",k:"size",mn:20,mx:150},{l:"X",k:"x",mn:0,mx:1,s:.01},{l:"Y",k:"y",mn:0,mx:1,s:.01}].map(c=><div key={c.k} style={{minWidth:60,flex:1}}><span style={{fontSize:8,color:"rgba(255,255,255,.12)"}}>{c.l}</span><input type="range" min={c.mn} max={c.mx} step={c.s||1} value={st[c.k]} onChange={e=>{const n=[...stk];n[i]={...st,[c.k]:+e.target.value};onChange(n);}} style={{width:"100%"}}/></div>)}
      <button onClick={()=>onChange(stk.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:11}}>✕</button>
    </div>)}
  </div>;
}

/* ═══════════ APP ═══════════ */
function App(){
  const[localDB,setLocal]=useState([]);const[apiDB,setApi]=useState([]);const[loading,setLd]=useState(true);const[apiLd,setAL]=useState(true);
  const[fC,sFC]=useState("ALL");const[q,sQ]=useState("");const[sort,setSort]=useState("hot");const[page,setPage]=useState(1);
  const[aId,sAId]=useState(null);const[tM,sTM]=useState("img");
  const[eT,sET]=useState({});const[tCfg,sTCfg]=useState({});const[mCfg,sMCfg]=useState({});
  const[brk,sBrk]=useState({});const[toast,sToast]=useState("");const[vt,sVt]=useState(0);
  const dR=useRef();const wR=useRef();const exR=useRef();const[cw,sCw]=useState(480);

  useEffect(()=>{
    const f=()=>{if(wR.current){sCw(Math.min(wR.current.offsetWidth>1080?wR.current.offsetWidth-320:wR.current.offsetWidth-32,580));}};
    f();window.addEventListener("resize",f);
    fetch('memes.json').then(r=>r.json()).then(d=>{setLocal(d);setLd(false);}).catch(()=>setLd(false));
    fetch('https://api.imgflip.com/get_memes').then(r=>r.json()).then(d=>{if(d.success&&d.data?.memes)setApi(d.data.memes.map(imgflipFmt));setAL(false);}).catch(()=>setAL(false));
    return()=>window.removeEventListener("resize",f);
  },[]);

  const DB=useMemo(()=>[...localDB,...apiDB],[localDB,apiDB]);
  const featured=useMemo(()=>localDB.find(m=>m.id==="c01")||localDB[0],[localDB]);

  const fl=useMemo(()=>{
    let r=DB.filter(m=>{
      if(brk[m.id])return false;if(fC!=="ALL"&&m.c!==fC)return false;
      if(q){const s=q.toLowerCase();return m.title.toLowerCase().includes(s)||(m.src||"").toLowerCase().includes(s)||(m.tags||[]).some(t=>t.includes(s))||(m.desc||"").toLowerCase().includes(s);}
      return true;
    });
    if(sort==="hot")r.sort((a,b)=>(b.pop||0)-(a.pop||0));
    else if(sort==="new")r.sort((a,b)=>(b.y||0)-(a.y||0));
    else r.sort((a,b)=>(a.y||9999)-(b.y||9999));
    return r;
  },[DB,fC,q,brk,sort]);

  const paged=fl.slice(0,page*PG);const act=DB.find(m=>m.id===aId);
  const fmt=a=>(a||[]).map(i=>typeof i==='string'?{text:i}:i);

  function open(id){sAId(id);const m=DB.find(x=>x.id===id);if(m&&!eT[id])sET(p=>({...p,[id]:{img:fmt(m.iL||[]),vid:fmt(m.vL||[]),img_s:[],vid_s:[]}}));sTM(m?.t==="vid"?"vid":"img");sVt(0);setTimeout(()=>dR.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);}
  function setLn(l){if(!aId)return;sET(p=>({...p,[aId]:{...p[aId],[tM]:l}}));}
  function setSt(s){if(!aId)return;sET(p=>({...p,[aId]:{...p[aId],[`${tM}_s`]:s}}));}
  function rstTx(){if(!act)return;sET(p=>({...p,[aId]:{img:fmt(act.iL).map((l,i)=>({...l,x:.5,y:.15+i*.18})),vid:fmt(act.vL).map((l,i)=>({...l,x:.5,y:.15+i*.18})),img_s:[],vid_s:[]}}));}
  function rstStyle(){sTCfg(p=>{const n={...p};delete n[aId];return n;});sMCfg(p=>{const n={...p};delete n[aId];return n;});}

  const cL=(eT[aId]||{})[tM]||[];const cS=(eT[aId]||{})[`${tM}_s`]||[];
  const cc=tCfg[aId]||{font:"Noto Sans TC",size:28,color:"#fff",stroke:"#000",bgStyle:"none",bold:true};
  const mc=mCfg[aId]||{filter:"none",imgX:0,imgY:0,imgScale:1};
  const ch=Math.round(cw*.5625);

  function showToast(m){sToast(m);setTimeout(()=>sToast(""),2500);}
  function exportPNG(){
    if(!act)return;showToast("💾 合成中...");
    const io=new Image();io.crossOrigin="anonymous";io.src=act.img;
    io.onload=()=>{const rw=io.naturalWidth||io.width,rh=io.naturalHeight||io.height;
      const cv=document.createElement("canvas");cv.width=rw;cv.height=rh;const ctx=cv.getContext("2d");
      const fo=FILTERS.find(f=>f.k===mc.filter);if(fo?.f)ctx.filter=fo.f;
      ctx.save();ctx.translate(rw/2,rh/2);ctx.translate(mc.imgX*rw,mc.imgY*rh);ctx.scale(mc.imgScale,mc.imgScale);ctx.translate(-rw/2,-rh/2);ctx.drawImage(io,0,0,rw,rh);ctx.restore();ctx.filter="none";
      draw(ctx,rw,rh,rw/cw,act,"img",cL,cS,cc,0,true);
      const a=document.createElement("a");a.download=`meme-${act.title}.png`;a.href=cv.toDataURL("image/png");a.click();showToast("✅ HD匯出成功");};
    io.onerror=()=>showToast("❌ 跨域限制");
  }

  const topM=useMemo(()=>[...DB].sort((a,b)=>(b.pop||0)-(a.pop||0)).slice(0,8),[DB]);
  const tags=useMemo(()=>{const m=new Map();DB.forEach(me=>(me.tags||[]).forEach(t=>{m.set(t,(m.get(t)||0)+1);}));return[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,18).map(e=>e[0]);},[DB]);

  if(loading&&apiLd)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flexDirection:"column",gap:14}}><div className="loader"/><span style={{color:"rgba(255,255,255,.35)",fontSize:13}}>載入中...</span></div>;

  return <div ref={wR} style={{position:"relative",zIndex:1}}>
    {/* NAV */}
    <nav className="nav"><div className="nav-inner">
      <div className="nav-logo" onClick={()=>{sAId(null);setPage(1);window.scrollTo({top:0,behavior:"smooth"});}}>
        <div className="ic">✏️</div>
        <span style={{background:"linear-gradient(135deg,#fff,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>梗圖產生器</span>
      </div>
      <span style={{marginLeft:"auto",fontSize:10,color:"rgba(255,255,255,.2)"}}>📦 {DB.length} 模板 {apiLd&&<span style={{animation:"pulse 1s infinite"}}>⟳</span>}</span>
    </div></nav>

    {/* HERO */}
    <section className="hero fu">
      <h1>全球迷因，一鍵改圖</h1>
      <p>整合 imgflip 百萬模板庫 + 亞洲在地精選迷因<br/>自由編輯文字、貼圖、濾鏡，HD 高畫質匯出</p>
      <div className="hero-stats">
        <div className="hero-stat"><div className="num">{DB.length}</div><div className="lab">模板</div></div>
        <div className="hero-stat"><div className="num">{localDB.length}</div><div className="lab">亞洲精選</div></div>
        <div className="hero-stat"><div className="num">{apiDB.length}</div><div className="lab">imgflip</div></div>
        <div className="hero-stat"><div className="num">{Object.keys(CC).length}</div><div className="lab">國家</div></div>
      </div>
    </section>

    <div style={{maxWidth:1360,margin:"0 auto",padding:"0 20px 48px"}}>

      {/* FEATURED 刀盾 */}
      {featured&&!aId&&<div className="featured fu" onClick={()=>open(featured.id)} style={{marginBottom:24,animationDelay:".15s"}}>
        <img className="f-img" src={featured.img} alt={featured.title}/>
        <div className="f-ov"/>
        <div className="f-info">
          <div className="f-tag">🔥 2026最夯迷因</div>
          <h2 style={{fontSize:"clamp(22px,3vw,36px)",fontWeight:900,lineHeight:1.2,marginBottom:8}}>{featured.em} {featured.title}</h2>
          <p style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.5,marginBottom:14}}>{featured.desc}</p>
          <button className="btn btn-p" style={{width:"fit-content"}}>✏️ 立即編輯</button>
        </div>
      </div>}

      {/* AD */}
      <div className="ad fi" style={{marginBottom:16}}><span>📢 廣告版位 (728×90)</span></div>

      {/* SEARCH */}
      <div className="search-wrap fu" style={{marginBottom:16,animationDelay:".2s"}}>
        <span className="ico">🔍</span>
        <input value={q} onChange={e=>{sQ(e.target.value);setPage(1);}} placeholder="搜尋迷因名稱、標籤..."/>
      </div>

      {/* FILTERS */}
      <div className="fu" style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,animationDelay:".25s"}}>
        {[{k:"hot",l:"🔥 熱門"},{k:"new",l:"🆕 最新"},{k:"classic",l:"👑 經典"}].map(s=><button key={s.k} onClick={()=>{setSort(s.k);setPage(1);}} className={`pill ${sort===s.k?"on":""}`}>{s.l}</button>)}
        <span style={{width:1,height:24,background:"rgba(255,255,255,.06)",margin:"0 4px",alignSelf:"center"}}/>
        <button onClick={()=>{sFC("ALL");setPage(1);}} className={`pill ${fC==="ALL"?"on":""}`}>全部</button>
        {Object.entries(CC).map(([k,v])=><button key={k} onClick={()=>{sFC(k);setPage(1);}} className={`pill ${fC===k?"on":""}`}>{v.f} {v.n}</button>)}
        <span style={{marginLeft:"auto",fontSize:10,color:"rgba(255,255,255,.15)",alignSelf:"center"}}>{fl.length} 筆</span>
      </div>

      <div className="layout">
        <div>
          {/* GRID */}
          <div className="grid fu" style={{animationDelay:".3s"}}>
            {paged.map((m,idx)=><React.Fragment key={m.id}>
              <div onClick={()=>open(m.id)} className="card" style={{borderColor:aId===m.id?"rgba(168,85,247,.2)":""}}>
                <img src={m.img} alt={m.title} onError={()=>sBrk(p=>({...p,[m.id]:true}))} loading="lazy"/>
                <div className="ov"/>
                {m.t==="vid"&&<div className="bdg" style={{background:"rgba(34,211,238,.1)",color:"#22d3ee",border:"1px solid rgba(34,211,238,.12)"}}>🎬</div>}
                {m.pop>=95&&<div className="hot-badge">🔥 HOT</div>}
                <div className="inf">
                  <span className="tt" style={{fontSize:13,fontWeight:800,color:"#fff",textShadow:"0 1px 10px rgba(0,0,0,.9)",lineHeight:1.2,display:"block"}}>{m.em||"🌐"} {m.title}</span>
                  <div style={{display:"flex",gap:8,marginTop:4,alignItems:"center"}}>
                    {m.c&&CC[m.c]&&<span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{CC[m.c].f}</span>}
                    {m.y>0&&<span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{m.y}</span>}
                    <span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>👍 {m.pop||0}</span>
                  </div>
                </div>
              </div>
              {(idx+1)%8===0&&idx<paged.length-1&&<div className="ad" style={{gridColumn:"1/-1"}}><span>📢 原生廣告</span></div>}
            </React.Fragment>)}
          </div>
          {fl.length===0&&<div style={{textAlign:"center",padding:48,color:"rgba(255,255,255,.15)"}}>😢 找不到迷因</div>}
          {page*PG<fl.length&&<div style={{textAlign:"center",marginTop:22}}><button onClick={()=>setPage(p=>p+1)} className="btn btn-g" style={{padding:"12px 36px",fontSize:13,borderRadius:50}}>載入更多 ({fl.length-page*PG} 筆)</button></div>}
        </div>

        {/* SIDEBAR */}
        <div className="side">
          <div className="sec">
            <p style={{fontSize:12,fontWeight:800,marginBottom:10,display:"flex",alignItems:"center",gap:4}}>🏆 人氣排行</p>
            {topM.map((m,i)=><div key={m.id} onClick={()=>open(m.id)} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",alignItems:"center",transition:"all .2s"}} onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"} onMouseOut={e=>e.currentTarget.style.background=""}>
              <span style={{fontSize:14,fontWeight:900,color:i<3?"#a855f7":"rgba(255,255,255,.12)",width:18,textAlign:"center"}}>{i+1}</span>
              <img src={m.img} style={{width:38,height:28,borderRadius:6,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
              <p style={{flex:1,fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</p>
            </div>)}
          </div>
          <div className="sec">
            <p style={{fontSize:12,fontWeight:800,marginBottom:8}}>🏷️ 熱門標籤</p>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{tags.map(t=><button key={t} onClick={()=>{sQ(t);setPage(1);}} className="pill" style={{fontSize:9,padding:"3px 10px"}}>{t}</button>)}</div>
          </div>
          <div className="ad"><span>📢 側邊廣告 (300×250)</span></div>
        </div>
      </div>

      {/* ═══ EDITOR ═══ */}
      {act&&<div ref={dR} className="fu glow" style={{background:"rgba(12,12,20,.9)",border:"1px solid rgba(168,85,247,.1)",borderRadius:20,padding:"22px 20px",marginTop:28,backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div>
            <h2 style={{fontSize:24,fontWeight:900,display:"flex",alignItems:"center",gap:8}}>{act.em||"🌐"} {act.title}</h2>
            <p style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:3}}>來源：{act.src} {act.y>0?`· ${act.y}`:""} {(act.tags||[]).length?`· ${act.tags.join(', ')}`:""}</p>
            {act.desc&&<p style={{fontSize:10,color:"rgba(255,255,255,.2)",marginTop:1}}>{act.desc}</p>}
          </div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);showToast("🔗 已複製!");}} className="btn btn-g btn-s">🔗</button>
            <button onClick={()=>sAId(null)} className="btn btn-g btn-s">✕ 關閉</button>
          </div>
        </div>

        {act.vid&&<div style={{display:"flex",gap:2,background:"rgba(0,0,0,.3)",borderRadius:12,padding:3,marginBottom:16,border:"1px solid rgba(255,255,255,.04)"}}>
          {[{k:"img",l:"🖼️ 靜態編輯"},{k:"vid",l:"🎬 影片編輯"}].map(o=>{const dis=o.k==="vid"&&!act.vid;return <button key={o.k} disabled={dis} onClick={()=>{if(!dis)sTM(o.k);}} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",cursor:dis?"not-allowed":"pointer",background:tM===o.k?"linear-gradient(135deg,#a855f7,#6366f1)":"transparent",color:tM===o.k?"#fff":"rgba(255,255,255,.35)",fontSize:12,fontWeight:tM===o.k?800:400,opacity:dis?0.3:1,transition:"all .25s"}}>{o.l}</button>;})}
        </div>}

        <div className="esplit">
          <div>
            <div style={{position:"relative",background:"#000",borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,.04)",boxShadow:"0 12px 40px rgba(0,0,0,.5)"}}>
              {tM==="vid"&&act.vid?
                <div style={{position:"relative",width:"100%",paddingBottom:"56.25%"}}>
                  <YTP vid={act.vid} onTime={sVt} filter={FILTERS.find(f=>f.k===mc.filter)?.f||""} ts={`translate(${mc.imgX*100}%,${mc.imgY*100}%) scale(${mc.imgScale})`}/>
                  <div style={{position:"absolute",inset:0,pointerEvents:"none"}}><Cv m={act} md={tM} lines={cL} stk={cS} cfg={cc} w={cw} h={ch} ct={vt}/></div>
                </div>:
                <div ref={exR} style={{position:"relative"}}>
                  <div style={{overflow:"hidden",width:"100%"}}><img src={act.img} alt={act.title} style={{width:"100%",display:"block",objectFit:"contain",filter:FILTERS.find(f=>f.k===mc.filter)?.f||"",transform:`translate(${mc.imgX*100}%,${mc.imgY*100}%) scale(${mc.imgScale})`}} crossOrigin="anonymous"/></div>
                  <div style={{position:"absolute",inset:0,pointerEvents:"none"}}><Cv m={act} md="img" lines={cL} stk={cS} cfg={cc} w={cw} h={ch}/></div>
                  <span style={{position:"absolute",bottom:4,right:6,fontSize:8,color:"rgba(255,255,255,.12)",zIndex:10}}>{WM}</span>
                </div>}
            </div>
            <div className="sec" style={{marginTop:12}}>
              <p style={{fontSize:11,fontWeight:700,marginBottom:6}}>🖼️ 素材微調</p>
              {[{l:"放大",k:"imgScale",mn:.5,mx:3,s:.1},{l:"左右",k:"imgX",mn:-1,mx:1,s:.01},{l:"上下",k:"imgY",mn:-1,mx:1,s:.01}].map(s=><div key={s.k} style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:9,color:"rgba(255,255,255,.15)",width:24}}>{s.l}</span>
                <input type="range" min={s.mn} max={s.mx} step={s.s} value={mc[s.k]} onChange={e=>sMCfg(p=>({...p,[aId]:{...mc,[s.k]:+e.target.value}}))} style={{flex:1}}/>
                <span style={{fontSize:9,color:"rgba(255,255,255,.15)",width:30,textAlign:"right"}}>{mc[s.k].toFixed(s.s<.1?2:1)}</span>
              </div>)}
            </div>
            {tM==="img"&&<div style={{marginTop:12,display:"flex",gap:10,justifyContent:"center"}}><button onClick={exportPNG} className="btn btn-p" style={{padding:"12px 28px",fontSize:14,borderRadius:14}}>💎 匯出 HD PNG</button></div>}
            <div className="sec" style={{marginTop:12}}>
              <p style={{fontSize:11,fontWeight:700,marginBottom:6}}>🌟 濾鏡</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{FILTERS.map(f=><button key={f.k} onClick={()=>sMCfg(p=>({...p,[aId]:{...mc,filter:f.k}}))} className={`pill ${mc.filter===f.k?"on":""}`} style={{fontSize:9,padding:"4px 10px"}}>{f.l}</button>)}</div>
            </div>
            <div className="ad" style={{marginTop:12}}><span>📢 編輯器廣告</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="sec">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p style={{fontSize:12,fontWeight:700}}>✏️ 文字圖層</p><button onClick={rstTx} className="btn btn-g btn-s">↺</button></div>
              <LnEd md={tM} lines={cL} onChange={setLn}/>
            </div>
            <div className="sec">
              <p style={{fontSize:12,fontWeight:700,marginBottom:6}}>😂 貼紙</p>
              <StkEd md={tM} stk={cS} onChange={setSt}/>
            </div>
            <div className="sec">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p style={{fontSize:12,fontWeight:700}}>🎨 文字樣式</p><button onClick={rstStyle} className="btn btn-g btn-s">↺</button></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{fontSize:9,color:"rgba(255,255,255,.15)",display:"block",marginBottom:2}}>字型</label><select value={cc.font} onChange={e=>sTCfg(p=>({...p,[aId]:{...cc,font:e.target.value}}))} className="inp" style={{fontSize:10,padding:7}}>{FONTS.map(f=><option key={f.k} value={f.k}>{f.l}</option>)}</select></div>
                <div><label style={{fontSize:9,color:"rgba(255,255,255,.15)",display:"block",marginBottom:2}}>大小 ({cc.size}px)</label><input type="range" min="14" max="80" value={cc.size} onChange={e=>sTCfg(p=>({...p,[aId]:{...cc,size:+e.target.value}}))} style={{width:"100%",marginTop:8}}/></div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{fontSize:9,color:"rgba(255,255,255,.15)",display:"block",marginBottom:3}}>顏色</label>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.15)"}}>字</span>
                    <input type="color" value={cc.color} onChange={e=>sTCfg(p=>({...p,[aId]:{...cc,color:e.target.value}}))} style={{width:22,height:22,border:"none",background:"none",cursor:"pointer",padding:0}}/>
                    <span style={{color:"rgba(255,255,255,.06)"}}>|</span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.15)"}}>框</span>
                    <div style={{display:"flex",gap:3}}>{STROKES.map(sc=><div key={sc} onClick={()=>sTCfg(p=>({...p,[aId]:{...cc,stroke:sc}}))} style={{width:16,height:16,borderRadius:"50%",background:sc==="none"?"#222":sc,border:cc.stroke===sc?"2px solid #a855f7":"1px solid rgba(255,255,255,.06)",cursor:"pointer",transition:"all .15s"}}/>)}</div>
                  </div>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{fontSize:9,color:"rgba(255,255,255,.15)",display:"block",marginBottom:3}}>底板</label>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{BGS.map(bg=><button key={bg.k} onClick={()=>sTCfg(p=>({...p,[aId]:{...cc,bgStyle:bg.k}}))} className={`pill ${cc.bgStyle===bg.k?"on":""}`} style={{fontSize:9,padding:"4px 10px"}}>{bg.l}</button>)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}

      <footer style={{textAlign:"center",padding:"28px 0 0",color:"rgba(255,255,255,.1)",fontSize:10,borderTop:"1px solid rgba(255,255,255,.04)",marginTop:36}}>
        <p>梗圖產生器 · {localDB.length} 亞洲精選 + {apiDB.length} imgflip = {DB.length} 模板</p>
        <p style={{marginTop:3}}>資料來源：imgflip API · 人工精選亞洲迷因</p>
      </footer>
    </div>
    {toast&&<div className="toast">{toast}</div>}
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
