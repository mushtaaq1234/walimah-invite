// Walima invite v3 (2026-10-25): the text and light, shared by render3.html (the MP4) and the web page so both animate the
// same. After the BYMIRFY ballroom reel: the welcome and names projected as light on closed curtains (a gold monogram gobo
// on the floor); the names stay up as the curtains open and settle into ink over the bright hall; then one continuous glide
// down the table to the glossy board between flower stands, which changes page on the hold.
// History: v3.1 "Mr & Mrs Fyzoo", bigger writing, names stay as the curtains open; v3.2 gold foil on the key words; v3.3 the
// same stage as the table view (no jump), live text for the in-laws; v3.4 English meanings under every Arabic line, gold floor
// gobo, bloom, glints. v3.5 (~03:30, his last notes before sleeping): EVERYTHING editable except the ayahs, their
// transliteration and their meanings (the curtain names and welcome, the hosts and wording, the couple's names, day, date,
// year, time, venue, dress code, RSVP date, closing line, signature, the guest and seats); no text may ever be cut off
// (single lines shrink to fit, two-line blocks shrink to two lines, a page that is too tall scales down as a whole); flower
// stands beside the board. Only the Bismillah, its meaning and the monogram are printed into the camera moves.
// INVITE.build(stage, opts) adds the layers; INVITE.setTime(t) poses them. opts.mode: "render" (everything, for the MP4),
// "clean" (the film's own parts: the web page's background video), "web" (every editable word, over that video).
(function () {
  const FPS = 24;
  const clamp = (x) => Math.min(1, Math.max(0, x));
  const inout = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const mono = (px) => `<span class="mono" style="font-size:${px}px"><span class="m">M</span><span class="n" style="font-size:.86em;left:-.2em;top:.1em">N</span></span>`;
  // a line: kind "fix" (part of the film; printed into the camera moves on page 1) or editable; gold "g" foil, "m" gold monogram;
  // fit: "1" one line that shrinks to fit the width, "2" a block that shrinks to fit two lines
  const L = (cls, px, html, style = "", gold = "", kind = "", fit = "") => ({ cls, px, html, style, gold, kind, fit });
  // the timeline: the entrance still (0-4 s), the curtains move (4-9 s), one glide to the board (9-19 s), the hold
  const HOLD = 19; // the glide ends on the board still itself, so a 2-frame blend lands it
  const T = { inkFrom: 6.6, inkTo: 7.4, namesOut: 10.6, holdIn: HOLD - 0.08, hold: HOLD, ignite: HOLD + 0.6, p1Out: HOLD + 6.5, p2: HOLD + 7, p2Out: HOLD + 12.5, p3: HOLD + 13, p3Out: HOLD + 18.5, p4: HOLD + 19 };
  const DUR = HOLD + 26;
  // every editable word and its default (the invite maker and render3.mjs use the same keys)
  const D = {
    welcome: "Welcome to the walimah of", short1: "Mushtaaq", short2: "Nuriya",
    host: "Mr & Mrs Fyzoo", l1: "cordially invite you to the Walimah", l2: "of their son", groom: "Muhammed Mushtaaq", bride: "Nuriya",
    day: "Sunday", date: "13 December", year: "2026", time: "after Maghrib Salaah", venue1: "198 Bengal Street", venue2: "Laudium, Centurion",
    dress: "Traditional Eastern attire", rsvpby: "1 November 2026", closing: "We look forward to celebrating with you", sig: "The Fyzoo Family",
  };
  const PAGES = (v) => [
    { bg: true, t0: T.holdIn, t1: T.p1Out, lines: [
      L("ar", 40, "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "", "g", "fix"),
      L("it", 21, "In the name of Allah,<br>the Most Gracious, the Most Merciful", "margin-top:-2px;line-height:1.25", "", "fix"),
      L("", 58, mono(58), "margin:14px 0 18px", "m", "fix"),
      L("caps", 30, v.host, "font-weight:600;letter-spacing:.12em", "", "", "1"),
      L("it", 29, v.l1, "margin-top:16px", "", "", "1"),
      L("it", 29, v.l2, "", "", "", "1"),
      L("sc", 50, `<span class="anchor">${v.groom}<i class="glint" style="left:92%;top:22%"></i></span>`, "margin-top:18px", "g", "", "1"),
      L("it", 46, "&amp;", "margin:-4px 0 -8px", "g"),
      L("sc", 84, `<span class="anchor">${v.bride}<i class="glint" style="left:12%;top:30%"></i><i class="glint" style="left:70%;top:62%"></i></span>`, "", "g", "", "1"),
    ] },
    { t0: T.p2, t1: T.p2Out, lines: [
      L("caps", 24, v.day, "font-weight:600;letter-spacing:.34em;padding-left:.34em", "", "", "1"),
      L("caps", 46, v.date, "font-weight:600;letter-spacing:.04em;margin-top:6px", "g", "", "1"),
      L("caps", 32, v.year, "font-weight:600;letter-spacing:.2em;padding-left:.2em", "", "", "1"),
      L("it", 31, v.time, "margin-top:10px;max-width:440px", "", "", "2"),
      L("rule", 0, "", "margin:30px 0 28px"),
      L("caps", 30, v.venue1, "font-weight:600;letter-spacing:.06em;max-width:440px;line-height:1.25", "", "", "2"),
      L("it", 31, v.venue2, "margin-top:6px;max-width:440px", "", "", "2"),
    ] },
    { t0: T.p3, t1: T.p3Out, lines: [
      L("ar", 34, "وَخَلَقْنَاكُمْ أَزْوَاجًا"),
      L("sc", 40, "And We created you in pairs", "", "g"),
      L("caps", 14, "Surah An-Naba · 78:8", "font-weight:500;margin-top:6px;letter-spacing:.2em"),
      L("rule", 0, "", "margin:26px 0 24px"),
      L("caps", 20, "Dress code", "font-weight:600;letter-spacing:.3em;padding-left:.3em"),
      L("it", 30, v.dress, "margin-top:4px;max-width:440px", "", "", "2"),
      L("rule", 0, "", "margin:26px 0 24px"),
      ...(v.seats ? [L("it", 29, "Seats reserved for you", "font-weight:600"), L("caps", 46, v.seats, "font-weight:600;line-height:1.1;margin-bottom:14px", "g", "", "1")] : []),
      L("it", 29, "Kindly RSVP by"),
      L("caps", 28, v.rsvpby, "font-weight:600;margin-top:4px", "", "", "1"),
      ...(v.rsvp ? [L("it", 29, `to ${v.rsvp}`, "margin-top:6px;font-weight:600;max-width:440px", "", "", "2")] : []),
    ] },
    { t0: T.p4, t1: Infinity, lines: [
      L("ar", 36, "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ<br>وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ"),
      L("it", 23, "Barakallahu laka wa baraka ‘alaika<br>wa jama‘a bainakuma fi khair", "line-height:1.3;margin-top:10px;font-weight:600"),
      L("it", 21, "“May Allah bless you, shower His blessings upon you<br>and unite you both in goodness.”", "line-height:1.3;margin-top:10px"),
      L("rule", 0, "", "margin:24px 0 22px"),
      L("it", 29, v.closing, "line-height:1.25;max-width:330px", "", "", "2"),
      L("sc", 58, v.sig, "margin-top:16px", "g", "", "1"),
      L("", 44, mono(44), "margin-top:14px", "m"),
    ] },
  ];

  let S = {};
  const add = (parent, tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; parent.appendChild(e); return e; };
  // shrink an element's font until it fits: one line within maxW, or (two-line blocks) at most two lines
  const fitOne = (e, maxW) => {
    e.style.whiteSpace = "nowrap";
    const sp = document.createElement("span"); while (e.firstChild) sp.appendChild(e.firstChild); e.appendChild(sp);
    const w = sp.offsetWidth; // layout px, unaffected by the camera's zoom
    if (w > maxW) e.style.fontSize = (parseFloat(e.style.fontSize) * maxW / w).toFixed(1) + "px";
  };
  const fitTwo = (e) => {
    e.style.whiteSpace = "normal"; e.style.textWrap = "balance";
    const lh = () => parseFloat(getComputedStyle(e).lineHeight) || parseFloat(e.style.fontSize) * 1.25;
    for (let i = 0; i < 12 && e.offsetHeight > lh() * 2.15; i++) e.style.fontSize = (parseFloat(e.style.fontSize) * 0.93).toFixed(1) + "px";
  };

  function build(stage, o = {}) {
    const mode = o.mode || "render", film = mode !== "web", guest = mode !== "clean";
    const v = {}; for (const k of Object.keys(D)) v[k] = esc(o[k] ?? D[k]);
    v.seats = o.seats ? esc(o.seats) : ""; v.rsvp = o.rsvp ? esc(o.rsvp) : "";
    const w1 = stage.querySelector("#w1") || add(stage, "div", "w1");
    const w4 = stage.querySelector("#w4") || add(stage, "div", "w4");
    S = { mode, w1, w4, pages: [] };
    // the names: the same block twice, as projected light (on the curtains) and as ink (once the bright hall shows)
    S.inkWrap = add(stage, "div", "inkwrap");
    const names = (style) => {
      const b = add(style === "glow" ? w1 : S.inkWrap, "div", null, "names " + style);
      if (!guest) return b;
      if (o.to) b.innerHTML += `<div class="on it" style="top:396px;font-size:46px">Dear</div><div class="on caps two" style="top:452px;font-size:50px;letter-spacing:.1em;padding-left:.1em;font-weight:600;width:820px;left:130px;right:auto;line-height:1.2">${esc(o.to)}</div>`; // a long name may take two lines
      b.innerHTML += `<div class="on caps two" style="top:640px;font-size:30px;width:540px;left:270px;right:auto">${v.welcome}</div>
        <div class="on sc one" style="top:780px;font-size:118px;padding-right:110px">${v.short1}</div>
        <div class="on sc one" style="top:905px;font-size:118px;padding-left:150px"><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.62em">&amp;</span> ${v.short2}</div>`;
      return b;
    };
    S.glow = names("glow"); S.ink = names("ink");
    // the floor gobo: the monogram in gold light inside a thin ring (white light would vanish on the white floor)
    if (film) { S.floor = add(w1, "div", "floor"); S.floor.innerHTML = `<div class="pool"></div><div class="ring"></div><div class="ring r2"></div><div class="gm">${mono(200)}</div>`; }
    // the board: page 1's fixed lines belong to the film, everything else to the guest; hidden lines keep their places
    const board = add(w4, "div", "board");
    for (const p of PAGES(v)) {
      if (!p.bg && !guest) continue;
      const el = add(board, "div", null, "page"), inner = add(el, "div", null, "inner");
      let t = p.t0; const lines = [];
      for (const l of p.lines) {
        const e = add(inner, "div", null, "ln " + l.cls); e.innerHTML = l.html;
        e.style.cssText = (l.px ? `font-size:${l.px}px;` : "") + l.style;
        if (p.bg && (l.kind === "fix" ? !film : !guest)) e.style.visibility = "hidden";
        let over = null;
        if (l.gold && p.bg && l.kind === "fix") { e.style.position = "relative"; over = add(e, "div", null, l.gold === "g" ? "gover gold" : "gover goldm"); over.innerHTML = l.html; }
        else if (l.gold) e.classList.add(l.gold === "g" ? "gold" : "goldm");
        if (l.fit) e.dataset.fit = l.fit;
        const t0 = p.bg ? (l.kind === "fix" ? -1 : T.hold + 0.3) : t;
        lines.push({ el: e, over, glow: !!l.gold && !(p.bg && l.kind === "fix"), t0, d: p.bg ? 1.3 : 0.8 }); if (!p.bg) t += 0.2;
      }
      S.pages.push({ el, inner, t0: p.t0, t1: p.t1, bg: p.bg, lines });
    }
    // nothing may be cut off: fit each line, then scale any page that is still too tall
    for (const e of board.querySelectorAll("[data-fit]")) e.dataset.fit === "2" ? fitTwo(e) : fitOne(e, 446);
    for (const e of stage.querySelectorAll(".names .one")) fitOne(e, 820);
    for (const e of stage.querySelectorAll(".names .two")) fitTwo(e);
    for (const p of S.pages) {
      const avail = p.el.clientHeight - 84, h = p.inner.offsetHeight; // the page's height minus its top and bottom padding
      if (h > avail) p.inner.style.transform = `scale(${(avail / h).toFixed(3)})`;
    }
    S.golds = [...board.querySelectorAll(".gold")];
    S.glints = guest ? [...board.querySelectorAll(".glint")].map((g, i) => ({ g, ph: [0, 1.7, 3.1][i % 3] })) : [];
    if (film) {
      S.bloom = add(stage, "div", "bloom");
      S.fx = add(stage, "canvas", "fx"); S.fx.width = 1080; S.fx.height = 1920;
      add(stage, "div", "vig");
      let a = 20261213; const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      S.dots = Array.from({ length: 34 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, v: 10 + rnd() * 18, r: 1.2 + rnd() * 2.6, ph: rnd() * 6.28, sw: 6 + rnd() * 18 }));
    }
    setTime(0);
  }

  const GLOW = "drop-shadow(0 0 3px rgba(255,214,140,.9)) drop-shadow(0 0 12px rgba(255,196,110,.55))";
  const zoomAt = (z, cx, cy) => `translate(${cx - cx * z}px,${cy - cy * z}px) scale(${z})`;
  // the board's middle in s4f-board-flowers.png (1080-wide frame), and where the camera brings it
  const B0 = [561.8, 930.5], B1 = [540, 930];
  function setTime(t, opt = {}) {
    // the entrance: a slow push on the still, then the camera pushes on into the curtains (the names come with it)
    const z1 = 1 + 0.05 * inout(t / 4) + 0.1 * inout((t - 4) / 2.7);
    S.w1.style.transform = zoomAt(z1, 540, 900);
    S.inkWrap.style.transform = zoomAt(z1, 540, 900);
    // the board: after the glide lands, the camera moves in so the writing is big on a phone, then drifts
    const e = inout((t - T.hold) / 2.6), z4 = 1 + 0.25 * e + 0.06 * clamp((t - T.hold - 2.6) / (DUR - T.hold - 2.6));
    const cx = B0[0] + (B1[0] - B0[0]) * e, cy = B0[1] + (B1[1] - B0[1]) * e;
    S.w4.style.transform = `translate(${cx - B0[0] * z4}px,${cy - B0[1] * z4}px) scale(${z4})`;
    // the names: glowing light on the curtains, ink with a white halo once the hall shows, gone as the board comes close
    const gone = out3((t - T.namesOut) / 1), ink = inout((t - T.inkFrom) / (T.inkTo - T.inkFrom)), shimmer = 0.96 + 0.04 * Math.sin(t * 9.3) * Math.sin(t * 3.1);
    const vis = (el, val) => { el.style.opacity = val; el.style.display = val > 0 ? "block" : "none"; };
    vis(S.glow, opt.noProj ? 0 : (1 - ink) * (1 - gone) * shimmer);
    vis(S.ink, opt.noProj ? 0 : ink * (1 - gone));
    if (S.floor) { vis(S.floor, opt.noProj ? 0 : (1 - out3((t - 4) / 0.8)) * shimmer); S.floor.style.setProperty("--spin", (t * 4) + "deg"); }
    // a soft bloom of light as the curtains part onto the bright hall
    if (S.bloom) S.bloom.style.opacity = 0.32 * Math.sin(Math.PI * clamp((t - 6.3) / 1.4));
    // gold glints twinkle on the couple's names while page 1 is up
    for (const { g, ph } of S.glints) { const c = (t - T.ignite - 1 + ph) % 4.6, k = t < T.ignite + 1 || t > T.p1Out ? 0 : Math.max(0, Math.sin(Math.PI * clamp(c / 0.9))); g.style.opacity = k; g.style.transform = `translate(-50%,-50%) scale(${0.4 + 0.8 * k}) rotate(${c * 40}deg)`; }
    for (const p of S.pages) {
      const inK = p.bg ? clamp((t - p.t0) / (T.hold - T.holdIn)) : 1, o = out3((t - p.t1) / 0.5);
      p.el.style.opacity = t < p.t0 ? 0 : inK * (1 - o);
      p.el.style.filter = o > 0 ? `blur(${5 * o}px)` : "none";
      for (const l of p.lines) {
        const k = out3((t - l.t0) / l.d);
        l.el.style.opacity = k; l.el.style.transform = `translateY(${8 * (1 - k)}px)`;
        l.el.style.filter = (k < 1 ? `blur(${4 * (1 - k)}px) ` : "") + (l.glow ? GLOW : "") || "none";
        if (l.over) l.over.style.opacity = inout((t - T.ignite) / 1.2);
      }
    }
    // the gold's slow sheen: a light band crosses the foil every 5 s
    const sheen = 115 - 130 * clamp((t % 5) / 1.8);
    for (const g of S.golds) g.style.backgroundPosition = `${sheen}% 0`;
    if (S.fx) {
      const g = S.fx.getContext("2d"); g.clearRect(0, 0, 1080, 1920); g.globalCompositeOperation = "lighter";
      for (const d of S.dots) {
        const y = ((d.y - d.v * t) % 2000 + 2000) % 2000 - 40, x = d.x + Math.sin(t * 0.5 + d.ph) * d.sw;
        const a = 0.10 + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.5 + d.ph * 3));
        const gr = g.createRadialGradient(x, y, 0, x, y, d.r * 4);
        gr.addColorStop(0, `rgba(255,248,240,${a})`); gr.addColorStop(1, "rgba(255,240,230,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, d.r * 4, 0, 6.2832); g.fill();
      }
    }
  }
  window.INVITE = { FPS, DUR, T, D, build, setTime };
})();
