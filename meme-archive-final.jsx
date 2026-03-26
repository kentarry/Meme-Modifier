import { useState, useMemo, useRef, useEffect } from "react";

const CC = {
  TW: { n: "台灣", f: "🇹🇼", co: "#F04438" },
  US: { n: "美國", f: "🇺🇸", co: "#528BFF" },
  JP: { n: "日本", f: "🇯🇵", co: "#EE446D" },
  KR: { n: "韓國", f: "🇰🇷", co: "#7C5CFC" },
  TH: { n: "泰國", f: "🇹🇭", co: "#EAAA08" },
  CN: { n: "中國", f: "🇨🇳", co: "#E04040" },
  GL: { n: "全球", f: "🌍", co: "#12B76A" },
};

const DB = [
  { id: "tw01", c: "TW", y: 2004, t: "vid", title: "甘安捏", src: "《台灣龍捲風》", tags: ["鄉土劇", "洗腦"], em: "😏", img: "https://img.youtube.com/vi/5GL9JoH4Sws/hqdefault.jpg", vid: "5GL9JoH4Sws", grad: ["#4a0e0e", "#1c0404"], desc: "演員方岑飾演反派葉美琪，口頭禪「甘安捏」劇中出現77次，魔性洗腦。", iL: ["甘安捏？", "甘安捏！！！"], vL: ["[00:00] 女角走進房間", "[00:03] 聽完對方說話", "[00:05]「甘安捏？」×77", "[00:30] BGM越來越快"] },
  { id: "tw02", c: "TW", y: 2009, t: "vid", title: "北斗爆橘拳", src: "《夜市人生》", tags: ["鄉土劇", "模仿"], em: "🍊", img: "https://img.youtube.com/vi/LuEbgMUqNUs/hqdefault.jpg", vid: "LuEbgMUqNUs", grad: ["#4a2800", "#1c0f00"], desc: "雷洪大喊「恰恰」徒手捏爆橘子，橘汁爆射引發全台模仿潮。", iL: ["感受我的憤怒！", "恰恰！！！"], vL: ["[00:00] 飯桌前暴怒", "[00:02]「恰恰！！」", "[00:03] 捏爆橘子", "[00:04] 橘汁噴鏡頭"] },
  { id: "tw03", c: "TW", y: 2012, t: "img", title: "我全都要", src: "周星馳《九品芝麻官》", tags: ["星爺", "萬用"], em: "🤩", img: "https://img.youtube.com/vi/BKjBMQ1cFn4/hqdefault.jpg", vid: "BKjBMQ1cFn4", grad: ["#0e0e4a", "#04041c"], desc: "「小孩子才做選擇，我全都要！」", iL: ["小孩子才做選擇", "我 全 都 要"], vL: ["角色被問選哪個", "周星馳自信地說：", "小孩子才做選擇", "我全都要！"] },
  { id: "tw04", c: "TW", y: 2019, t: "img", title: "我就爛", src: "網路自嘲文化", tags: ["自嘲", "躺平"], em: "👍", img: "https://img.youtube.com/vi/iwgsHNCT1GM/hqdefault.jpg", vid: "", grad: ["#0e4a1a", "#041c08"], desc: "陽光帥哥燦笑比讚配上「我就爛」，精準表達躺平心理。", iL: ["✨ 我就爛 ✨", "燦笑＋比讚"], vL: ["帥哥露齒微笑", "豎起大拇指", "大字：我就爛", "自嘲回覆萬用"] },
  { id: "tw05", c: "TW", y: 2020, t: "vid", title: "啊我就怕被罵啊", src: "反正我很閒", tags: ["YouTube", "流行語"], em: "😰", img: "https://img.youtube.com/vi/g3F3lkvGCHs/hqdefault.jpg", vid: "g3F3lkvGCHs", grad: ["#1a0e4a", "#08041c"], desc: "反正我很閒經典台詞，成為推卸責任萬用回覆。", iL: ["為什麼不說？", "啊我就怕被罵啊"], vL: ["[00:00] 上司質問", "[00:03] 一臉無辜", "[00:04] 啊我就怕被罵啊！", "[00:06] 上司崩潰"] },
  { id: "tw06", c: "TW", y: 2020, t: "vid", title: "卑鄙源之助", src: "反正我很閒", tags: ["諷刺", "職場"], em: "😎", img: "https://img.youtube.com/vi/TmLfaTHMVPc/hqdefault.jpg", vid: "TmLfaTHMVPc", grad: ["#4a4a0e", "#1c1c04"], desc: "荒誕手法諷刺職場卑鄙行為，年度台灣第九大熱門影片。", iL: ["卑鄙源之助", "最流行的生活方式"], vL: ["[00:00] 各位觀眾大家好", "[00:05] 介紹卑鄙源之助", "[00:10] 卑鄙行為大全", "[00:30] 卑鄙的力量"] },
  { id: "tw07", c: "TW", y: 2023, t: "vid", title: "山道猴子的一生", src: "YouTube動畫", tags: ["諷刺", "洗腦"], em: "🏍️", img: "https://img.youtube.com/vi/fB6Fkwtfewo/hqdefault.jpg", vid: "fB6Fkwtfewo", grad: ["#0e2a4a", "#04101c"], desc: "「社會在走，行情要有」年度洗腦金句。", iL: ["社會在走", "行情要有"], vL: ["[00:00] AI:哈囉大家好", "[00:10] 社會在走行情要有", "[00:20] 你不理財財不理你", "[00:35] 悲劇結局"] },
  { id: "tw08", c: "TW", y: 2025, t: "vid", title: "大展鴻圖", src: "攬佬 SKAI", tags: ["音樂", "畢業"], em: "🐟", img: "https://img.youtube.com/vi/bGqbHG_gU1o/hqdefault.jpg", vid: "bGqbHG_gU1o", grad: ["#4a3a0e", "#1c1504"], desc: "「別墅裡面唱K，水池裡面銀龍魚」洗腦歌詞席捲社群。", iL: ["別墅裡面唱K", "水池裡面銀龍魚"], vL: ["[00:00] 節奏響起", "[00:03] 別墅裡面唱K", "[00:05] 銀龍魚", "[00:10] 全場合唱"] },
  { id: "us01", c: "US", y: 2013, t: "img", title: "Doge", src: "柴犬 Kabosu", tags: ["動物", "經典"], em: "🐕", img: "https://i.imgflip.com/4t0m5.jpg", vid: "", grad: ["#4a4a0e", "#1c1c04"], desc: "柴犬Kabosu配上Comic Sans，催生Dogecoin。", iL: ["such wow", "much amaze", "very meme", "so doge"], vL: ["柴犬Kabosu側臉", "揚起眉毛斜視", "Comic Sans字體", "wow/such/much/very"] },
  { id: "us02", c: "US", y: 2017, t: "img", title: "Distracted Boyfriend", src: "iStock圖庫照", tags: ["經典", "萬用"], em: "👀", img: "https://i.imgflip.com/1ur9b0.jpg", vid: "", grad: ["#0e2a4a", "#04101c"], desc: "男友回頭看路人被女友瞪，全球最被改編的迷因模板之一。", iL: ["（我）→ 新事物", "（舊事物）生氣中"], vL: ["男友走路中", "回頭看路過女子", "女友死亡凝視", "全球無數改編"] },
  { id: "us03", c: "US", y: 2019, t: "img", title: "Woman Yelling at Cat", src: "Twitter合成", tags: ["萬用", "經典"], em: "🐱", img: "https://i.imgflip.com/345v97.jpg", vid: "", grad: ["#4a0e1a", "#1c0408"], desc: "哭泣女人與困惑白貓Smudge，全球最經典對比迷因。", iL: ["（憤怒女人指著）", "（困惑白貓坐著）"], vL: ["左：金髮女子憤怒", "右：白貓Smudge", "面前擺沙拉盤", "一臉問號"] },
  { id: "us04", c: "US", y: 2024, t: "vid", title: "Hawk Tuah", src: "Nashville街訪", tags: ["街訪", "爆紅"], em: "🤠", img: "https://img.youtube.com/vi/gVEdQJ7qtJw/hqdefault.jpg", vid: "gVEdQJ7qtJw", grad: ["#1a2a4a", "#08101c"], desc: "Haliey Welch南方口音成夏日文化現象。", iL: ["HAWK TUAH", "Spit on that thang"], vL: ["[00:00] 街頭訪問", "[00:05] You gotta give em", "[00:07] HAWK TUAH!", "[00:08] 爆笑"] },
  { id: "us05", c: "US", y: 2024, t: "img", title: "Brat Summer", src: "Charli XCX", tags: ["音樂", "時尚"], em: "💚", img: "https://i.imgflip.com/8tyifx.jpg", vid: "", grad: ["#0e4a0e", "#041c04"], desc: "螢光綠美學席捲社群，重新定義brat。", iL: ["brat", "螢光綠低解析度"], vL: ["螢光綠底", "模糊白字brat", "派對混亂不完美", "brat green濾鏡"] },
  { id: "us06", c: "US", y: 2024, t: "img", title: "Chill Guy", src: "藝術家插畫", tags: ["冷靜", "萬用"], em: "🐶", img: "https://i.imgflip.com/9bcdzu.jpg", vid: "", grad: ["#2a2a0e", "#101004"], desc: "穿毛衣卡通狗面對混亂保持冷靜。", iL: ["I'm just a chill guy", "雙手插口袋微笑"], vL: ["[00:00] lo-fi音樂", "[00:03] 混亂場景", "[00:05] 狗站中央", "[00:07] 淡定微笑"] },
  { id: "jp01", c: "JP", y: 2013, t: "vid", title: "今でしょ！", src: "林修老師", tags: ["教育", "名言"], em: "👨‍🏫", img: "https://img.youtube.com/vi/kIFoaWCPxSY/hqdefault.jpg", vid: "kIFoaWCPxSY", grad: ["#4a1010", "#1c0404"], desc: "「什麼時候做？就是現在！」日本國民級迷因。", iL: ["いつやるか？", "今でしょ！"], vL: ["講師站在黑板前", "いつやるか？", "停頓一秒——", "今でしょ！"] },
  { id: "jp02", c: "JP", y: 2024, t: "vid", title: "Chipi Chipi Chapa Chapa", src: "智利歌曲×貓", tags: ["音樂", "貓咪"], em: "🎵", img: "https://img.youtube.com/vi/r2LpOUwca94/hqdefault.jpg", vid: "r2LpOUwca94", grad: ["#4a2a0e", "#1c1004"], desc: "智利歌手20年前歌曲配上跳舞橘貓全球爆紅。", iL: ["Chipi chipi", "Chapa chapa"], vL: ["[00:00] 歡快節奏", "[00:02] Chipi chipi chapa chapa", "[00:04] 橘貓搖擺", "[00:08] 無限循環"] },
  { id: "kr01", c: "KR", y: 2023, t: "vid", title: "Queencard", src: "(G)I-DLE", tags: ["K-POP", "舞蹈"], em: "👑", img: "https://img.youtube.com/vi/7BDfU5MNrg4/hqdefault.jpg", vid: "7BDfU5MNrg4", grad: ["#2a0e4a", "#10041c"], desc: "「I'm a 퀸카」近似台語「阿嬤饋咖」。", iL: ["I'm a Queencard", "阿嬤饋咖！"], vL: ["[00:00] 強烈節拍", "[00:03] I'm a 퀸카！", "[00:05] 舞蹈劃一", "[00:08] 阿嬤饋咖"] },
  { id: "kr02", c: "KR", y: 2024, t: "vid", title: "APT", src: "ROSÉ × Bruno Mars", tags: ["K-POP", "洗腦"], em: "🎤", img: "https://img.youtube.com/vi/ekr2nIex040/hqdefault.jpg", vid: "ekr2nIex040", grad: ["#0e0e4a", "#04041c"], desc: "源自韓國喝酒遊戲的洗腦歌曲，全球模仿。", iL: ["A-P-T!", "APT! APT!"], vL: ["[00:00] 派對場景", "[00:03] AP-AP-AP-APT!", "[00:05] 雙手拍打", "[00:08] 全球翻跳"] },
  { id: "th01", c: "TH", y: 2024, t: "img", title: "Moo Deng", src: "泰國動物園", tags: ["動物", "可愛"], em: "🦛", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Moo_Deng_%28baby_hippo%29_8.jpg/640px-Moo_Deng_%28baby_hippo%29_8.jpg", vid: "", grad: ["#4a3a0e", "#1c1504"], desc: "侏儒河馬寶寶以萌態成為全球巨星。", iL: ["Moo Deng says hi", "🦛💦"], vL: ["[00:00] 小河馬蹦跳", "[00:03] 潑水張嘴", "[00:06] 萌萌表情", "[00:10] SNL重現"] },
  { id: "cn01", c: "CN", y: 2024, t: "vid", title: "Mr. Fresh 鮮肉貓", src: "Hello Street Cat", tags: ["貓咪", "傲嬌"], em: "🐱", img: "https://img.youtube.com/vi/wnB2pHQkXOA/hqdefault.jpg", vid: "", grad: ["#4a2a0a", "#1c1004"], desc: "街貓餵食App的橘貓，只吃新鮮食物。", iL: ["Mr. Fresh", "只吃新鮮的 😤"], vL: ["[00:00] 餵食器畫面", "[00:03] 舊食物——走開", "[00:08] 新鮮倒入", "[00:10] 優雅進食"] },
  { id: "gl01", c: "GL", y: 2025, t: "img", title: "Ghibli Me", src: "AI濾鏡", tags: ["AI", "吉卜力"], em: "🎨", img: "https://img.youtube.com/vi/jM4F-raRBOE/hqdefault.jpg", vid: "", grad: ["#0e3a2a", "#041510"], desc: "AI濾鏡將自拍轉成宮崎駿風格，全球百萬人參與。", iL: ["Before → After", "Ghibli Me ✨"], vL: ["左：真人自拍", "右：吉卜力風格", "溫暖柔和色調", "全球參與"] },
  { id: "gl02", c: "GL", y: 2025, t: "img", title: "Labubu", src: "Pop Mart", tags: ["公仔", "潮流"], em: "👾", img: "https://img.youtube.com/vi/kFjGREoXXgs/hqdefault.jpg", vid: "", grad: ["#0e3a1a", "#04150a"], desc: "醜萌怪物公仔在Lisa配戴後全球爆紅。", iL: ["你搶到了嗎？", "LABUBU"], vL: ["[00:00] Pop Mart排隊", "[00:05] 撕盲盒", "[00:08] 醜萌公仔", "[00:10] 隱藏款！"] },
];

/* ── Pill button ── */
function Pill({ on, onClick, children, co = "#fff" }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 9, fontSize: 12,
      fontWeight: on ? 700 : 400,
      border: on ? `1.5px solid ${co}55` : "1px solid rgba(255,255,255,0.06)",
      background: on ? `${co}15` : "rgba(255,255,255,0.015)",
      color: on ? "#fff" : "rgba(255,255,255,0.3)",
      cursor: "pointer", whiteSpace: "nowrap",
      display: "flex", alignItems: "center", gap: 5,
      transition: "all .25s", fontFamily: "inherit",
    }}>
      {children}
    </button>
  );
}

