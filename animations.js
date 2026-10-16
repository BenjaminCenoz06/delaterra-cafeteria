/* =====================================================================
   Animaciones premium: carga, hero, cursor, imanes, títulos, imágenes,
   bandas en movimiento, tilt y parallax. Se apoya en gsap + Lenis (main.js)
   ===================================================================== */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- utilidades ---------- */
  // envuelve cada palabra en una máscara para animarla subiendo
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(" ")); return; }
            const o = document.createElement("span"); o.className = "sw";
            const i = document.createElement("span"); i.textContent = tok;
            o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return $$(".sw > span", el);
  }
  // separa por letras el título del hero conservando el "&" como pieza única
  function splitChars(el) {
    const out = [];
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach((ch) => {
          const s = document.createElement("span");
          s.className = "ch"; s.style.display = "inline-block"; s.style.willChange = "transform";
          s.textContent = ch === " " ? " " : ch;
          frag.appendChild(s); out.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) { n.style.display = "inline-block"; out.push(n); }
    });
    return out;
  }

  /* ---------- Hero: letras del título (preparado antes de la carga) ---------- */
  const heroFit = $("[data-fit]");
  const heroChars = heroFit ? splitChars(heroFit) : [];
  if (heroChars.length && typeof fitTitle === "function") { fitTitle(); }
  const heroUpper = $("[data-intro-hero-upper-text]");
  const heroLower = $("[data-intro-hero-lower-text]");
  const heroArrow = $("[data-intro-hero-arrow]");
  const heroPic = $(".background-picture");
  if (!reduce) {
    gsap.set(heroChars, { yPercent: 115 });
    gsap.set(heroPic, { autoAlpha: 0 });
  }

  function heroIntro() {
    if (reduce) return;
    const tl = gsap.timeline();
    tl.to(heroChars, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.05 })
      .fromTo(heroUpper, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.9")
      .to(heroPic, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, "-=0.8")
      .fromTo([heroLower, heroArrow], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12 }, "-=0.9");
    // la flecha rebota suavemente
    gsap.to(heroArrow, { y: 8, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2 });
  }

  /* ---------- Pantalla de carga ---------- */
  const pre = $("#preloader");
  const refit = () => { if (typeof fitTitle === "function") fitTitle(); };
  document.fonts.addEventListener("loadingdone", refit);
  // la barra de scroll aparece/desaparece al terminar la carga: reajusta el título
  if (heroFit && "ResizeObserver" in window) new ResizeObserver(refit).observe(heroFit.parentElement);
  window.addEventListener("load", () => { refit(); setTimeout(refit, 400); setTimeout(refit, 1500); });
  const finishLoad = () => {
    refit();
    document.body.classList.remove("is-loading");
    if (typeof lenis !== "undefined") lenis.start();
    ScrollTrigger.refresh();
  };
  if (pre && !reduce) {
    if (typeof lenis !== "undefined") lenis.stop();
    const count = $("#plCount"), bar = $("#plBar"), word = $(".pl-word"), sub = $(".pl-sub");
    const o = { v: 0 };
    gsap.from([word, sub], { yPercent: 110, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.12 });
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(o, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate: () => (count.textContent = Math.round(o.v)) }, 0)
      .to(bar, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0)
      .to([word, sub], { yPercent: -110, autoAlpha: 0, duration: 0.6, ease: "power3.in", stagger: 0.06 }, "+=0.15")
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "power4.inOut", onStart: finishLoad }, "-=0.2")
      .add(heroIntro, "-=0.55")
      .set(pre, { display: "none" });
  } else {
    if (pre) pre.style.display = "none";
    finishLoad();
  }

  if (reduce) return; // lo demás son movimientos decorativos

  /* ---------- Barra de progreso ---------- */
  gsap.to("#scrollProgress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
  });

  /* ---------- Scroll suave a los anclas ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2 || typeof lenis === "undefined") return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { offset: -70, duration: 1.8, easing: (x) => 1 - Math.pow(1 - x, 4) });
  });

  /* ---------- Títulos: palabras que suben ---------- */
  $$(".about .script, .rev-head h2, .sub-copy h3, .feature .script-sm, .col-intro .script-sm, .blog-intro .script-sm, .shop-head .script-sm").forEach((h) => {
    const words = splitWords(h);
    gsap.from(words, {
      yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.07,
      scrollTrigger: { trigger: h, start: "top 88%", once: true },
    });
  });

  /* ---------- Imágenes: se descubren con una cortina ---------- */
  $$(".menu-photo, .post img").forEach((img) => {
    const wrap = document.createElement("div");
    wrap.className = "imgmask";
    img.replaceWith(wrap); wrap.appendChild(img);
    gsap.fromTo(wrap, { clipPath: "inset(100% 0 0 0)" }, {
      clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power4.inOut",
      scrollTrigger: { trigger: wrap, start: "top 88%", once: true },
    });
    gsap.fromTo(img, { scale: 1.35 }, {
      scale: 1, duration: 1.8, ease: "power3.out",
      scrollTrigger: { trigger: wrap, start: "top 88%", once: true },
    });
  });

  /* ---------- Menú: filas que entran en cascada ---------- */
  $$(".group").forEach((g) => {
    gsap.from($$(".items li", g), {
      autoAlpha: 0, x: -18, duration: 0.7, ease: "power2.out", stagger: 0.06,
      scrollTrigger: { trigger: g, start: "top 80%", once: true },
    });
  });

  /* ---------- Bandas en movimiento (reaccionan a la velocidad del scroll) ---------- */
  $$("[data-marquee]").forEach((m) => {
    const track = $(".mq-track", m), group = $(".mq-group", track);
    const dir = +m.dataset.marquee || 1;
    // clona el grupo para cubrir el ancho de pantalla dos veces
    const need = Math.ceil((innerWidth * 2) / group.offsetWidth) + 1;
    for (let i = 0; i < need; i++) track.appendChild(group.cloneNode(true));
    const unit = group.offsetWidth;
    const tw = dir > 0
      ? gsap.fromTo(track, { x: 0 }, { x: -unit, duration: 28, ease: "none", repeat: -1 })
      : gsap.fromTo(track, { x: -unit }, { x: 0, duration: 28, ease: "none", repeat: -1 });
    let vel = 0;
    if (typeof lenis !== "undefined") lenis.on("scroll", (e) => { vel = e.velocity; });
    gsap.ticker.add(() => {
      vel *= 0.92;
      tw.timeScale(1 + Math.min(Math.abs(vel) * 0.35, 5));
      gsap.set(m, { skewX: gsap.utils.clamp(-6, 6, vel * -0.25) });
    });
  });

  /* ---------- Dibujos flotando ---------- */
  gsap.to(".doodle-pot, .insta-doodle, .doodle-table, .doodle-cup", {
    y: -9, rotation: 2.5, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3, stagger: 0.4,
    immediateRender: false,
  });

  if (!fine) return; // lo siguiente depende del mouse

  /* ---------- Cursor seguidor ---------- */
  const cur = document.createElement("div");
  cur.className = "cursor"; document.body.appendChild(cur);
  const cx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3" });
  const cy = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3" });
  window.addEventListener("pointermove", (e) => {
    cur.classList.add("on"); cx(e.clientX); cy(e.clientY);
    const t = e.target;
    const link = t.closest("a, button, .car-media, .insta-item, .rev-card .lnk");
    const view = t.closest(".insta-item, .car-media, .post img, .menu-photo");
    cur.classList.toggle("is-link", !!link);
    cur.classList.toggle("is-view", !!view && !t.closest("a, button"));
    cur.textContent = view && !t.closest("a, button") ? "ver" : "";
    cur.classList.toggle("on-dark", !!t.closest(".story, .subscribe, .site-footer, .mq-dark, .preloader"));
  });
  document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  gsap.to(cur, { scale: 1, duration: 0 });
  document.addEventListener("pointerdown", () => gsap.to(cur, { scale: 0.8, duration: 0.2 }));
  document.addEventListener("pointerup", () => gsap.to(cur, { scale: 1, duration: 0.3, ease: "back.out(3)" }));

  /* ---------- Botones magnéticos ---------- */
  $$(".tag, .story-btn, .car-arrow, .foot-btn, .sub-link, .insta-ico, .social-row a, .car-btn").forEach((el) => {
    const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * 0.32);
      qy((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener("pointerleave", () => { qx(0); qy(0); });
  });

  /* ---------- Tilt 3D en tarjetas ---------- */
  $$(".post, .car-item").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotationY: px * 9, rotationX: py * -9, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, .6)" }));
  });

  /* ---------- Parallax con el mouse: hero y collage ---------- */
  const hero = $(".intro-hero");
  const heroImg = $(".background-picture img");
  if (hero && heroImg) {
    const hx = gsap.quickTo(heroImg, "x", { duration: 1.2, ease: "power3" });
    const hy = gsap.quickTo(heroImg, "y", { duration: 1.2, ease: "power3" });
    const tx = gsap.quickTo("[data-fit]", "x", { duration: 1.4, ease: "power3" });
    hero.addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      hx(nx * -26); hy(ny * -18); tx(nx * 14);
    });
  }
  const board = $("#instaBoard");
  if (board) {
    const items = $$(".insta-item", board).map((el) => ({ el, qx: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }), d: (parseInt(getComputedStyle(el).zIndex) || 1) }));
    board.addEventListener("pointermove", (e) => {
      const r = board.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      items.forEach(({ qx, d }) => qx(nx * d * -4));
    });
    board.addEventListener("pointerleave", () => items.forEach(({ qx }) => qx(0)));
  }
})();
