// The guest's own invite as a real video file, made on the phone (2026-10-25 ~12:00, Mushtaaq: "on the link we sending to
// the inlaws and mummy make sure its a download video button and preview so they send the video not a link to guests").
// No server: the page plays the film (invite-bg.mp4, with the music) and anim3.js poses every word on a hidden 1080 x 1920
// stage; each video frame is painted onto a 720 x 1280 canvas (the film, then every visible word at the place, size, colour,
// gold, glow and fade the stage gives it), and the canvas plus the film's sound are recorded with the browser's own
// MediaRecorder (MP4 where the phone can, otherwise WebM). It takes as long as the film (45 s) and the screen must stay open.
//   MAKER.prime()                  call first thing inside the button's tap (unlocks sound on phones)
//   MAKER.record(opts, onProgress) -> Promise<{ blob, type, ext }>
(function () {
  const W = 720, H = 1280, K = W / 1080;
  const GOLD = [[0, "#6b4b14"], [0.34, "#94691f"], [0.46, "#c49a45"], [0.5, "#e2c071"], [0.54, "#c49a45"], [0.66, "#94691f"], [1, "#6b4b14"]];
  let stage, video, ac, dest, monoDark, monoGold;

  function setup() {
    if (stage) return;
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-30000px;top:0;width:1080px;height:1920px;overflow:hidden;pointer-events:none";
    stage = document.createElement("div"); stage.id = "stage"; holder.appendChild(stage); document.body.appendChild(holder);
    video = document.createElement("video");
    Object.assign(video, { src: "invite-bg.mp4", preload: "auto", playsInline: true, crossOrigin: "anonymous" });
    video.setAttribute("playsinline", ""); video.setAttribute("webkit-playsinline", "");
    document.body.appendChild(Object.assign(video, { style: "position:fixed;left:-30000px;width:2px;height:2px" }));
  }
  // inside the user's tap: create the sound path and let the film play with sound later (phones need a tap for both)
  function prime() {
    setup();
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      dest = ac.createMediaStreamDestination();
      ac.createMediaElementSource(video).connect(dest); // to the recording only, so the phone stays quiet while it records
    }
    ac.resume();
    const p = video.play(); if (p && p.then) p.then(() => video.pause()).catch(() => {});
  }
  const tint = (img, gold) => {
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext("2d");
    g.drawImage(img, 0, 0); g.globalCompositeOperation = "source-in";
    if (gold) { const gr = g.createLinearGradient(0, 0, c.width, c.height); for (const [o, col] of GOLD) gr.addColorStop(o, col); g.fillStyle = gr; } else g.fillStyle = "#6a625c";
    g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = "multiply"; g.drawImage(img, 0, 0); g.globalCompositeOperation = "destination-in"; g.drawImage(img, 0, 0);
    return c;
  };
  async function loadMono() {
    if (monoDark) return;
    const img = new Image(); img.src = "monogram.png"; await img.decode();
    monoDark = tint(img, false); monoGold = tint(img, true);
  }
  // what to paint: every word, monogram, rule and glint on the stage
  let items = [];
  function collect() {
    items = [];
    for (const e of stage.querySelectorAll(".names .on, #board .ln, #board .glint")) {
      if (e.classList.contains("glint")) { items.push({ e, kind: "glint" }); continue; }
      const m = e.querySelector(".monoimg");
      if (m) { items.push({ e: m, kind: "mono", gold: !!e.closest(".goldm") }); continue; }
      if (e.classList.contains("rule")) { items.push({ e, kind: "rule" }); continue; }
      if (!e.textContent.trim() || e.textContent.trim() === " ") continue;
      items.push({ e, kind: "text", gold: e.classList.contains("gold"), glow: !!e.closest(".names.glow"), ink: !!e.closest(".names.ink"),
        ar: e.classList.contains("ar"), two: e.dataset.fit === "2" || e.classList.contains("two"), br: !!e.querySelector("br") });
    }
  }
  // opacity, blur and visibility as the stage shows them (through every parent)
  function look(e) {
    let a = 1, blur = 0;
    for (let n = e; n && n !== stage; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none") return null;
      a *= parseFloat(cs.opacity);
      const m = /blur\(([\d.]+)px\)/.exec(cs.filter || ""); if (m) blur += parseFloat(m[1]);
    }
    if (getComputedStyle(e).visibility === "hidden" || a < 0.01) return null;
    return { a, blur };
  }
  const canFilter = "filter" in CanvasRenderingContext2D.prototype, canSpace = "letterSpacing" in CanvasRenderingContext2D.prototype;
  function wrap2(g, text, maxW) {
    if (g.measureText(text).width <= maxW) return [text];
    const words = text.split(/\s+/); let best = [text], score = Infinity;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(" "), b = words.slice(i).join(" "), s = Math.max(g.measureText(a).width, g.measureText(b).width); if (s < score) { score = s; best = [a, b]; } }
    return best;
  }
  function paint(g, t) {
    INVITE.setTime(t);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; if (canFilter) g.filter = "none"; g.shadowBlur = 0; g.shadowColor = "transparent";
    g.drawImage(video, 0, 0, W, H);
    const sr = stage.getBoundingClientRect();
    for (const it of items) {
      const l = look(it.e); if (!l) continue;
      const r = it.e.getBoundingClientRect(), ow = it.e.offsetWidth; if (!ow || !r.width) continue;
      const s = (r.width / ow) * K, x = (r.left - sr.left) * K, y = (r.top - sr.top) * K, w = r.width * K, h = r.height * K;
      g.save(); g.globalAlpha = l.a; if (canFilter && l.blur > 0.2) g.filter = `blur(${(l.blur * s).toFixed(1)}px)`;
      if (it.kind === "glint") {
        const cx = x + w / 2, cy = y + h / 2, rr = w / 2, gr = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
        gr.addColorStop(0, "rgba(255,250,230,1)"); gr.addColorStop(0.25, "rgba(255,230,170,.8)"); gr.addColorStop(1, "rgba(255,220,150,0)");
        g.globalCompositeOperation = "lighter"; g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, rr, 0, 6.2832); g.fill();
        g.fillStyle = "rgba(255,244,210,.9)"; g.fillRect(cx - rr, cy - 0.6, rr * 2, 1.2); g.fillRect(cx - 0.6, cy - rr, 1.2, rr * 2);
      } else if (it.kind === "mono") {
        if (it.gold) { g.shadowColor = "rgba(255,200,120,.75)"; g.shadowBlur = 10 * s; }
        g.drawImage(it.gold ? monoGold : monoDark, x, y, w, h);
      } else if (it.kind === "rule") {
        const cy = y + h / 2, gr = g.createLinearGradient(x, cy, x + w, cy);
        gr.addColorStop(0, "rgba(141,129,120,0)"); gr.addColorStop(0.5, "rgba(141,129,120,1)"); gr.addColorStop(1, "rgba(141,129,120,0)");
        g.fillStyle = gr; g.fillRect(x, cy - 0.5, w, 1); g.fillStyle = "#8d8178"; g.translate(x + w / 2, cy); g.rotate(Math.PI / 4); g.fillRect(-3 * s, -3 * s, 6 * s, 6 * s);
      } else {
        const cs = getComputedStyle(it.e), fs = parseFloat(cs.fontSize);
        const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
        const lh = cs.lineHeight === "normal" ? fs * 1.25 : parseFloat(cs.lineHeight);
        g.font = `${cs.fontStyle} ${cs.fontWeight} ${(fs * s).toFixed(2)}px ${cs.fontFamily}`;
        if (canSpace) g.letterSpacing = cs.letterSpacing === "normal" ? "0px" : `${(parseFloat(cs.letterSpacing) * s).toFixed(2)}px`;
        g.direction = it.ar ? "rtl" : "ltr"; g.textAlign = "center"; g.textBaseline = "middle";
        const raw = it.br ? it.e.innerText : it.e.textContent.replace(/\s+/g, " ").trim();
        const contentW = (it.e.clientWidth - pl - pr) * s;
        // how many lines the stage itself shows decides the split (canvas widths differ slightly from the page's)
        const domLines = Math.max(1, Math.round((it.e.clientHeight - pt - pb) / lh));
        const lines = it.br ? raw.split("\n").map((q) => q.trim()).filter(Boolean) : it.two && domLines > 1 ? wrap2(g, raw, 0) : [raw];
        const cx = x + (pl * s) + contentW / 2, top = y + pt * s, blockH = (h - (pt + pb) * s), lineH = lh * s, y0 = top + (blockH - lines.length * lineH) / 2;
        if (it.gold) {
          const tw = Math.max(...lines.map((q) => g.measureText(q).width)), gr = g.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
          for (const [o, col] of GOLD) gr.addColorStop(o, col);
          g.fillStyle = gr; g.shadowColor = "rgba(255,196,110,.6)"; g.shadowBlur = 10 * s;
        } else if (it.glow) { g.globalCompositeOperation = "screen"; g.fillStyle = "rgba(255,250,246,.95)"; g.shadowColor = "rgba(255,240,235,.9)"; g.shadowBlur = 16 * s; }
        else if (it.ink) { g.fillStyle = "#6b3a42"; g.shadowColor = "rgba(255,255,255,.95)"; g.shadowBlur = 14 * s; }
        else g.fillStyle = cs.color;
        // a single line mixing fonts (the italic "&" before Nuriya on the curtains) is drawn run by run
        const runs = [];
        if (lines.length === 1 && !it.ar) {
          const tw = document.createTreeWalker(it.e, NodeFilter.SHOW_TEXT);
          for (let n = tw.nextNode(); n; n = tw.nextNode()) {
            const pcs = getComputedStyle(n.parentElement), f = `${pcs.fontStyle} ${pcs.fontWeight} ${(parseFloat(pcs.fontSize) * s).toFixed(2)}px ${pcs.fontFamily}`;
            const text = n.nodeValue.replace(/\s+/g, " "); if (!text.trim() && !runs.length) continue;
            if (runs.length && runs[runs.length - 1].f === f) runs[runs.length - 1].text += text; else runs.push({ f, text });
          }
        }
        if (runs.length > 1) {
          runs[0].text = runs[0].text.replace(/^\s+/, ""); runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, "");
          let total = 0; for (const u of runs) { g.font = u.f; u.w = g.measureText(u.text).width; total += u.w; }
          let px = cx - total / 2; g.textAlign = "left";
          for (const u of runs) { g.font = u.f; g.fillText(u.text, px, y0 + 0.5 * lineH); px += u.w; }
        } else lines.forEach((q, i) => g.fillText(q, cx, y0 + (i + 0.5) * lineH));
      }
      g.restore();
    }
  }
  const pickType = () => ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    .find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
  async function record(opts, onProgress = () => {}) {
    setup();
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error("This phone's browser can't make videos. Please use Chrome or Safari.");
    await Promise.all(["40px 'Scheherazade New'", "40px 'Pinyon Script'", "italic 500 20px 'Cormorant Garamond'", "italic 600 20px 'Cormorant Garamond'", "600 16px Cinzel", "500 16px Cinzel"].map((f) => document.fonts.load(f, "بسم Mushtaaq M")));
    await loadMono();
    stage.innerHTML = ""; INVITE.build(stage, { ...opts, mode: "web" }); collect();
    if (video.readyState < 2) await new Promise((r) => video.addEventListener("loadeddata", r, { once: true }));
    video.pause(); video.currentTime = 0; await new Promise((r) => (video.seeking ? video.addEventListener("seeked", r, { once: true }) : r()));
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H; const g = canvas.getContext("2d");
    paint(g, 0);
    const type = pickType();
    const stream = new MediaStream([...canvas.captureStream(24).getVideoTracks(), ...(dest ? dest.stream.getAudioTracks() : [])]);
    const rec = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), videoBitsPerSecond: 3500000, audioBitsPerSecond: 128000 });
    const chunks = []; rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise((r) => (rec.onstop = r));
    rec.start(1000);
    if (ac) await ac.resume();
    video.muted = false; await video.play();
    await new Promise((resolve) => {
      const step = () => { paint(g, video.currentTime); onProgress(Math.min(1, video.currentTime / INVITE.DUR));
        if (video.ended) return resolve(); video.requestVideoFrameCallback ? video.requestVideoFrameCallback(step) : requestAnimationFrame(step); };
      video.addEventListener("ended", resolve, { once: true }); step();
    });
    paint(g, INVITE.DUR); await new Promise((r) => setTimeout(r, 400));
    rec.stop(); await stopped;
    const t = (rec.mimeType || type || "video/webm").split(";")[0];
    return { blob: new Blob(chunks, { type: t }), type: t, ext: t.includes("mp4") ? "mp4" : "webm" };
  }
  window.MAKER = { prime, record };
})();