/* ── Image with emoji fallback ── */
function MImg({ src, em, grad, alt, h = 130 }) {
  const [ok, setOk] = useState(true);
  if (!ok || !src) {
    return (
      <div style={{
        width: "100%", height: h,
        background: `linear-gradient(135deg,${grad[0]},${grad[1]})`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: h * 0.35 }}>{em}</span>
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt}
      style={{ width: "100%", height: h, objectFit: "cover", display: "block" }}
      onError={() => setOk(false)}
    />
  );
}

/* ── Grid card ── */
function Thumb({ m, on, onClick }) {
  const co = CC[m.c];
  return (
    <div onClick={onClick} className="gc" style={{
      borderRadius: 12,
      border: on ? `2px solid ${co.co}55` : "1px solid rgba(255,255,255,0.04)",
      overflow: "hidden", position: "relative",
      background: on ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
    }}>
      <div style={{ position: "relative" }}>
        <MImg src={m.img} em={m.em} grad={m.grad} alt={m.title} h={130} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%,rgba(0,0,0,0.85))" }} />
        <span style={{ position: "absolute", bottom: 8, left: 10, fontSize: 14, fontWeight: 900, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>{m.title}</span>
        <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.55)", padding: "2px 6px", borderRadius: 4 }}>{co.f} {m.y}</span>
        <span style={{ position: "absolute", top: 6, right: 6, fontSize: 9, color: m.t === "vid" ? "#7DD3FC" : "#F9A8D4", background: "rgba(0,0,0,0.55)", padding: "2px 6px", borderRadius: 4 }}>{m.t === "vid" ? "🎬" : "🖼️"}</span>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.src}</p>
      </div>
      {on && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: co.co }} />}
    </div>
  );
}

