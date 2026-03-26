const { useState, useMemo, useRef, useEffect, useCallback } = React;

/* ═══ COUNTRY CONFIG ═══ */
const CC = {
  TW:{n:"台灣",f:"🇹🇼",co:"#F04438"}, US:{n:"美國",f:"🇺🇸",co:"#528BFF"},
  JP:{n:"日本",f:"🇯🇵",co:"#EE446D"}, KR:{n:"韓國",f:"🇰🇷",co:"#7C5CFC"},
  TH:{n:"泰國",f:"🇹🇭",co:"#EAAA08"}, CN:{n:"中國",f:"🇨🇳",co:"#E04040"},
  GL:{n:"全球",f:"🌍",co:"#12B76A"},
};

/* ═══ FONT OPTIONS ═══ */
const FONTS = [
  {k:"Noto Sans TC",l:"思源黑體"},{k:"serif",l:"襯線體"},{k:"monospace",l:"等寬體"},
  {k:"cursive",l:"手寫體"},{k:"Impact",l:"Impact"},{k:"Comic Sans MS",l:"Comic Sans"},
];
const COLORS = ["#ffffff","#000000","#F04438","#528BFF","#EAAA08","#12B76A","#a855f7","#EE446D","#FF6B35","#00D4FF"];
const STROKE_COLORS = ["none","#000000","#ffffff","#F04438","#528BFF","#a855f7"];

/* ═══ YOUTUBE PLAYER HOOK ═══ */
// Helper to inject YT API
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

function YouTubePlayer({ vid, onTimeUpdate }) {
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
              if (player && player.getCurrentTime) {
                onTimeUpdate(player.getCurrentTime());
              }
            }, 200); // 5 FPS update
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
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [vid]);

  return <div ref={containerRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}} />;
}

/* ═══ TEXT CANVAS PREVIEW (enhanced with time) ═══ */
function TextCanvas({m, mode, lines, textConfig, w=380, h=240, currentTime=0}){
  const ref = useRef(null);
  const co = CC[m?.c]?.co || "#888";

  useEffect(() => {
    const cv = ref.current; if (!cv || !m) return;
    const c = cv.getContext("2d"); const d = window.devicePixelRatio || 1;
    cv.width = w*d; cv.height = h*d; c.scale(d,d);
    
    // bg
    const bg = c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,"#0a0a12"); bg.addColorStop(1,"#12121a");
    c.fillStyle = bg; c.fillRect(0,0,w,h);
    
    // grid
    c.strokeStyle = "rgba(255,255,255,.02)";
    for(let x=0; x<w; x+=20){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0; y<h; y+=20){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    
    // badge
    c.fillStyle = mode==="vid" ? "rgba(125,211,252,.1)" : "rgba(249,168,212,.1)";
    c.beginPath(); c.roundRect(10,10,90,22,6); c.fill();
    c.font = "bold 10px 'Noto Sans TC',sans-serif"; c.fillStyle = mode==="vid" ? "#7DD3FC" : "#F9A8D4"; c.textAlign="left";
    c.fillText(mode==="vid" ? "🎬 影片時間軸預覽" : "🖼️ 圖片文字預覽", 16, 25);
    
    // playback timeline hint
    if (mode === "vid") {
      c.fillStyle = "rgba(255,255,255,0.4)";
      c.font = "10px monospace";
      c.fillText(`當前時間: ${currentTime.toFixed(1)}s`, w - 100, 25);
    }

    // text lines
    c.textAlign = "center";
    const cfg = textConfig || {};
    const font = cfg.font || "Noto Sans TC"; const color = cfg.color || "#ffffff";
    const size = cfg.size || 24; const stroke = cfg.stroke || "none"; const bold = cfg.bold !== false;
    
    // Filter active lines based on time if in vid mode
    let activeLines = lines;
    if (mode === "vid") {
       activeLines = lines.filter(ln => {
         if (ln.start === undefined || ln.end === undefined) return true; // always show if no time set
         return currentTime >= ln.start && currentTime <= ln.end;
       });
    }

    const sY = h/2 - ((activeLines.length-1) * (size+10)) / 2;

    activeLines.forEach((ln, i) => {
      const y = sY + i * (size+10);
      const textToDraw = ln.text || "";
      if (!textToDraw) return;
      
      c.save(); 
      c.shadowColor = "rgba(0,0,0,.8)"; c.shadowBlur = 12;
      const fs = size;
      c.font = `${bold?"bold":""} ${fs}px '${font}',sans-serif`;
      if(stroke && stroke !== "none") {
        c.strokeStyle = stroke; c.lineWidth = Math.max(2, size/8); c.lineJoin = "round"; c.strokeText(textToDraw, w/2, y);
      }
      c.fillStyle = color; c.fillText(textToDraw, w/2, y);
      c.restore();
    });

    // border
    c.strokeStyle = `${co}33`; c.lineWidth = 1; c.beginPath(); c.roundRect(0,0,w,h,10); c.stroke();
  }, [m, mode, lines, w, h, co, textConfig, currentTime]);

  return <canvas ref={ref} style={{width:w, height:h, borderRadius:10, display:"block", background:"transparent"}}/>;
}

