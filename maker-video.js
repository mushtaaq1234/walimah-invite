// The guest's own invite as a real video file, made on the phone (2026-10-25 ~12:00, Mushtaaq: "on the link we sending to
// the inlaws and mummy make sure its a download video button and preview so they send the video not a link to guests").
// No server: anim3.js poses every word on a hidden 1080 x 1920 stage, and each frame of the film (invite-bg.mp4) is painted
// onto a 720 x 1280 canvas with every visible word at the place, size, colour, gold, glow and fade the stage gives it.
// v3.10 (2026-10-26, Mushtaaq: "super laggy... make it super smooth and quality"): recording the screen as it played (the
// old way) dropped to about 15 frames a second on a mid-range phone, with stalls of a quarter second, because the phone
// couldn't paint a frame in 1/24 s. Now, where the browser has WebCodecs (Chrome on Android, Safari on iPhone 16.4+), the
// film is decoded frame by frame, each frame is painted and encoded at exactly 24 fps, and the film's own music is copied
// in untouched (mp4-muxer.js writes the MP4). It can't stutter, however slow the phone; a slow phone just takes longer.
// It's made in full HD (1080 x 1920, from invite-bg-hd.mp4) where the phone can, because WhatsApp re-compresses every video
// it sends (he asked 26 Oct that guests get it in HD): the sharper the file, the better WhatsApp's HD copy.
// Other browsers fall back to the old real-time recording. The words are measured once, not every frame.
//   MAKER.prime()                  call first thing inside the button's tap (unlocks sound on phones, for the fallback)
//   MAKER.record(opts, onProgress) -> Promise<{ blob, type, ext }>
(function () {
  // full HD where the phone can encode it (WhatsApp's HD setting then has the most to work with), else 720 x 1280 (~14 MB)
  const FPS = 24, SIZES = [{ w: 1080, h: 1920, film: "invite-bg-hd.mp4", bitrate: 3600000 }, { w: 720, h: 1280, film: "invite-bg.mp4", bitrate: 2400000 }];
  let W = 720, H = 1280, K = W / 1080;
  const use = (z) => { W = z.w; H = z.h; K = W / 1080; };
  const GOLD = [[0, "#6b4b14"], [0.34, "#94691f"], [0.46, "#c49a45"], [0.5, "#e2c071"], [0.54, "#c49a45"], [0.66, "#94691f"], [1, "#6b4b14"]];
  let stage, video, ac, dest, monoDark, monoGold;

  function setup() {
    if (stage) return;
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-30000px;top:0;width:1080px;height:1920px;overflow:hidden;pointer-events:none";
    stage = document.createElement("div"); stage.id = "stage"; holder.appendChild(stage); document.body.appendChild(holder);
    video = document.createElement("video");
    Object.assign(video, { preload: "auto", playsInline: true, crossOrigin: "anonymous" });
    video.setAttribute("playsinline", ""); video.setAttribute("webkit-playsinline", "");
    document.body.appendChild(Object.assign(video, { style: "position:fixed;left:-30000px;width:2px;height:2px" }));
  }
  const FILM = "invite-bg.mp4";
  let exactBroken = false; // set if the exact way failed on this phone: the next tap primes the live way properly
  const exactCapable = () => !exactBroken && !!(window.VideoEncoder && window.VideoDecoder && window.VideoFrame && window.EncodedVideoChunk && window.Mp4Muxer);
  // inside the user's tap: create the sound path and let the film play with sound later (phones need a tap for both); the
  // exact way needs neither, so it skips this and the film is downloaded once
  function prime() {
    setup();
    if (exactCapable()) return;
    if (!video.src) video.src = FILM;
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
  // what to paint: every word, monogram, rule and glint on the stage; everything that never changes is measured here once
  let items = [];
  function collect() {
    items = [];
    for (const e of stage.querySelectorAll(".names .on, #board .ln, #board .glint")) {
      let it;
      if (e.classList.contains("glint")) it = { e, kind: "glint" };
      else if (e.querySelector(".monoimg")) it = { e: e.querySelector(".monoimg"), kind: "mono", gold: !!e.closest(".goldm") };
      else if (e.classList.contains("rule")) it = { e, kind: "rule" };
      else {
        if (!e.textContent.trim() || e.textContent.trim() === " ") continue;
        it = { e, kind: "text", gold: e.classList.contains("gold"), glow: !!e.closest(".names.glow"), ink: !!e.closest(".names.ink"),
          ar: e.classList.contains("ar"), two: e.dataset.fit === "2" || e.classList.contains("two"), br: !!e.querySelector("br") };
        const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize);
        Object.assign(it, { fs, fStyle: cs.fontStyle, fWeight: cs.fontWeight, fFamily: cs.fontFamily, color: cs.color,
          ls: cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing),
          pl: parseFloat(cs.paddingLeft), pr: parseFloat(cs.paddingRight), pt: parseFloat(cs.paddingTop), pb: parseFloat(cs.paddingBottom),
          lh: cs.lineHeight === "normal" ? fs * 1.25 : parseFloat(cs.lineHeight), cw: e.clientWidth, ch: e.clientHeight,
          raw: it.br ? e.innerText : e.textContent.replace(/\s+/g, " ").trim() });
        // a single line mixing fonts (the italic "&" before Nuriya on the curtains) is drawn run by run
        it.runs = [];
        if (!it.ar && !it.br) {
          const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
          for (let n = tw.nextNode(); n; n = tw.nextNode()) {
            const p = getComputedStyle(n.parentElement), key = `${p.fontStyle} ${p.fontWeight} ${p.fontFamily} ${p.fontSize}`;
            const text = n.nodeValue.replace(/\s+/g, " "); if (!text.trim() && !it.runs.length) continue;
            const last = it.runs[it.runs.length - 1];
            if (last && last.key === key) last.text += text; else it.runs.push({ key, text, st: p.fontStyle, wt: p.fontWeight, fam: p.fontFamily, fs: parseFloat(p.fontSize) });
          }
          if (it.runs.length > 1) { it.runs[0].text = it.runs[0].text.replace(/^\s+/, ""); it.runs[it.runs.length - 1].text = it.runs[it.runs.length - 1].text.replace(/\s+$/, ""); }
        }
      }
      // the parents whose opacity and blur reach this item, and whether the stage hides it for good
      it.chain = []; for (let n = it.e; n && n !== stage; n = n.parentElement) it.chain.push(n);
      it.hidden = getComputedStyle(it.e).visibility === "hidden";
      items.push(it);
    }
  }
  // opacity and blur as the stage shows them right now (through every parent)
  function look(it) {
    let a = 1, blur = 0;
    for (const n of it.chain) {
      const cs = getComputedStyle(n);
      if (cs.display === "none") return null;
      a *= parseFloat(cs.opacity); if (a < 0.01) return null;
      const f = cs.filter; if (f && f !== "none") { const m = /blur\(([\d.]+)px\)/.exec(f); if (m) blur += parseFloat(m[1]); }
    }
    return { a, blur };
  }
  const canFilter = "filter" in CanvasRenderingContext2D.prototype, canSpace = "letterSpacing" in CanvasRenderingContext2D.prototype;
  function wrap2(g, text) {
    const words = text.split(/\s+/); let best = [text], score = Infinity;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(" "), b = words.slice(i).join(" "), s = Math.max(g.measureText(a).width, g.measureText(b).width); if (s < score) { score = s; best = [a, b]; } }
    return best;
  }
  // one frame: the film's picture (src: the <video> or a decoded VideoFrame), then every visible word at time t
  function paint(g, t, src) {
    INVITE.setTime(t);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; if (canFilter) g.filter = "none"; g.shadowBlur = 0; g.shadowColor = "transparent";
    g.drawImage(src, 0, 0, W, H);
    const sr = stage.getBoundingClientRect();
    for (const it of items) {
      if (it.hidden) continue;
      const l = look(it); if (!l) continue;
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
        g.font = `${it.fStyle} ${it.fWeight} ${(it.fs * s).toFixed(2)}px ${it.fFamily}`;
        if (canSpace) g.letterSpacing = `${(it.ls * s).toFixed(2)}px`;
        g.direction = it.ar ? "rtl" : "ltr"; g.textAlign = "center"; g.textBaseline = "middle";
        const contentW = (it.cw - it.pl - it.pr) * s;
        // how many lines the stage itself shows decides the split (canvas widths differ slightly from the page's); measured once
        if (!it.lines) {
          const domLines = Math.max(1, Math.round((it.ch - it.pt - it.pb) / it.lh));
          it.lines = it.br ? it.raw.split("\n").map((q) => q.trim()).filter(Boolean) : it.two && domLines > 1 && g.measureText(it.raw).width > 0 ? wrap2(g, it.raw) : [it.raw];
        }
        const lines = it.lines;
        const cx = x + (it.pl * s) + contentW / 2, top = y + it.pt * s, blockH = (h - (it.pt + it.pb) * s), lineH = it.lh * s, y0 = top + (blockH - lines.length * lineH) / 2;
        if (it.gold) {
          const tw = Math.max(...lines.map((q) => g.measureText(q).width)), gr = g.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
          for (const [o, col] of GOLD) gr.addColorStop(o, col);
          g.fillStyle = gr; g.shadowColor = "rgba(255,196,110,.6)"; g.shadowBlur = 10 * s;
        } else if (it.glow) { g.globalCompositeOperation = "screen"; g.fillStyle = "rgba(255,250,246,.95)"; g.shadowColor = "rgba(255,240,235,.9)"; g.shadowBlur = 16 * s; }
        else if (it.ink) { g.fillStyle = "#47295a"; g.shadowColor = "rgba(255,255,255,.6)"; g.shadowBlur = 10 * s; }
        else g.fillStyle = it.color;
        if (lines.length === 1 && it.runs.length > 1) {
          let total = 0; for (const u of it.runs) { g.font = `${u.st} ${u.wt} ${(u.fs * s).toFixed(2)}px ${u.fam}`; u.w = g.measureText(u.text).width; total += u.w; }
          let px = cx - total / 2; g.textAlign = "left";
          for (const u of it.runs) { g.font = `${u.st} ${u.wt} ${(u.fs * s).toFixed(2)}px ${u.fam}`; g.fillText(u.text, px, y0 + 0.5 * lineH); px += u.w; }
        } else lines.forEach((q, i) => g.fillText(q, cx, y0 + (i + 0.5) * lineH));
      }
      g.restore();
    }
  }

  // ---- the exact way: decode the film, paint, encode at exactly 24 fps, keep the film's own music --------------------------
  // a small reader for invite-bg.mp4 (one video and one audio track): where every sample sits and when it plays
  function demux(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf);
    const kids = (o, end) => { const m = {}; while (o + 8 <= end) { let size = dv.getUint32(o), h = 8; if (size === 1) { size = Number(dv.getBigUint64(o + 8)); h = 16; } else if (size === 0) size = end - o;
      const t = String.fromCharCode(u8[o + 4], u8[o + 5], u8[o + 6], u8[o + 7]); (m[t] = m[t] || []).push([o + h, o + size]); o += size; } return m; };
    const full = (b) => b[0] + 4; // skip version + flags
    const out = {};
    const top = kids(0, u8.length);
    for (const tr of kids(...top.moov[0]).trak) {
      const trak = kids(...tr), mdia = kids(...trak.mdia[0]), stbl = kids(...kids(...mdia.minf[0]).stbl[0]);
      const handler = String.fromCharCode(...u8.subarray(full(mdia.hdlr[0]) + 4, full(mdia.hdlr[0]) + 8));
      const md = mdia.mdhd[0][0], timescale = u8[md] === 1 ? dv.getUint32(md + 20) : dv.getUint32(md + 12);
      let shift = 0; // the edit list's start (encoder delay)
      if (trak.edts) { const el = kids(...trak.edts[0]).elst; if (el) { const o = el[0][0]; if (dv.getUint32(o + 4)) shift = u8[o] === 1 ? Number(dv.getBigInt64(o + 16)) : dv.getInt32(o + 12); } }
      const u32s = (box, at, n, step = 4) => Array.from({ length: n }, (_, i) => dv.getUint32(at + i * step));
      const sz = full(stbl.stsz[0]), fixed = dv.getUint32(sz), count = dv.getUint32(sz + 4);
      const sizes = fixed ? Array(count).fill(fixed) : u32s(null, sz + 8, count);
      let offsets;
      if (stbl.stco) { const o = full(stbl.stco[0]); offsets = u32s(null, o + 4, dv.getUint32(o)); }
      else { const o = full(stbl.co64[0]); offsets = Array.from({ length: dv.getUint32(o) }, (_, i) => Number(dv.getBigUint64(o + 4 + i * 8))); }
      const sc = full(stbl.stsc[0]), scn = dv.getUint32(sc), stsc = Array.from({ length: scn }, (_, i) => [dv.getUint32(sc + 4 + i * 12), dv.getUint32(sc + 8 + i * 12)]);
      const samples = []; let e = 0;
      for (let c = 0; c < offsets.length && samples.length < count; c++) {
        while (e + 1 < stsc.length && stsc[e + 1][0] <= c + 1) e++;
        let off = offsets[c]; for (let k = 0; k < stsc[e][1] && samples.length < count; k++) { const size = sizes[samples.length]; samples.push({ off, size }); off += size; }
      }
      const st = full(stbl.stts[0]); let dts = 0, si = 0;
      for (let i = 0, n = dv.getUint32(st); i < n; i++) { const c = dv.getUint32(st + 4 + i * 8), d = dv.getUint32(st + 8 + i * 8); for (let k = 0; k < c && si < count; k++, si++) { samples[si].dts = dts; samples[si].dur = d; dts += d; } }
      for (const s of samples) s.cts = s.dts;
      if (stbl.ctts) { const ct = full(stbl.ctts[0]); si = 0; for (let i = 0, n = dv.getUint32(ct); i < n; i++) { const c = dv.getUint32(ct + 4 + i * 8), o = dv.getInt32(ct + 8 + i * 8); for (let k = 0; k < c && si < count; k++, si++) samples[si].cts = samples[si].dts + o; } }
      if (stbl.stss) { const ss = full(stbl.stss[0]); for (const s of samples) s.key = false; for (let i = 0, n = dv.getUint32(ss); i < n; i++) { const k = samples[dv.getUint32(ss + 4 + i * 4) - 1]; if (k) k.key = true; } }
      else for (const s of samples) s.key = true;
      const us = (v) => Math.round((v * 1e6) / timescale);
      for (const s of samples) { s.pts = us(s.cts - shift); s.durUs = us(s.dur); s.data = u8.subarray(s.off, s.off + s.size); }
      // the sample description: the codec and its setup bytes
      const sd = full(stbl.stsd[0]) + 4, fmt = String.fromCharCode(u8[sd + 4], u8[sd + 5], u8[sd + 6], u8[sd + 7]), body = sd + 8;
      if (handler === "vide" && (fmt === "avc1" || fmt === "avc3")) {
        const avcC = kids(body + 78, sd + dv.getUint32(sd)).avcC[0], desc = u8.slice(avcC[0], avcC[1]);
        const hex = (b) => b.toString(16).padStart(2, "0");
        out.video = { codec: `avc1.${hex(desc[1])}${hex(desc[2])}${hex(desc[3])}`, description: desc, width: dv.getUint16(body + 24), height: dv.getUint16(body + 26), samples };
      } else if (handler === "soun" && fmt === "mp4a") {
        const esds = kids(body + 28, sd + dv.getUint32(sd)).esds[0]; let p = full(esds), asc = null;
        const len = () => { let n = 0; for (let i = 0; i < 4; i++) { const b = u8[p++]; n = (n << 7) | (b & 0x7f); if (!(b & 0x80)) break; } return n; };
        while (p < esds[1] && !asc) {
          const tag = u8[p++], n = len();
          if (tag === 3) { const fl = u8[p + 2]; p += 3; if (fl & 0x80) p += 2; if (fl & 0x40) p += 1 + u8[p]; if (fl & 0x20) p += 2; }
          else if (tag === 4) p += 13;
          else if (tag === 5) asc = u8.slice(p, p + n);
          else p += n;
        }
        out.audio = { channels: dv.getUint16(body + 16), sampleRate: dv.getUint32(body + 24) >>> 16, asc, samples };
      }
    }
    return out;
  }
  const next = () => new Promise((r) => setTimeout(r, 0));
  // the sizes this phone can encode, best first, each with the first H.264 profile it accepts
  async function encoderConfigs() {
    const out = []; if (!exactCapable()) return out;
    for (const z of SIZES) for (const codec of ["avc1.640028", "avc1.4d0028", "avc1.42002a", "avc1.42001f"]) {
      const c = { codec, width: z.w, height: z.h, bitrate: z.bitrate, framerate: FPS, avc: { format: "avc" } };
      try { if ((await VideoEncoder.isConfigSupported(c)).supported) { out.push({ c, z }); break; } } catch (e) {}
    }
    return out;
  }
  async function recordExact(enc, filmUrl, onProgress) {
    const res = await fetch(filmUrl); if (!res.ok) throw new Error(filmUrl + " " + res.status);
    const film = demux(await res.arrayBuffer()), V = film.video, A = film.audio;
    if (!V) throw new Error("no film track");
    const dcfg = { codec: V.codec, codedWidth: V.width, codedHeight: V.height, description: V.description };
    if (!(await VideoDecoder.isConfigSupported(dcfg)).supported) throw new Error("this phone can't read the film");
    const N = Math.round(INVITE.DUR * FPS), canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const g = canvas.getContext("2d", { alpha: false });
    const target = new Mp4Muxer.ArrayBufferTarget();
    const muxer = new Mp4Muxer.Muxer({ target, video: { codec: "avc", width: W, height: H, frameRate: FPS },
      ...(A && A.asc ? { audio: { codec: "aac", numberOfChannels: A.channels, sampleRate: A.sampleRate } } : {}), fastStart: "in-memory", firstTimestampBehavior: "offset" });
    let fail = null, wake = null; const poke = () => { if (wake) { const w = wake; wake = null; w(); } };
    const encoder = new VideoEncoder({ output: (chunk, meta) => { try { muxer.addVideoChunk(chunk, meta); } catch (e) { fail = e; } poke(); }, error: (e) => { fail = e; poke(); } });
    encoder.configure(enc);
    // the film's frames come out in the order they play; a few are kept ready, never more (each one holds a picture)
    const frames = []; let fed = 0, flushing = null, done = false;
    const decoder = new VideoDecoder({ output: (f) => { let i = frames.length; while (i && frames[i - 1].timestamp > f.timestamp) i--; frames.splice(i, 0, f); poke(); }, error: (e) => { fail = e; poke(); } });
    decoder.configure(dcfg);
    const feed = () => {
      while (fed < V.samples.length && decoder.decodeQueueSize < 4 && frames.length < 6) { const s = V.samples[fed++]; decoder.decode(new EncodedVideoChunk({ type: s.key ? "key" : "delta", timestamp: s.pts, duration: s.durUs, data: s.data })); }
      if (fed === V.samples.length && !flushing) flushing = decoder.flush().then(() => { done = true; poke(); }, (e) => { fail = e; poke(); });
    };
    decoder.ondequeue = feed;
    // the music: the film's own AAC, copied as it is (the encoder's warm-up frame before 0 s is left out)
    const aud = A && A.asc ? A.samples.filter((s) => s.pts >= 0 && s.pts < INVITE.DUR * 1e6) : [];
    const audioMeta = A && A.asc ? { decoderConfig: { codec: "mp4a.40.2", numberOfChannels: A.channels, sampleRate: A.sampleRate, description: A.asc } } : null;
    let ai = 0;
    try {
      for (let i = 0; i < N; i++) {
        const ts = Math.round((i * 1e6) / FPS);
        // the film frame for this moment: the newest one that has started by now
        for (;;) {
          if (fail) throw fail;
          feed();
          while (frames.length > 1 && frames[1].timestamp <= ts + 1000) frames.shift().close();
          if (frames.length > 1 || (frames.length && (done || frames[0].timestamp > ts + 1000))) break;
          if (done && !frames.length) throw new Error("the film ended early");
          await new Promise((r) => { wake = r; setTimeout(poke, 100); });
        }
        paint(g, i / FPS, frames[0]);
        const vf = new VideoFrame(canvas, { timestamp: ts, duration: Math.round(1e6 / FPS) });
        encoder.encode(vf, { keyFrame: i % (FPS * 2) === 0 }); vf.close();
        while (ai < aud.length && aud[ai].pts < ts + 1e6 / FPS) { const s = aud[ai]; muxer.addAudioChunkRaw(s.data, "key", s.pts, s.durUs, ai === 0 ? audioMeta : undefined); ai++; }
        while (encoder.encodeQueueSize > 2 && !fail) await new Promise((r) => { wake = r; setTimeout(poke, 50); });
        onProgress((i + 1) / N);
        if (i % 4 === 3) await next(); // let the progress bar draw
      }
      await encoder.flush();
      if (fail) throw fail;
    } finally {
      for (const f of frames) f.close(); frames.length = 0;
      try { decoder.close(); } catch (e) {} try { encoder.close(); } catch (e) {}
    }
    muxer.finalize();
    return { blob: new Blob([target.buffer], { type: "video/mp4" }), type: "video/mp4", ext: "mp4" };
  }

  // ---- the fallback: record the canvas in real time while the film plays (older browsers) --------------------------------
  const pickType = () => ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    .find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
  async function recordLive(onProgress) {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error("This phone's browser can't make videos. Please use Chrome or Safari.");
    if (!video.src) { video.src = FILM; video.load(); }
    if (video.readyState < 2) await new Promise((r) => video.addEventListener("loadeddata", r, { once: true }));
    video.pause(); video.currentTime = 0; await new Promise((r) => (video.seeking ? video.addEventListener("seeked", r, { once: true }) : r()));
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H; const g = canvas.getContext("2d");
    paint(g, 0, video);
    const type = pickType();
    const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...(dest ? dest.stream.getAudioTracks() : [])]);
    const rec = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), videoBitsPerSecond: 3500000, audioBitsPerSecond: 128000 });
    const chunks = []; rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise((r) => (rec.onstop = r));
    rec.start(1000);
    if (ac) await ac.resume();
    video.muted = false; await video.play();
    await new Promise((resolve) => {
      const step = () => { paint(g, video.currentTime, video); onProgress(Math.min(1, video.currentTime / INVITE.DUR));
        if (video.ended) return resolve(); video.requestVideoFrameCallback ? video.requestVideoFrameCallback(step) : requestAnimationFrame(step); };
      video.addEventListener("ended", resolve, { once: true }); step();
    });
    paint(g, INVITE.DUR, video); await new Promise((r) => setTimeout(r, 400));
    rec.stop(); await stopped;
    const t = (rec.mimeType || type || "video/webm").split(";")[0];
    return { blob: new Blob(chunks, { type: t }), type: t, ext: t.includes("mp4") ? "mp4" : "webm" };
  }

  async function record(opts, onProgress = () => {}) {
    setup();
    await Promise.all(["40px 'Scheherazade New'", "40px 'Pinyon Script'", "italic 500 20px 'Cormorant Garamond'", "italic 600 20px 'Cormorant Garamond'", "600 16px Cinzel", "500 16px Cinzel"].map((f) => document.fonts.load(f, "بسم Mushtaaq M")));
    await loadMono();
    stage.innerHTML = ""; INVITE.build(stage, { ...opts, mode: "web" }); collect();
    const ways = await encoderConfigs();
    for (const { c, z } of ways) {
      try { use(z); const r = await recordExact(c, z.film, onProgress); MAKER.last = "exact " + z.w + "x" + z.h; return r; }
      catch (e) { console.warn("exact video at " + z.w + "x" + z.h + " failed:", e); onProgress(0); }
    }
    if (ways.length) exactBroken = true;
    use(SIZES[1]); MAKER.last = "live";
    return recordLive(onProgress);
  }
  window.MAKER = { prime, record, last: "" };
})();