/* ── Text canvas ── */
function TCanvas({ m, mode, lines, w = 360, h = 210 }) {
  const ref = useRef(null);
  const co = CC[m.c]?.co || "#888";

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const c = cv.getContext("2d");
    const d = window.devicePixelRatio || 1;
    cv.width = w * d;
    cv.height = h * d;
    c.scale(d, d);
    c.fillStyle = "#0d0d0d";
    c.fillRect(0, 0, w, h);

    // grid
    c.strokeStyle = "rgba(255,255,255,0.02)";
    for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }

    // badge
    c.fillStyle = mode === "vid" ? "rgba(125,211,252,0.1)" : "rgba(249,168,212,0.1)";
    c.beginPath(); c.roundRect(8, 8, 82, 20, 4); c.fill();
    c.font = "bold 9px sans-serif";
    c.fillStyle = mode === "vid" ? "#7DD3FC" : "#F9A8D4";
    c.textAlign = "left";
    c.fillText(mode === "vid" ? "🎬 影片文字" : "🖼️ 圖片文字", 14, 22);

    // lines
    c.textAlign = "center";
    const isV = mode === "vid";
    const sY = isV ? 50 : h / 2 - (lines.length * 17);
    lines.forEach((ln, i) => {
      const y = sY + i * (isV ? 30 : 36);
      if (y > h - 6) return;
      if (isV && ln.startsWith("[")) {
        const tc = ln.match(/^\[.*?\]/)?.[0] || "";
        const rest = ln.slice(tc.length).trim();
        c.font = "bold 10px monospace"; c.fillStyle = co; c.textAlign = "left";
        c.fillText(tc, 16, y);
        c.font = "12px sans-serif"; c.fillStyle = "rgba(255,255,255,0.85)";
        c.fillText(rest, 16 + c.measureText(tc + " ").width, y);
        c.textAlign = "center";
      } else if (!isV) {
        c.save(); c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 8;
        c.font = `bold ${i === 0 ? 22 : 16}px sans-serif`;
        c.fillStyle = i === 0 ? "#fff" : co;
        c.fillText(ln, w / 2, y); c.restore();
      } else {
        c.font = "12px sans-serif"; c.fillStyle = "rgba(255,255,255,0.75)";
        c.textAlign = "left"; c.fillText(ln, 16, y); c.textAlign = "center";
      }
    });

    c.strokeStyle = `${co}22`; c.lineWidth = 1;
    c.beginPath(); c.roundRect(0, 0, w, h, 8); c.stroke();
  }, [m, mode, lines, w, h, co]);

  return <canvas ref={ref} style={{ width: w, height: h, borderRadius: 8, display: "block" }} />;
}