/* ═══ TIME-AWARE LINE EDITOR ═══ */
function LineEditor({mode, lines, onChange, co}){
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {lines.map((ln, i) => (
        <div key={i} style={{display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.02)", padding:8, borderRadius:8, border:`1px solid ${co}15`, flexWrap:"wrap"}}>
          <div style={{display:"flex", alignItems:"center", gap:6, width:"100%"}}>
            <span style={{fontSize:9, color:"rgba(255,255,255,.2)", width:16, textAlign:"center", background:"rgba(255,255,255,0.05)", borderRadius:4}}>{i+1}</span>
            <input 
              value={ln.text||""} 
              placeholder="輸入文字..."
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
            <div style={{display:"flex", alignItems:"center", gap:6, paddingLeft:22, width:"100%"}}>
              <span style={{fontSize:10, color:"#7DD3FC", fontWeight:600}}>⏱️ 顯示時間</span>
              <input type="number" min="0" step="0.5" value={ln.start||0} onChange={e=>{const n=[...lines]; n[i]={...ln, start:parseFloat(e.target.value)}; onChange(n);}} className="input-field" style={{width:55, padding:"4px", fontSize:11}}/>
              <span style={{fontSize:10, color:"rgba(255,255,255,.3)"}}>秒至</span>
              <input type="number" min="0" step="0.5" value={ln.end||5} onChange={e=>{const n=[...lines]; n[i]={...ln, end:parseFloat(e.target.value)}; onChange(n);}} className="input-field" style={{width:55, padding:"4px", fontSize:11}}/>
              <span style={{fontSize:10, color:"rgba(255,255,255,.3)"}}>秒</span>
            </div>
          )}
        </div>
      ))}
      <button onClick={()=>onChange([...lines, mode==="vid"?{text:"新文字", start:0, end:5}:{text:"新文字"}])} className="btn btn-ghost" style={{alignSelf:"flex-start", fontSize:11, padding:"6px 14px", borderStyle:"dashed", borderColor:`${co}33`, color:`${co}bb`}}>＋ 新增一行</button>
    </div>
  );
}

