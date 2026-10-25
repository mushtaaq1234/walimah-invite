// Walima invite v3 (2026-10-25): the text and light, shared by render3.html (the MP4) and the web page so both animate the
// same. After the BYMIRFY ballroom reel: the welcome and names projected as light on closed curtains (a monogram on the
// floor); the names stay up as the curtains open and settle into ink over the bright hall; then one continuous glide down
// the table to the glossy board, whose invitation is printed on it from the start and changes page on the hold.
// v3.1 (~02:15): "Mr & Mrs Fyzoo", much bigger and darker writing for the elders (four pages, the camera moves in), the
// glowing names stay as the curtains open. v3.2 (~02:25): the key words in glowing gold foil with a slow sheen; the small
// lines stay dark. v3.3 (~02:45, "fully editable" for his mum and the in-laws): every line they might change is live text:
// the hosts ("Mr & Mrs Fyzoo" -> "Mr & Mrs Alli"), the two invitation lines, the guest ("Dear MR & MRS KHAN"), the seats,
// the RSVP name and the signature; only the fixed parts (Bismillah, monogram, the couple's names) are printed into the
// camera moves. Long entries shrink to fit. The board is the same stage as the table view (no jump at the back of the hall).
// v3.4 (~03:00, "word everything properly ... put translations for the arabic"): every Arabic line carries its English
// meaning (Bismillah, An-Naba 78:8, the walimah dua); "cordially invite you to the Walimah"; "Dress code"; the floor
// monogram is now a gold gobo inside a ring so it shows on the white floor; a soft bloom as the curtains open; gold glints.
// INVITE.build(stage, opts) adds the layers; INVITE.setTime(t) poses them. opts.mode: "render" (everything), "clean" (the
// film's own parts: the web page's background video), "web" (the editable parts, over that video).
// opts: to (guest), seats, rsvp, host, l1, l2, sig.
(function () {
  const FPS = 24;
  const clamp = (x) => Math.min(1, Math.max(0, x));
  const inout = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const mono = (px) => `<span class="mono" style="font-size:${px}px"><span class="m">M</span><span class="n" style="font-size:.86em;left:-.2em;top:.1em">N</span></span>`;
  // a line: kind "fix" (printed into the film) or "edit" (live text); gold "g" foil, "m" gold monogram
  const L = (cls, px, html, style = "", gold = "", kind = "") => ({ cls, px, html, style, gold, kind });
  // the timeline: the entrance still (0-4 s), the curtains move (4-9 s), one glide to the board (9 s to HOLD), the hold
  const HOLD = 19; // the glide (10 s from 9 s) ends on the board still itself, so a 2-frame blend lands it
  const T = { inkFrom: 6.6, inkTo: 7.4, namesOut: 10.6, holdIn: HOLD - 0.08, hold: HOLD, ignite: HOLD + 0.6, p1Out: HOLD + 6.5, p2: HOLD + 7, p2Out: HOLD + 12.5, p3: HOLD + 13, p3Out: HOLD + 18.5, p4: HOLD + 19 };
  const DUR = HOLD + 26;
  const D = { host: "Mr & Mrs Fyzoo", l1: "cordially invite you to the Walimah", l2: "of their son", sig: "The Fyzoo Family" };
  const PAGES = (o) => [
    { bg: true, t0: T.holdIn, t1: T.p1Out, lines: [
      L("ar", 40, "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "", "g", "fix"),
      L("it", 21, "In the name of Allah,<br>the Most Gracious, the Most Merciful", "margin-top:-2px;line-height:1.25", "", "fix"),
      L("", 58, mono(58), "margin:14px 0 18px", "m", "fix"),
      L("caps fit", 30, esc(o.host ?? D.host), "font-weight:600;letter-spacing:.12em", "", "edit"),
      L("it fit", 29, esc(o.l1 ?? D.l1), "margin-top:16px", "", "edit"),
      L("it fit", 29, esc(o.l2 ?? D.l2), "", "", "edit"),
      L("sc", 50, "Muhammed Mushtaaq", "margin-top:18px", "g", "fix"),
      L("it", 46, "&amp;", "margin:-4px 0 -8px", "g", "fix"),
      L("sc", 84, "Nuriya", "", "g", "fix"),
    ] },
    { t0: T.p2, t1: T.p2Out, lines: [
      L("caps", 24, "Sunday", "font-weight:600;letter-spacing:.34em;padding-left:.34em"),
      L("caps", 46, "13 December", "font-weight:600;letter-spacing:.04em;margin-top:6px", "g"),
      L("caps", 32, "2026", "font-weight:600;letter-spacing:.2em;padding-left:.2em"),
      L("it", 31, "after Maghrib Salaah", "margin-top:10px"),
      L("rule", 0, "", "margin:30px 0 28px"),
      L("caps", 30, "198 Bengal Street", "font-weight:600;letter-spacing:.06em"),
      L("it", 31, "Laudium, Centurion", "margin-top:6px"),
    ] },
    { t0: T.p3, t1: T.p3Out, lines: [
      L("ar", 34, "وَخَلَقْنَاكُمْ أَزْوَاجًا"),
      L("sc", 40, "And We created you in pairs", "", "g"),
      L("caps", 14, "Surah An-Naba · 78:8", "font-weight:500;margin-top:6px;letter-spacing:.2em"),
      L("rule", 0, "", "margin:26px 0 24px"),
      L("caps", 20, "Dress code", "font-weight:600;letter-spacing:.3em;padding-left:.3em"),
      L("it", 30, "Traditional Eastern attire", "margin-top:4px"),
      L("rule", 0, "", "margin:26px 0 24px"),
      ...(o.seats ? [L("it", 29, "Seats reserved for you", "font-weight:600"), L("caps fit", 46, esc(o.seats), "font-weight:600;line-height:1.1;margin-bottom:14px", "g")] : []),
      L("it", 29, "Kindly RSVP by"),
      L("caps", 28, "1 November 2026", "font-weight:600;margin-top:4px"),
      ...(o.rsvp ? [L("it fit", 29, `to ${esc(o.rsvp)}`, "margin-top:6px;font-weight:600")] : []),
    ] },
    { t0: T.p4, t1: Infinity, lines: [
      L("ar", 36, "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ<br>وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ"),
      L("it", 23, "Barakallahu laka wa baraka ‘alaika<br>wa jama‘a bainakuma fi khair", "line-height:1.3;margin-top:10px;font-weight:600"),
      L("it", 21, "“May Allah bless you, shower His blessings upon you<br>and unite you both in goodness.”", "line-height:1.3;margin-top:10px"),
      L("rule", 0, "", "margin:24px 0 22px"),
      L("it", 29, "We look forward to<br>celebrating with you", "line-height:1.25"),
      L("sc fit", 58, esc(o.sig ?? D.sig), "margin-top:16px", "g"),
      L("", 44, mono(44), "margin-top:14px", "m"),
    ] },
  ];

  let S = {};
  const add = (parent, tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; parent.appendChild(e); return e; };

  function build(stage, o = {}) {
    const mode = o.mode || "render", film = mode !== "web", guest = mode !== "clean";
    const w1 = stage.querySelector("#w1") || add(stage, "div", "w1");
    const w4 = stage.querySelector("#w4") || add(stage, "div", "w4");
    S = { mode, w1, w4, pages: [] };
    // the names: the same block twice, as projected light (on the curtains) and as ink (once the bright hall shows)
    S.inkWrap = add(stage, "div", "inkwrap");
    const names = (style) => {
      const b = add(style === "glow" ? w1 : S.inkWrap, "div", null, "names " + style);
      if (guest && o.to) b.innerHTML += `<div class="on it" style="top:420px;font-size:46px">Dear</div><div class="on caps fit" style="top:478px;font-size:50px;letter-spacing:.1em;padding-left:.1em;font-weight:600">${esc(o.to)}</div>`;
      if (film) b.innerHTML += `<div class="on caps" style="top:640px;font-size:30px">Welcome to the<br>walimah of</div>
        <div class="on sc" style="top:780px;font-size:118px;padding-right:110px">Mushtaaq</div>
        <div class="on sc" style="top:905px;font-size:118px;padding-left:150px"><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.62em">&amp;</span> Nuriya</div>`;
      return b;
    };
    S.glow = names("glow"); S.ink = names("ink");
    // the floor gobo: the monogram in gold light inside a thin ring (white light would vanish on the white floor)
    if (film) { S.floor = add(w1, "div", "floor"); S.floor.innerHTML = `<div class="pool"></div><div class="ring"></div><div class="ring r2"></div><div class="gm">${mono(200)}</div>`; }
    // the board: page 1's fixed lines belong to the film, its editable lines to the guest; both keep their places
    const board = add(w4, "div", "board");
    for (const p of PAGES(o)) {
      if (!p.bg && !guest) continue;
      const el = add(board, "div", null, "page");
      let t = p.t0; const lines = [];
      for (const l of p.lines) {
        const e = add(el, "div", null, "ln " + l.cls); e.innerHTML = l.html;
        e.style.cssText = (l.px ? `font-size:${l.px}px;` : "") + l.style;
        const shown = !p.bg || (l.kind === "fix" ? film : guest);
        if (!shown) e.style.visibility = "hidden";
        // gold on page 1: a gold copy sits exactly over the black (printed) line and lights up on the hold
        let over = null;
        if (l.gold && p.bg) { e.style.position = "relative"; over = add(e, "div", null, l.gold === "g" ? "gover gold" : "gover goldm"); over.innerHTML = l.html; }
        else if (l.gold) e.classList.add(l.gold === "g" ? "gold" : "goldm");
        const t0 = p.bg ? (l.kind === "edit" ? T.hold + 0.4 : -1) : t;
        lines.push({ el: e, over, glow: !!l.gold && !p.bg, t0, d: p.bg ? 1.2 : 0.8 }); if (!p.bg) t += 0.2;
      }
      S.pages.push({ el, t0: p.t0, t1: p.t1, bg: p.bg, lines });
    }
    // long names shrink to fit the board (and the curtains)
    for (const e of stage.querySelectorAll(".fit")) {
      const sp = document.createElement("span"); while (e.firstChild) sp.appendChild(e.firstChild); e.appendChild(sp);
      const max = Math.min(e.clientWidth, e.closest("#board") ? 446 : 860), w = sp.offsetWidth; // layout px, unaffected by zoom
      if (w > max) e.style.fontSize = (parseFloat(e.style.fontSize) * max / w).toFixed(1) + "px";
    }
    S.golds = [...board.querySelectorAll(".gold")];
    // gold glints that twinkle on the couple's names once the gold lights up (part of the film)
    S.glints = film ? [[118, 330, 0], [382, 352, 1.7], [300, 440, 3.1], [160, 452, 4.4]].map(([x, y, ph]) => { const g = add(board, "div", null, "glint"); g.style.left = x + "px"; g.style.top = y + "px"; return { g, ph }; }) : [];
    if (film) S.bloom = add(stage, "div", "bloom");
    if (film) {
      S.fx = add(stage, "canvas", "fx"); S.fx.width = 1080; S.fx.height = 1920;
      add(stage, "div", "vig");
      let a = 20261213; const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      S.dots = Array.from({ length: 34 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, v: 10 + rnd() * 18, r: 1.2 + rnd() * 2.6, ph: rnd() * 6.28, sw: 6 + rnd() * 18 }));
    }
    setTime(0);
  }

  const GLOW = "drop-shadow(0 0 3px rgba(255,214,140,.9)) drop-shadow(0 0 12px rgba(255,196,110,.55))";
  const zoomAt = (z, cx, cy) => `translate(${cx - cx * z}px,${cy - cy * z}px) scale(${z})`;
  // the board's middle in s4c-board-close.png (1080-wide frame), and where the camera brings it
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
    const vis = (el, v) => { el.style.opacity = v; el.style.display = v > 0 ? "block" : "none"; };
    vis(S.glow, opt.noProj ? 0 : (1 - ink) * (1 - gone) * shimmer);
    vis(S.ink, opt.noProj ? 0 : ink * (1 - gone));
    if (S.floor) { vis(S.floor, opt.noProj ? 0 : (1 - out3((t - 4) / 0.8)) * shimmer); S.floor.style.setProperty("--spin", (t * 4) + "deg"); }
    // a soft bloom of light as the curtains part onto the bright hall
    if (S.bloom) S.bloom.style.opacity = 0.32 * Math.sin(Math.PI * clamp((t - 6.3) / 1.4));
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