/* ── Line editor ── */
function LnEdit({ lines, onChange, co }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", width: 14, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
          <input
            value={ln}
            onChange={e => { const n = [...lines]; n[i] = e.target.value; onChange(n); }}
            style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${co}28`, background: "rgba(255,255,255,0.025)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
            onFocus={e => { e.target.style.borderColor = co; }}
            onBlur={e => { e.target.style.borderColor = `${co}28`; }}
          />
          {lines.length > 1 && (
            <button onClick={() => onChange(lines.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.12)", cursor: "pointer", fontSize: 13, padding: "2px" }}>✕</button>
          )}
        </div>
      ))}
      <button onClick={() => onChange([...lines, "新文字"])} style={{ padding: "4px 10px", borderRadius: 6, border: `1px dashed ${co}33`, background: "transparent", color: `${co}66`, cursor: "pointer", fontSize: 10, fontFamily: "inherit", alignSelf: "flex-start" }}>＋ 新增</button>
    </div>
  );
}

/* ── Media panel ── */
function MediaPanel({ m, cust, onReplace }) {
  const fR = useRef(null);
  const [vw, setVw] = useState("img");
  const [ub, setUb] = useState(false);
  const [ui, setUi] = useState("");
  const co = CC[m.c]?.co || "#888";

  const curImg = cust?.img || m.img;
  const curVid = cust?.vid || (m.vid ? `https://www.youtube.com/embed/${m.vid}` : "");
  const hasV = !!curVid;
  const hasCI = !!cust?.img;

  const tabs = [{ k: "img", l: "🖼️ 圖片" }];
  if (hasV) tabs.push({ k: "vid", l: "🎬 影片" });
  if (hasCI) tabs.push({ k: "uimg", l: "📤 自訂圖" });

  function hf(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { onReplace({ img: ev.target.result, vid: cust?.vid || curVid }); setVw("uimg"); };
    r.readAsDataURL(f);
  }

  function hv() {
    if (!ui.trim()) return;
    let u = ui.trim();
    if (u.includes("youtube.com/watch")) {
      try { const v = new URL(u).searchParams.get("v"); if (v) u = `https://www.youtube.com/embed/${v}`; } catch (e) { /* noop */ }
    } else if (u.includes("youtu.be/")) {
      const v = u.split("youtu.be/")[1]?.split("?")[0];
      if (v) u = `https://www.youtube.com/embed/${v}`;
    }
    onReplace({ img: cust?.img || null, vid: u });
    setUi(""); setUb(false); setVw("vid");
  }

  return (
    <div>
      {tabs.length > 1 && (
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {tabs.map(t => <Pill key={t.k} on={vw === t.k} onClick={() => setVw(t.k)} co={co}>{t.l}</Pill>)}
        </div>
      )}

      <div style={{ borderRadius: 12, overflow: "hidden", background: "#000" }}>
        {vw === "vid" && hasV ? (
          <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
            <iframe
              src={curVid}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={m.title}
            />
          </div>
        ) : vw === "uimg" && hasCI ? (
          <img src={cust.img} alt="自訂" style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: 380, background: "#0a0a0a" }} />
        ) : (
          <MImg src={curImg} em={m.em} grad={m.grad} alt={m.title} h={280} />
        )}
      </div>

      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
        <input ref={fR} type="file" accept="image/*" style={{ display: "none" }} onChange={hf} />
        <button onClick={() => fR.current?.click()} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${co}44`, background: `${co}08`, color: co, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>📤 上傳圖片</button>
        <button onClick={() => setUb(!ub)} style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid #528BFF44", background: "#528BFF08", color: "#528BFF", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>🔗 更換影片</button>
        {(cust?.img || cust?.vid) && (
          <button onClick={() => { onReplace(null); setVw("img"); }} style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>↺ 還原</button>
        )}
      </div>

      {ub && (
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          <input value={ui} onChange={e => setUi(e.target.value)} placeholder="貼上 YouTube 網址..." onKeyDown={e => e.key === "Enter" && hv()} style={{ flex: 1, padding: "6px 10px", borderRadius: 7, border: "1px solid #528BFF44", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
          <button onClick={hv} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "#528BFF", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>確認</button>
        </div>
      )}
    </div>
  );
}

/* ═══════ APP ═══════ */
export default function App() {
  const [fC, sFC] = useState("ALL");
  const [fY, sFY] = useState("ALL");
  const [q, sQ] = useState("");
  const [aId, sAId] = useState(null);
  const [custs, sCusts] = useState({});
  const [tM, sTM] = useState("img");
  const [eT, sET] = useState({});
  const dR = useRef(null);
  const [cw, sCw] = useState(360);
  const wR = useRef(null);

  useEffect(() => {
    const f = () => { if (wR.current) sCw(Math.min(wR.current.offsetWidth - 40, 400)); };
    f(); window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const fl = useMemo(() => DB.filter(m => {
    if (fC !== "ALL" && m.c !== fC) return false;
    if (fY !== "ALL") { const [a, b] = fY.split("-").map(Number); if (m.y < a || m.y > b) return false; }
    if (q) { const s = q.toLowerCase(); return m.title.toLowerCase().includes(s) || m.src.toLowerCase().includes(s) || m.tags.some(t => t.includes(s)); }
    return true;
  }).sort((a, b) => b.y - a.y), [fC, fY, q]);

  const act = DB.find(m => m.id === aId);

  function open(id) {
    sAId(id);
    const m = DB.find(x => x.id === id);
    if (m && !eT[id]) sET(p => ({ ...p, [id]: { img: [...m.iL], vid: [...m.vL] } }));
    sTM("img");
    setTimeout(() => dR.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
  }

  function setLn(l) { if (!aId) return; sET(p => ({ ...p, [aId]: { ...p[aId], [tM]: l } })); }
  function rstTx() { if (!act) return; sET(p => ({ ...p, [aId]: { img: [...act.iL], vid: [...act.vL] } })); }
  const cL = (eT[aId] || {})[tM] || (act ? (tM === "img" ? act.iL : act.vL) : []);

  return (
    <div ref={wR} style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Noto Sans TC','Helvetica Neue',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;700;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .su{animation:su .4s cubic-bezier(.22,1,.36,1) both}
        .gc{transition:all .3s cubic-bezier(.22,1,.36,1);cursor:pointer}
        .gc:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 12px 40px rgba(0,0,0,0.5)}
        *{box-sizing:border-box}
        button,input,select{font-family:'Noto Sans TC',sans-serif}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:3px}
        select option{background:#111}
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <header className="su" style={{ paddingTop: 40, paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1.5 }}>🌏 MEME 圖鑑</h1>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", letterSpacing: 3 }}>全球迷因資料庫</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>{DB.length} 個迷因 · {Object.keys(CC).length} 國 · 2004–2025</p>
        </header>

        {/* Filters */}
        <div className="su" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, alignItems: "center", animationDelay: ".08s" }}>
          {[{ k: "ALL", f: "🌐", n: "全部" }, ...Object.entries(CC).map(([k, v]) => ({ k, f: v.f, n: v.n }))].map(i => (
            <Pill key={i.k} on={fC === i.k} onClick={() => sFC(i.k)} co={CC[i.k]?.co}>
              <span style={{ fontSize: 15 }}>{i.f}</span>{i.n}
            </Pill>
          ))}
          <select value={fY} onChange={e => sFY(e.target.value)} style={{ padding: "7px 28px 7px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)", color: "#fff", fontSize: 12, outline: "none", appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
            <option value="ALL">📅 全部年份</option>
            {["2004-2012", "2013-2019", "2020-2022", "2023-2025"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{ flex: 1, minWidth: 120, position: "relative" }}>
            <input placeholder="搜尋迷因..." value={q} onChange={e => sQ(e.target.value)} style={{ width: "100%", padding: "7px 12px 7px 30px", borderRadius: 9, fontSize: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#fff", outline: "none" }} />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, opacity: 0.2 }}>🔍</span>
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontWeight: 600 }}>{fl.length}</span>
        </div>

        {/* Grid */}
        <div className="su" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 24, animationDelay: ".12s" }}>
          {fl.map(m => <Thumb key={m.id} m={m} on={aId === m.id} onClick={() => open(m.id)} />)}
          {fl.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "rgba(255,255,255,0.15)" }}>找不到 🥲</div>}
        </div>

        {/* Detail panel */}
        {act && (() => {
          const co = CC[act.c];
          return (
            <div ref={dR} className="su" style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${co.co}25`, borderRadius: 16, padding: 24, marginBottom: 48, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent 10%,${co.co},transparent 90%)` }} />

              {/* Title */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: co.co, background: `${co.co}18`, padding: "3px 10px", borderRadius: 10, fontWeight: 700 }}>{co.f} {co.n}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{act.y}</span>
                    <span style={{ fontSize: 12, color: act.t === "vid" ? "#7DD3FC" : "#F9A8D4", background: act.t === "vid" ? "rgba(125,211,252,0.1)" : "rgba(249,168,212,0.1)", padding: "3px 10px", borderRadius: 10, fontWeight: 600 }}>{act.t === "vid" ? "🎬 影片" : "🖼️ 圖片"}</span>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>{act.title}</h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>出處：{act.src}</p>
                </div>
                <button onClick={() => sAId(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>✕ 關閉</button>
              </div>

              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, marginBottom: 14 }}>{act.desc}</p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
                {act.tags.map((tag, i) => <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.03)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.04)" }}>#{tag}</span>)}
              </div>

              {/* Section A: Media */}
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: 18, marginBottom: 18, border: "1px solid rgba(255,255,255,0.03)" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 3, height: 16, background: co.co, borderRadius: 2, display: "inline-block" }} />
                  媒體檢視 — 圖片 ／ 影片 ／ 自訂上傳
                </p>
                <MediaPanel
                  m={act}
                  cust={custs[act.id] || null}
                  onReplace={x => sCusts(p => { const n = { ...p }; if (x === null) delete n[act.id]; else n[act.id] = x; return n; })}
                />
              </div>

              {/* Section B: Text Editor */}
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.03)" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 3, height: 16, background: co.co, borderRadius: 2, display: "inline-block" }} />
                  文字編輯器 — 圖片文字 ／ 影片文字
                </p>

                {/* Toggle */}
                <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3, marginBottom: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
                  {[{ k: "img", l: "🖼️ 圖片文字", d: "梗圖疊加文字" }, { k: "vid", l: "🎬 影片文字", d: "影片字幕/旁白" }].map(o => {
                    const on = tM === o.k;
                    return (
                      <button key={o.k} onClick={() => sTM(o.k)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
                        background: on ? co.co : "transparent",
                        color: on ? "#fff" : "rgba(255,255,255,0.25)",
                        fontSize: 13, fontWeight: on ? 800 : 400,
                        transition: "all .3s",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit",
                      }}>
                        <span>{o.l}</span>
                        <span style={{ fontSize: 9, opacity: on ? 0.7 : 0.3 }}>{o.d}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Canvas + Editor */}
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 340px", minWidth: 240 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>▎即時預覽</p>
                    <TCanvas m={act} mode={tM} lines={cL} w={Math.min(cw, 380)} h={210} />
                  </div>
                  <div style={{ flex: "1 1 260px", minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: 1 }}>▎編輯文字</p>
                      <button onClick={rstTx} style={{ background: "none", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: 9, fontFamily: "inherit" }}>↺ 重置</button>
                    </div>
                    <LnEdit lines={cL} onChange={setLn} co={co.co} />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