/* ═══════════════ MAIN APP ═══════════════ */
function App(){
  const [DB, setDB] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [fC,sFC]=useState("ALL"); const [fY,sFY]=useState("ALL"); const [q,sQ]=useState("");
  const [aId,sAId]=useState(null); const [custs,sCusts]=useState({});
  const [tM,sTM]=useState("img"); const [eT,sET]=useState({});
  const [tCfg,sTCfg]=useState({});
  const [toast,sToast]=useState("");
  const [videoTime, setVideoTime] = useState(0);

  const dR=useRef(null); const [cw,sCw]=useState(380); const wR=useRef(null);
  const exportRef=useRef(null);

  useEffect(()=>{
    const f=()=>{if(wR.current)sCw(Math.min(wR.current.offsetWidth-40,420));};
    f(); window.addEventListener("resize",f);
    
    // Fetch external memes.json data
    fetch('memes.json')
      .then(res => res.json())
      .then(data => {
        setDB(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load memes.json", err);
        setLoading(false);
      });

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
      // Ensure data format is array of objects
      const fmt = (arr) => arr.map(item => typeof item === 'string' ? {text: item} : item);
      sET(p=>({...p, [id]:{img:fmt(m.iL||[{text:""}]), vid:fmt(m.vL||[{text:"", start:0, end:5}])}}));
    }
    sTM(m?.t === "vid" ? "vid" : "img");
    setVideoTime(0);
    setTimeout(()=>dR.current?.scrollIntoView({behavior:"smooth",block:"nearest"}), 150);
  }

  function setLn(l){if(!aId)return;sET(p=>({...p,[aId]:{...p[aId],[tM]:l}}));}
  function rstTx(){
    if(!act)return;
    const fmt = (arr) => arr.map(item => typeof item === 'string' ? {text: item} : item);
    sET(p=>({...p,[aId]:{img:fmt(act.iL),vid:fmt(act.vL)}}));
  }
  function rstStyle(){if(!aId)return;sTCfg(p=>{const n={...p};delete n[aId];return n;});}
  
  const cL = (eT[aId]||{})[tM] || [];
  const curCfg = tCfg[aId] || {font:"Noto Sans TC", size:24, color:"#ffffff", stroke:"#000000", bold:true};

  function showToast(msg){sToast(msg);setTimeout(()=>sToast(""),2500);}

  if (loading) return <div style={{padding:60,textAlign:"center",color:"#fff"}}>🔄 正在連線社群資料庫載入最新迷因...</div>;

  return (
    <div ref={wR} style={{minHeight:"100vh",position:"relative"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 20px"}}>
        {/* Header */}
        <header className="fu" style={{paddingTop:36,paddingBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#a855f7,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>✏️</div>
            <div>
              <h1 style={{fontSize:30,fontWeight:900,letterSpacing:-1.5,background:"linear-gradient(135deg,#fff 30%,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MEME 修改器 V2</h1>
              <p style={{fontSize:11,color:"rgba(255,255,255,.25)",letterSpacing:2}}>自動更新社群迷因 · 影片時間軸文字編輯 · {DB.length} 個最新素材</p>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="fu" style={{background:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(99,102,241,.06))",border:"1px solid rgba(168,85,247,.15)",borderRadius:16,padding:"18px 24px",marginBottom:20,animationDelay:".05s"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:28}}>⚡</span>
            <div>
              <p style={{fontSize:14,fontWeight:700,color:"#c4b5fd"}}>新功能：外部載入社群迷因與影片時間軸編輯！</p>
              <p style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>所有網址皆為自動轉換，無需手動填寫。在「影片文字」模式下可設定文字出現的精確秒數。</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="fu resp-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:28,animationDelay:".1s"}}>
          {fl.map(m=>
            <div key={m.id} onClick={()=>open(m.id)} className="card" style={{borderRadius:14,border:aId===m.id?`2px solid ${CC[m.c]?.co||'#a855f7'}66`:"1px solid rgba(255,255,255,.05)",overflow:"hidden",position:"relative",background:aId===m.id?"rgba(255,255,255,.04)":"rgba(255,255,255,.015)"}}>
              <div style={{position:"relative"}}>
                <img src={m.img} style={{width:"100%",height:140,objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 30%,rgba(0,0,0,.9))"}}/>
                <span style={{position:"absolute",bottom:10,left:12,fontSize:15,fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.9)"}}>{m.em} {m.title}</span>
                <span style={{position:"absolute",top:8,right:8,fontSize:9,color:m.t==="vid"?"#7DD3FC":"#F9A8D4",background:"rgba(0,0,0,.6)",padding:"2px 8px",borderRadius:6}}>{m.t==="vid"?"🎬 影片":"🖼️ 圖片"}</span>
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
              {/* Media Player Column */}
              <div style={{flex:"1 1 360px",minWidth:280}}>
                 <div style={{display:"flex",background:"rgba(0,0,0,.3)",borderRadius:12,padding:3,marginBottom:12,border:"1px solid rgba(255,255,255,.05)"}}>
                  {[{k:"img",l:"🖼️ 圖片編輯",d:"梗圖靜態文字"},{k:"vid",l:"🎬 影片編輯",d:"時間軸字幕 (支援 YT)"}].map(o=>{
                    // disable vid if no vid
                    const disabled = o.k === "vid" && !act.vid;
                    const on = tM===o.k;
                    return <button key={o.k} disabled={disabled} onClick={(e)=>{if(disabled)e.preventDefault();else sTM(o.k);}} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:disabled?"not-allowed":"pointer",background:on?`linear-gradient(135deg,${CC[act.c]?.co||'#a855f7'},#a855f7)`:"transparent",color:on?"#fff":disabled?"rgba(255,255,255,.1)":"rgba(255,255,255,.25)",fontSize:13,fontWeight:on?800:400,opacity:disabled?0.5:1,transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>{o.l}</button>;
                  })}
                </div>
                
                <div style={{position:"relative", background:"#000", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,.05)"}}>
                  {tM === "vid" && act.vid ? (
                    <div style={{position:"relative", width:"100%", paddingBottom:"56.25%"}}>
                      <YouTubePlayer vid={act.vid} onTimeUpdate={(time) => setVideoTime(time)} />
                      {/* Transparent canvas overlay for precise synchronization */}
                      <div style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none"}}>
                        <TextCanvas m={act} mode={tM} lines={cL} textConfig={curCfg} w={cw} h={(cw*9)/16} currentTime={videoTime} />
                      </div>
                    </div>
                  ) : (
                    <div ref={exportRef} style={{position:"relative"}}>
                      <img src={act.img} style={{width:"100%", display:"block", objectFit:"contain"}} />
                      <div style={{position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none"}}>
                         <TextCanvas m={act} mode={"img"} lines={cL} textConfig={curCfg} w={cw} h={(cw*act.imgHeight)/act.imgWidth || (cw*9)/16} />
                      </div>
                    </div>
                  )}
                </div>
                
                {tM === "vid" && (
                   <p style={{marginTop:8,fontSize:11,color:"rgba(255,255,255,.3)",textAlign:"center"}}>💡 影片播放時，文字會依照設定的「秒數」動態覆蓋在畫面上。</p>
                )}
              </div>

              {/* Editing Controls Column */}
              <div style={{flex:"1 1 280px",minWidth:250}}>
                <div style={{background:"rgba(0,0,0,.2)", borderRadius:12, padding:16, border:"1px solid rgba(255,255,255,.04)", marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <p style={{fontSize:12,color:"#fff",fontWeight:700,display:"flex",alignItems:"center",gap:6}}><span style={{width:3,height:14,background:"#a855f7",borderRadius:2}}/> 編輯文字內容</p>
                    <button onClick={rstTx} className="btn btn-ghost" style={{fontSize:9,padding:"4px 10px"}}>↺ 重置</button>
                  </div>
                  <LineEditor mode={tM} lines={cL} onChange={setLn} co={CC[act.c]?.co||'#a855f7'} />
                </div>

                <div style={{background:"rgba(0,0,0,.2)", borderRadius:12, padding:16, border:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <p style={{fontSize:12,color:"#fff",fontWeight:700,display:"flex",alignItems:"center",gap:6}}><span style={{width:3,height:14,background:"#a855f7",borderRadius:2}}/> 外觀樣式</p>
                    <button onClick={rstStyle} className="btn btn-ghost" style={{fontSize:9,padding:"4px 10px"}}>↺ 重置</button>
                  </div>
                  
                  {/* Style Settings Simplified */}
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                     <div>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:4}}>字型</label>
                       <select value={curCfg.font} onChange={e=>sTCfg(p=>({...p, [aId]:{...curCfg, font:e.target.value}}))} className="input-field" style={{width:"100%",fontSize:11}}>
                         {FONTS.map(f=><option key={f.k} value={f.k}>{f.l}</option>)}
                       </select>
                     </div>
                     <div>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:4}}>大小 ({curCfg.size}px)</label>
                       <input type="range" min="14" max="60" value={curCfg.size} onChange={e=>sTCfg(p=>({...p, [aId]:{...curCfg, size:parseInt(e.target.value)}}))} style={{width:"100%",accentColor:"#a855f7"}}/>
                     </div>
                     <div style={{gridColumn:"1/-1"}}>
                       <label style={{fontSize:10,color:"rgba(255,255,255,.3)",display:"block",marginBottom:6}}>顏色 / 描邊</label>
                       <div style={{display:"flex", gap:12, alignItems:"center"}}>
                          <input type="color" value={curCfg.color} onChange={e=>sTCfg(p=>({...p, [aId]:{...curCfg, color:e.target.value}}))} style={{width:28,height:28,border:"none",background:"none",cursor:"pointer",padding:0,borderRadius:"50%"}} />
                          <span style={{color:"rgba(255,255,255,.2)"}}>|</span>
                          <div style={{display:"flex", gap:4}}>
                            {STROKE_COLORS.map(sc => <div key={sc} onClick={()=>sTCfg(p=>({...p, [aId]:{...curCfg, stroke:sc}}))} style={{width:20,height:20,borderRadius:"50%",background:sc==="none"?"#222":sc,border:curCfg.stroke===sc?"2px solid #a855f7":"1px solid rgba(255,255,255,.2)",cursor:"pointer"}} />)}
                          </div>
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
