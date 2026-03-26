const { useState, useMemo, useRef, useEffect, useCallback } = React;

/* ═══ COUNTRY CONFIG ═══ */
const CC = {
  TW:{n:"台灣",f:"🇹🇼",co:"#F04438"}, US:{n:"美國",f:"🇺🇸",co:"#528BFF"},
  JP:{n:"日本",f:"🇯🇵",co:"#EE446D"}, KR:{n:"韓國",f:"🇰🇷",co:"#7C5CFC"},
  TH:{n:"泰國",f:"🇹🇭",co:"#EAAA08"}, CN:{n:"中國",f:"🇨🇳",co:"#E04040"},
  GL:{n:"全球",f:"🌍",co:"#12B76A"},
};

/* ═══ FONT & STYLE OPTIONS ═══ */
const FONTS = [
  {k:"Noto Sans TC",l:"思源黑體"},{k:"serif",l:"襯線體"},{k:"monospace",l:"等寬體"},
  {k:"cursive",l:"手寫體"},{k:"Impact",l:"Impact"},{k:"Comic Sans MS",l:"Comic Sans"},
];
const COLORS = ["#ffffff","#000000","#F04438","#528BFF","#EAAA08","#12B76A","#a855f7","#EE446D","#FF6B35","#00D4FF"];
const STROKE_COLORS = ["none","#000000","#ffffff","#F04438","#528BFF","#a855f7"];
const BG_STYLES = [
  {k:"none", l:"無背景"}, {k:"solid", l:"實色底"}, {k:"highlight", l:"螢光筆"}, {k:"translucent", l:"半透明黑"}
];
const FILTERS = [
  {k:"none", l:"原圖", f:""}, {k:"grayscale", l:"絕望黑白", f:"grayscale(100%)"}, 
  {k:"sepia", l:"復古懷舊", f:"sepia(80%)"}, {k:"saturate", l:"超飽和", f:"saturate(300%)"},
  {k:"hue-rotate", l:"迷幻色彩", f:"hue-rotate(90deg)"}, {k:"invert", l:"反轉世界", f:"invert(100%)"}
];
const STICKERS = ["🤡", "💀", "🔥", "🥺", "😭", "💅", "🤡🔪", "👀", "✨", "💯"];

/* ═══ YOUTUBE PLAYER HOOK ═══ */
function loadYTAPI() {
  if (window.YT) return Promise.resolve(window.YT);
  return new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
}

function YouTubePlayer({ vid, onTimeUpdate, filter }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let player;
    let interval;
    if (!vid) return;
    
    loadYTAPI().then((YT) => {
      if (!containerRef.current) return;
      player = new YT.Player(containerRef.current, {
        videoId: vid,
        playerVars: { autoplay: 1, rel: 0, controls: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            player.playVideo();
            interval = setInterval(() => {
              if (player && player.getCurrentTime) onTimeUpdate(player.getCurrentTime());
            }, 200);
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              if (!interval) {
                interval = setInterval(() => {
                  if (player && player.getCurrentTime) onTimeUpdate(player.getCurrentTime());
                }, 200);
              }
            } else {
              if (interval) clearInterval(interval);
              interval = null;
            }
          }
        }
      });
      playerRef.current = player;
    });

    return () => {
      if (interval) clearInterval(interval);
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
    };
  }, [vid]);

  return <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"auto",filter}}>
    <div ref={containerRef} style={{width:"100%",height:"100%"}} />
  </div>;
}

/* ═══ TEXT CANVAS PREVIEW (enhanced with styles & stickers) ═══ */
function TextCanvas({m, mode, lines, stickers, textConfig, mediaConfig, w=380, h=240, currentTime=0}){
  const ref = useRef(null);
  const co = CC[m?.c]?.co || "#888";

  useEffect(() => {
    const cv = ref.current; if (!cv || !m) return;
    const c = cv.getContext("2d"); const d = window.devicePixelRatio || 1;
    cv.width = w*d; cv.height = h*d; c.scale(d,d);
    
    // Background hint for editing text layer
    if (mode === "vid") {
      c.fillStyle = "rgba(0,0,0,0.1)"; c.fillRect(0,0,w,h);
      c.strokeStyle = "rgba(255,255,255,.05)";
      for(let x=0; x<w; x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
      for(let y=0; y<h; y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    } else {
      c.clearRect(0,0,w,h);
    }
    
    // Configs
    const cfg = textConfig || {};
    const font = cfg.font || "Noto Sans TC"; const color = cfg.color || "#ffffff";
    const size = cfg.size || 24; const stroke = cfg.stroke || "none"; const bold = cfg.bold !== false;
    const bgStyle = cfg.bgStyle || "none";
    
    // Filter active lines based on time if in vid mode
    let activeLines = lines;
    let activeStickers = stickers || [];
    if (mode === "vid") {
       activeLines = lines.filter(ln => {
         if (ln.start === undefined || ln.end === undefined) return true; 
         return currentTime >= ln.start && currentTime <= ln.end;
       });
       activeStickers = activeStickers.filter(st => {
         if (st.start === undefined || st.end === undefined) return true;
         return currentTime >= st.start && currentTime <= st.end;
       });
    }

    // Draw lines
    const sY = h/2 - ((activeLines.length-1) * (size+14)) / 2;

    activeLines.forEach((ln, i) => {
      const y = sY + i * (size+14);
      const textToDraw = ln.text || "";
      if (!textToDraw) return;
      
      c.save(); 
      c.font = `${bold?"bold":""} ${size}px '${font}',sans-serif`;
      const textWidth = c.measureText(textToDraw).width;
      
      // Draw background block if specified
      if (bgStyle !== "none") {
        const bgPaddingX = 8; const bgPaddingY = 6;
        const rectX = w/2 - textWidth/2 - bgPaddingX;
        const rectY = y - size*0.8 - bgPaddingY;
        const rectW = textWidth + bgPaddingX*2;
        const rectH = size + bgPaddingY*2 + 4;
        
        if (bgStyle === "solid") {
          c.fillStyle = stroke !== "none" ? stroke : "#000"; c.fillRect(rectX, rectY, rectW, rectH);
        } else if (bgStyle === "translucent") {
          c.fillStyle = "rgba(0,0,0,0.6)"; c.fillRect(rectX, rectY, rectW, rectH);
        } else if (bgStyle === "highlight") {
          c.fillStyle = stroke !== "none" ? stroke : "#EAAA08"; c.fillRect(rectX, rectY+rectH*0.6, rectW, rectH*0.4);
        }
      } else {
        c.shadowColor = "rgba(0,0,0,.8)"; c.shadowBlur = 8;
      }
      
      // Draw Stroke
      if(stroke && stroke !== "none" && bgStyle !== "solid") {
        c.strokeStyle = stroke; c.lineWidth = Math.max(2, size/8); c.lineJoin = "round"; c.strokeText(textToDraw, w/2, y);
      }
      
      // Draw Text
      c.fillStyle = color; c.fillText(textToDraw, w/2, y);
      c.restore();
    });

    // Draw stickers
    activeStickers.forEach(st => {
       c.save();
       c.font = `${st.size||40}px sans-serif`;
       c.textAlign = "center"; c.textBaseline = "middle";
       c.fillText(st.emoji, st.x * w, st.y * h);
       c.restore();
    });

  }, [m, mode, lines, stickers, w, h, co, textConfig, currentTime]);

  return <canvas ref={ref} style={{width:w, height:h, borderRadius:10, display:"block", background:"transparent", pointerEvents:"none"}}/>;
}

/* ═══ TIME-AWARE LINE EDITOR ═══ */
function LineEditor({mode, lines, onChange, co}){
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {lines.map((ln, i) => (
        <div key={i} style={{background:"rgba(255,255,255,0.02)", padding:8, borderRadius:8, border:`1px solid ${co}15`}}>
          <div style={{display:"flex", alignItems:"center", gap:6, width:"100%"}}>
            <span style={{fontSize:9, color:"rgba(255,255,255,.2)", width:16, textAlign:"center", background:"rgba(255,255,255,0.05)", borderRadius:4}}>{i+1}</span>
            <input 
              value={ln.text||""} placeholder="輸入迷因文字..."
              onChange={e => { const n=[...lines]; n[i]={...ln, text:e.target.value}; onChange(n); }} 
              className="input-field" style={{flex:1, fontSize:13, padding:"6px 10px"}}
            />
            {lines.length>1 && (
              <button 
                onClick={()=>onChange(lines.filter((_,j)=>j!==i))} 
                style={{background:"none",border:"none",color:"rgba(255,255,255,.2)",cursor:"pointer",fontSize:13,padding:"4px"}}
                onMouseOver={e=>e.target.style.color="#ef4444"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,.2)"}
              >✕</button>
            )}
          </div>
          {mode === "vid" && (
            <div style={{display:"flex", alignItems:"center", gap:6, paddingLeft:22, width:"100%", marginTop:6}}>
              <span style={{fontSize:10, color:"#7DD3FC", fontWeight:600}}>⏱️ 顯示區段</span>
              <input type="number" min="0" step="0.5" value={ln.start||0} onChange={e=>{const n=[...lines]; n[i]={...ln, start:parseFloat(e.target.value)}; onChange(n);}} className="input-field" style={{width:55, padding:"4px", fontSize:11}}/>
              <span style={{fontSize:10, color:"rgba(255,255,255,.3)"}}>秒至</span>
              <input type="number" min="0" step="0.5" value={ln.end||5} onChange={e=>{const n=[...lines]; n[i]={...ln, end:parseFloat(e.target.value)}; onChange(n);}} className="input-field" style={{width:55, padding:"4px", fontSize:11}}/>
              <span style={{fontSize:10, color:"rgba(255,255,255,.3)"}}>秒</span>
            </div>
          )}
        </div>
      ))}
      <button onClick={()=>onChange([...lines, mode==="vid"?{text:"新文字", start:0, end:5}:{text:"新文字"}])} className="btn btn-ghost" style={{alignSelf:"flex-start", fontSize:11, padding:"6px 14px", borderStyle:"dashed", borderColor:`${co}33`, color:`${co}bb`}}>＋ 新增一行字</button>
    </div>
  );
}

/* ═══ STICKER EDITOR ═══ */
function StickerEditor({mode, stickers, onChange, co}){
  function addSticker(emoji){
    onChange([...stickers, {
      emoji, x: Math.random()*0.6+0.2, y: Math.random()*0.6+0.2, size: 50, 
      ...(mode==="vid"?{start:0, end:5}:{})
    }]);
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:8, padding:8, background:"rgba(0,0,0,.2)", borderRadius:8}}>
        {STICKERS.map(s => <button key={s} onClick={()=>addSticker(s)} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,fontSize:20,cursor:"pointer",padding:4}} onMouseOver={e=>e.target.style.background="rgba(255,255,255,.1)"} onMouseOut={e=>e.target.style.background="none"}>{s}</button>)}
      </div>
      {stickers.map((st, i) => (
        <div key={i} style={{background:"rgba(255,255,255,0.02)", padding:8, borderRadius:8, border:`1px solid ${co}15`, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
          <span style={{fontSize:24}}>{st.emoji}</span>
          <div style={{flex:1, display:"flex", gap:8, flexWrap:"wrap"}}>
            <div><span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>大小</span><input type="range" min="20" max="150" value={st.size} onChange={e=>{const n=[...stickers]; n[i]={...st, size:Number(e.target.value)}; onChange(n);}} style={{width:60}}/></div>
            <div><span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>X位置</span><input type="range" min="0" max="1" step="0.05" value={st.x} onChange={e=>{const n=[...stickers]; n[i]={...st, x:Number(e.target.value)}; onChange(n);}} style={{width:60}}/></div>
            <div><span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>Y位置</span><input type="range" min="0" max="1" step="0.05" value={st.y} onChange={e=>{const n=[...stickers]; n[i]={...st, y:Number(e.target.value)}; onChange(n);}} style={{width:60}}/></div>
            {mode === "vid" && (
              <div style={{width:"100%", display:"flex", gap:4, alignItems:"center", marginTop:4}}>
                <span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>顯示時間</span>
                <input type="number" step="0.5" value={st.start} onChange={e=>{const n=[...stickers]; n[i]={...st, start:Number(e.target.value)}; onChange(n);}} className="input-field" style={{width:50, padding:2, fontSize:10}}/> ~ 
                <input type="number" step="0.5" value={st.end} onChange={e=>{const n=[...stickers]; n[i]={...st, end:Number(e.target.value)}; onChange(n);}} className="input-field" style={{width:50, padding:2, fontSize:10}}/>
              </div>
            )}
          </div>
          <button onClick={()=>onChange(stickers.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer"}}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════ MAIN APP ═══════════════ */
function App(){
  const [DB, setDB] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [fC,sFC]=useState("ALL"); const [fY,sFY]=useState("ALL"); const [q,sQ]=useState("");
  const [aId,sAId]=useState(null); 
  const [tM,sTM]=useState("img"); 
  const [eT,sET]=useState({}); // Contains {img/vid: lines, img_s/vid_s: stickers}
  const [tCfg,sTCfg]=useState({});
  const [mCfg,sMCfg]=useState({}); // Media config like filters
  const [toast,sToast]=useState("");
  const [videoTime, setVideoTime] = useState(0);

  const dR=useRef(null); const [cw,sCw]=useState(380); const wR=useRef(null);
  const exportRef=useRef(null);

  useEffect(()=>{
    const f=()=>{if(wR.current)sCw(Math.min(wR.current.offsetWidth-40,400));};
    f(); window.addEventListener("resize",f);
    fetch('memes.json').then(res=>res.json()).then(data=>{setDB(data);setLoading(false);}).catch(err=>{console.error(err);setLoading(false);});
    return ()=>window.removeEventListener("resize",f);
  },[]);

  const fl=useMemo(()=>DB.filter(m=>{
    if(fC!=="ALL"&&m.c!==fC)return false;
    if(fY!=="ALL"){const[a,b]=fY.split("-").map(Number);if(m.y<a||m.y>b)return false;}
    if(q){const s=q.toLowerCase();return m.title.toLowerCase().includes(s)||m.src.toLowerCase().includes(s)||m.tags.some(t=>t.includes(s));}
    return true;
  }).sort((a,b)=>b.y-a.y),[DB, fC, fY, q]);

  const act=DB.find(m=>m.id===aId);

  function open(id){
    sAId(id); 
    const m = DB.find(x=>x.id===id); 
    if(m && !eT[id]) {
      const fmt = (arr) => arr.map(item => typeof item === 'string' ? {text: item} : item);
      sET(p=>({...p, [id]:{img:fmt(m.iL||[]), vid:fmt(m.vL||[]), img_s:[], vid_s:[]}}));
    }
    sTM(m?.t === "vid" ? "vid" : "img");
    setVideoTime(0);
    setTimeout(()=>dR.current?.scrollIntoView({behavior:"smooth",block:"nearest"}), 150);
  }

  function setLn(l){if(!aId)return;sET(p=>({...p,[aId]:{...p[aId],[tM]:l}}));}
  function setSt(s){if(!aId)return;sET(p=>({...p,[aId]:{...p[aId],[`${tM}_s`]:s}}));}
  function rstTx(){
    if(!act)return;
    const fmt = (arr) => arr.map(item => typeof item === 'string' ? {text: item} : item);
    sET(p=>({...p,[aId]:{img:fmt(act.iL),vid:fmt(act.vL),img_s:[],vid_s:[]}}));
  }
  function rstStyle(){if(!aId)return;sTCfg(p=>{const n={...p};delete n[aId];return n;});sMCfg(p=>{const n={...p};delete n[aId];return n;});}
  
  const cL = (eT[aId]||{})[tM] || [];
  const cS = (eT[aId]||{})[`${tM}_s`] || [];
  const curCfg = tCfg[aId] || {font:"Noto Sans TC", size:24, color:"#ffffff", stroke:"#000000", bgStyle:"none", bold:true};
  const curMCfg = mCfg[aId] || {filter:"none"};

  function showToast(msg){sToast(msg);setTimeout(()=>sToast(""),2500);}

  // Export overlay logic for Image Export
  function exportPNG(){
    const baseImg = exportRef.current?.querySelector("img");
    if(!baseImg || !act) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Set actual image size
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.src = act.img;
    imgObj.onload = () => {
      canvas.width = imgObj.width;
      canvas.height = imgObj.height;
      // Apply filter
      const filterObj = FILTERS.find(f=>f.k===curMCfg.filter);
      if(filterObj && filterObj.f) ctx.filter = filterObj.f;
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
      
      // We have an invisible TextCanvas we can draw over it
      const textCanvas = exportRef.current.querySelector("canvas");
      if (textCanvas) {
         ctx.drawImage(textCanvas, 0, 0, canvas.width, canvas.height);
      }
      
      const link = document.createElement("a");
      link.download=`meme-${act.title}.png`;
      link.href=canvas.toDataURL("image/png");
      link.click();
      showToast("✅ 已匯出 PNG！");
    };
  }

  if (loading) return <div style={{padding:60,textAlign:"center",color:"#fff"}}>🔄 正在連線社群資料庫載入最新迷因...</div>;

  return (
    <div ref={wR} style={{minHeight:"100vh",position:"relative"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 20px"}}>
        {/* Header */}
        <header className="fu" style={{paddingTop:36,paddingBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#a855f7,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>✏️</div>
            <div>
              <h1 style={{fontSize:30,fontWeight:900,letterSpacing:-1.5,background:"linear-gradient(135deg,#fff 30%,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MEME 修改器 V3</h1>
              <p style={{fontSize:11,color:"rgba(255,255,255,.25)",letterSpacing:2}}>大幅擴充各地網路熱門迷因庫庫庫 · 新增趣味排版編輯！</p>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="fu" style={{background:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(99,102,241,.06))",border:"1px solid rgba(168,85,247,.15)",borderRadius:16,padding:"18px 24px",marginBottom:20,animationDelay:".05s"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:28}}>🔥</span>
            <div>
              <p style={{fontSize:14,fontWeight:700,color:"#c4b5fd"}}>潮流編輯新功能，創作更搞怪的迷因！</p>
              <p style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>V3 獨家新增：「畫面濾鏡特效」、「文字背景色塊」以及「加入迷因貼紙(Emojis)」，無論是懷舊絕望還是社群打卡風，輕鬆拿捏！</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="fu resp-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:28,animationDelay:".1s"}}>
          {fl.map(m=>
            <div key={m.id} onClick={()=>open(m.id)} className="card" style={{borderRadius:14,border:aId===m.id?`2px solid ${CC[m.c]?.co||'#a855f7'}66`:"1px solid rgba(255,255,255,.05)",overflow:"hidden",position:"relative",background:aId===m.id?"rgba(255,255,255,.04)":"rgba(255,255,255,.015)",height:140}}>
              <div style={{position:"relative"}}>
                <img src={m.img} style={{width:"100%",height:"140px",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 30%,rgba(0,0,0,.9))"}}/>
                <span style={{position:"absolute",bottom:10,left:12,fontSize:14,fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.9)",lineHeight:1.1}}>{m.em} {m.title}</span>
                <span style={{position:"absolute",top:8,right:8,fontSize:9,color:m.t==="vid"?"#7DD3FC":"#F9A8D4",background:"rgba(0,0,0,.6)",padding:"2px 8px",borderRadius:6}}>{m.t==="vid"?"🎬":"🖼️"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Editor Panel */}
        {act && (
          <div ref={dR} className="fu glow-border" style={{background:"rgba(255,255,255,.02)",border:`1px solid ${CC[act.c]?.co||'#a855f7'}30`,borderRadius:20,padding:28,marginBottom:56,position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:28,fontWeight:900}}>{act.em} {act.title}</h2>
                <p style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:5}}>來源：{act.src} | 標籤：{act.tags.join(', ')}</p>
              </div>
              <button onClick={()=>sAId(null)} className="btn btn-ghost">✕ 關閉</button>
            </div>

            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {/* === CANVAS/MEDIA COLUMN === */}
              <div style={{flex:"1 1 360px",minWidth:280}}>
                 <div style={{display:"flex",background:"rgba(0,0,0,.3)",borderRadius:12,padding:3,marginBottom:12,border:"1px solid rgba(255,255,255,.05)"}}>
                  {[{k:"img",l:"🖼️ 靜態編輯"},{k:"vid",l:"🎬 影片編輯"}].map(o=>{
                    const disabled = o.k === "vid" && !act.vid;
                    const on = tM===o.k;
                    return <button key={o.k} disabled={disabled} onClick={(e)=>{if(disabled)e.preventDefault();else sTM(o.k);}} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:disabled?"not-allowed":"pointer",background:on?`linear-gradient(135deg,${CC[act.c]?.co||'#a855f7'},#a855f7)`:"transparent",color:on?"#fff":disabled?"rgba(255,255,255,.1)":"rgba(255,255,255,.25)",fontSize:13,fontWeight:on?800:400,opacity:disabled?0.5:1,transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>{o.l}</button>;
                  })}
                </div>
                
                <div style={{position:"relative", background:"#000", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,.05)"}}>
                  {tM === "vid" && act.vid ? (
                    <div style={{position:"relative", width:"100%", paddingBottom:"56.25%"}}>
                      <YouTubePlayer vid={act.vid} onTimeUpdate={setVideoTime} filter={FILTERS.find(f=>f.k===curMCfg.filter)?.f||""} />
                      <div style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none"}}>
                        <TextCanvas m={act} mode={tM} lines={cL} stickers={cS} textConfig={curCfg} mediaConfig={curMCfg} w={cw} h={(cw*9)/16} currentTime={videoTime} />
                      </div>
                    </div>
                  ) : (
                    <div ref={exportRef} style={{position:"relative"}}>
                      <img src={act.img} style={{width:"100%", display:"block", objectFit:"contain", filter:FILTERS.find(f=>f.k===curMCfg.filter)?.f||""}} crossorigin="anonymous" />
                      <div style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none"}}>
                         <TextCanvas m={act} mode={"img"} lines={cL} stickers={cS} textConfig={curCfg} mediaConfig={curMCfg} w={cw} h={(cw*9)/16} />
                      </div>
                    </div>
                  )}
                </div>
                
                {tM === "img" && (
                   <div style={{marginTop:12, display:"flex", justifyContent:"center"}}>
                      <button onClick={exportPNG} className="btn btn-primary" style={{padding:"10px 20px", fontSize:14}}>💾 合成並匯出成圖 PNG</button>
                   </div>
                )}
                
                {/* Visual Filter Controls */}
                <div style={{marginTop:16, padding:16, background:"rgba(0,0,0,.2)", borderRadius:12, border:"1px solid rgba(255,255,255,.04)"}}>
                    <p style={{fontSize:12,color:"#fff",fontWeight:700,marginBottom:10}}>🌟 畫面濾鏡</p>
                    <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                      {FILTERS.map(f => (
                         <button key={f.k} onClick={()=>sMCfg(p=>({...p, [aId]:{...curMCfg, filter:f.k}}))} className={`pill ${curMCfg.filter===f.k?"active":""}`}>{f.l}</button>
                      ))}
                    </div>
                </div>
              </div>

              {/* === EDITING COLUMNS === */}
              <div style={{flex:"1 1 280px",minWidth:250}}>
                {/* Text Edits */}
                <div style={{background:"rgba(0,0,0,.2)", borderRadius:12, padding:16, border:"1px solid rgba(255,255,255,.04)", marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <p style={{fontSize:12,color:"#fff",fontWeight:700}}>✏️ 修改文字內容</p>
                    <button onClick={rstTx} className="btn btn-ghost" style={{fontSize:9,padding:"4px 10px"}}>↺ 重置內容</button>
                  </div>
                  <LineEditor mode={tM} lines={cL} onChange={setLn} co={CC[act.c]?.co||'#a855f7'} />
                </div>

                {/* Sticker Edits */}
                <div style={{background:"rgba(0,0,0,.2)", borderRadius:12, padding:16, border:"1px solid rgba(255,255,255,.04)", marginBottom:12}}>
                  <p style={{fontSize:12,color:"#fff",fontWeight:700,marginBottom:12}}>😂 插入貼紙圖案</p>
                  <StickerEditor mode={tM} stickers={cS} onChange={setSt} co={CC[act.c]?.co||'#a855f7'} />
                </div>

                {/* Typrography Style */}
                <div style={{background:"rgba(0,0,0,.2)", borderRadius:12, padding:16, border:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <p style={{fontSize:12,color:"#fff",fontWeight:700}}>🎨 文字樣式</p>
                    <button onClick={rstStyle} className="btn btn-ghost" style={{fontSize:9,padding:"4px 10px"}}>↺ 重置樣式</button>
                  </div>
                  
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                     <div>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:4}}>字型</label>
                       <select value={curCfg.font} onChange={e=>sTCfg(p=>({...p, [aId]:{...curCfg, font:e.target.value}}))} className="input-field" style={{width:"100%",fontSize:11}}>
                         {FONTS.map(f=><option key={f.k} value={f.k}>{f.l}</option>)}
                       </select>
                     </div>
                     <div>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:4}}>大小 ({curCfg.size}px)</label>
                       <input type="range" min="14" max="80" value={curCfg.size} onChange={e=>sTCfg(p=>({...p, [aId]:{...curCfg, size:parseInt(e.target.value)}}))} style={{width:"100%",accentColor:"#a855f7"}}/>
                     </div>
                     
                     <div style={{gridColumn:"1/-1"}}>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:6}}>顏色設定</label>
                       <div style={{display:"flex", gap:12, alignItems:"center", background:"rgba(255,255,255,.02)", padding:6, borderRadius:8}}>
                          <span style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>字色:</span>
                          <input type="color" value={curCfg.color} onChange={e=>sTCfg(p=>({...p, [aId]:{...curCfg, color:e.target.value}}))} style={{width:24,height:24,border:"none",background:"none",cursor:"pointer",padding:0,borderRadius:"50%"}} />
                          <span style={{color:"rgba(255,255,255,.2)"}}>|</span>
                          <span style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>描邊:</span>
                          <div style={{display:"flex", gap:4}}>
                            {STROKE_COLORS.map(sc => <div key={sc} onClick={()=>sTCfg(p=>({...p, [aId]:{...curCfg, stroke:sc}}))} style={{width:18,height:18,borderRadius:"50%",background:sc==="none"?"#222":sc,border:curCfg.stroke===sc?"2px solid #a855f7":"1px solid rgba(255,255,255,.2)",cursor:"pointer"}} />)}
                          </div>
                       </div>
                     </div>

                     <div style={{gridColumn:"1/-1"}}>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:6}}>年輕人排版風格</label>
                       <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                          {BG_STYLES.map(bg => (
                             <button key={bg.k} onClick={()=>sTCfg(p=>({...p, [aId]:{...curCfg, bgStyle:bg.k}}))} className={`pill ${curCfg.bgStyle===bg.k?"active":""}`}>{bg.l}</button>
                          ))}
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {toast&&<div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",background:"#a855f7",color:"#fff",padding:"10px 24px",borderRadius:12,fontSize:13,fontWeight:700,zIndex:999}}>{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
