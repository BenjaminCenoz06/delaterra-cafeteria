gsap.registerPlugin(ScrollTrigger);

/* ---------- Scroll suave (Lenis) sincronizado con ScrollTrigger ---------- */
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- Título ajustado al ancho del contenedor ---------- */
const fit = document.querySelector("[data-fit]");
function fitTitle() {
  fit.style.fontSize = "100px";
  const avail = fit.parentElement.clientWidth;
  let size = 100;
  // ajuste iterativo: el ancho del texto no escala de forma perfectamente lineal
  for (let i = 0; i < 4; i++) {
    size = (size * avail) / fit.getBoundingClientRect().width;
    fit.style.fontSize = size + "px";
  }
}
document.fonts.ready.then(() => { fitTitle(); ScrollTrigger.refresh(); });
window.addEventListener("resize", fitTitle);
fitTitle();

/* ---------- Aparición suave de las secciones ---------- */
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.from(el, {
    y: 36, autoAlpha: 0, duration: 1, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 88%", once: true },
  });
});
/* parallax suave de la foto destacada */
gsap.fromTo(".feature-img", { yPercent: -4, scale: 1.12 }, {
  yPercent: 4, scale: 1.04, ease: "none",
  scrollTrigger: { trigger: ".feature", start: "top bottom", end: "bottom top", scrub: true },
});

/* los trazos de los dibujos y las líneas se "dibujan" */
gsap.utils.toArray(".doodle path, .rule path").forEach((p) => {
  const len = p.getTotalLength ? p.getTotalLength() : 0;
  if (!len) return;
  gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len },
    { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut",
      scrollTrigger: { trigger: p.ownerSVGElement, start: "top bottom-=20", once: true } });
});

/* ---------- Carrusel de productos ---------- */
(() => {
  const U = (id) => `images/${id}`;
  const products = [
    { n: "Medialunas recién horneadas", p: "Pastelería", o: "", i: "dlt-15.jpg" },
    { n: "Milanesa de peceto con puré", p: "Almuerzos", o: "", i: "dlt-13.jpg" },
    { n: "Torta vasca", p: "Pastelería", o: "", i: "dlt-16.jpg" },
    { n: "Sorrentinos vegetarianos", p: "Almuerzos", o: "", i: "dlt-07.jpg" },
    { n: "Brownie de chocolate blanco", p: "Pastelería", o: "", i: "dlt-24.jpg" },
    { n: "Ensalada de la casa", p: "Almuerzos", o: "", i: "dlt-26.jpg" },
    { n: "Mousse de dulce de leche", p: "Pastelería", o: "", i: "dlt-09.jpg" },
    { n: "Café con leche y bollería", p: "Café", o: "", i: "dlt-19.jpg" },
  ];
  const root = document.querySelector("[data-carousel]");
  if (!root) return;
  const track = root.querySelector("#carTrack");
  const dotsEl = root.querySelector("#carDots");
  const prev = root.querySelector(".car-prev");
  const next = root.querySelector(".car-next");
  const pauseIcon = '<svg viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10"/><rect x="8" y="2" width="3" height="10"/></svg>';
  const muteIcon = '<svg viewBox="0 0 14 14" fill="currentColor"><path d="M2 5h2.5L8 2v10L4.5 9H2z"/></svg>';

  track.innerHTML = products.map((x) => `
    <li class="car-item">
      <div class="car-media">
        <img src="${U(x.i)}" alt="${x.n}" loading="lazy">
        <span class="car-play"></span>
        <div class="car-ctrl"><button type="button" aria-label="Pausar">${pauseIcon}</button><button type="button" aria-label="Silenciar">${muteIcon}</button></div>
      </div>
      <div class="car-info">
        <img src="${U(x.i)}" alt="">
        <div><p class="car-name">${x.n}</p><p class="car-price">${x.p}<s>${x.o}</s></p></div>
      </div>
      <a class="car-btn" href="#menu">Ver en la carta</a>
    </li>`).join("");
  dotsEl.innerHTML = products.map((_, i) => `<button type="button" aria-label="Producto ${i + 1}"></button>`).join("");

  const items = [...track.children];
  const dots = [...dotsEl.children];
  let idx = 0;

  function go(i, instant) {
    idx = Math.max(0, Math.min(products.length - 1, i));
    const w = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    const vp = root.querySelector(".car-viewport").clientWidth;
    const x = vp / 2 - (idx * (w + gap) + w / 2);
    gsap.to(track, { x, duration: instant ? 0 : 0.8, ease: "power3.out" });
    items.forEach((el, k) => el.classList.toggle("is-active", k === idx));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === idx));
    prev.disabled = idx === 0;
    next.disabled = idx === products.length - 1;
  }
  prev.addEventListener("click", () => go(idx - 1));
  next.addEventListener("click", () => go(idx + 1));
  items.forEach((el, k) => el.querySelector(".car-media").addEventListener("click", () => go(k)));
  dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
  window.addEventListener("resize", () => go(idx, true));
  // deslizar con el dedo
  const vp = root.querySelector(".car-viewport");
  let sx = null, sy = null;
  vp.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  vp.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
  go(2, true);
})();

/* ---------- Banner publicitario: la palabra final rota ---------- */
(() => {
  const swap = document.querySelector(".ad-swap");
  if (!swap) return;
  const words = [...swap.querySelectorAll(".ad-word")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0;
  const size = () => { swap.style.width = words[cur].offsetWidth + "px"; };
  gsap.set(words, { yPercent: 110 });
  gsap.set(words[0], { yPercent: 0 });
  document.fonts.ready.then(size);
  size();
  window.addEventListener("resize", size);
  if (reduce) return;

  const step = () => {
    const nxt = (cur + 1) % words.length;
    const tl = gsap.timeline({ onComplete: () => { cur = nxt; gsap.delayedCall(2.2, step); } });
    tl.to(words[cur], { yPercent: -110, duration: 0.7, ease: "power3.inOut" }, 0)
      .fromTo(words[nxt], { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power3.inOut" }, 0)
      .to(swap, { width: words[nxt].offsetWidth, duration: 0.7, ease: "power3.inOut" }, 0);
  };
  ScrollTrigger.create({ trigger: ".ad", start: "top 85%", once: true, onEnter: () => gsap.delayedCall(1.6, step) });
})();

/* ---------- Suscripción: parallax del trío + video solo visible ---------- */
gsap.utils.toArray(".sub-trio figure").forEach((fig, i) => {
  const im = fig.querySelector("img");
  gsap.fromTo(fig, { clipPath: "inset(12% 0 0 0)" }, {
    clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power3.out", delay: i * 0.1,
    scrollTrigger: { trigger: ".sub-trio", start: "top 85%", once: true },
  });
  gsap.fromTo(im, { yPercent: -6, scale: 1.14 }, {
    yPercent: 6, scale: 1.06, ease: "none",
    scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
  });
});
const subVideo = document.querySelector(".sub-video video");
if (subVideo) {
  new IntersectionObserver(([e]) => (e.isIntersecting ? subVideo.play().catch(() => {}) : subVideo.pause()), { threshold: 0.1 }).observe(subVideo);
}

/* ---------- Collage Instagram ---------- */
(() => {
  const board = document.getElementById("instaBoard");
  if (!board) return;
  const U = (id) => `images/${id}`;
  // x, y, w = % del tablero · r = rotación · a = proporción · f = marco polaroid
  const items = [
    { i: "dlt-05.jpg", x: -1, y: 16, w: 13, r: 2, a: "3/4", z: 2 },
    { i: "dlt-06.jpg", x: 13.5, y: 6.5, w: 16, r: -3, a: "1/1", f: 1, z: 3 },
    { i: "dlt-11.jpg", x: 23.5, y: 18, w: 9, r: 5, a: "3/4", z: 5 },
    { i: "dlt-14.jpg", x: 6, y: 38, w: 17, r: -2, a: "1/1", f: 1, z: 6 },
    { i: "dlt-12.jpg", x: 3, y: 40, w: 6, r: 1, a: "3/4", z: 7 },
    { i: "dlt-23.jpg", x: 35.5, y: 31, w: 10.5, r: 2, a: "3/4", f: 1, z: 8 },
    { i: "dlt-20.jpg", x: 48, y: 10, w: 16, r: 4, a: "3/4", z: 4 },
    { i: "dlt-10.jpg", x: 60, y: 33, w: 18, r: 2, a: "3/2", z: 9 },
    { i: "dlt-18.jpg", x: 68, y: 12, w: 10, r: 2, a: "4/5", f: 1, z: 3 },
    { i: "dlt-28.jpg", x: 80, y: 7, w: 9, r: 2, a: "3/4", z: 2 },
    { i: "dlt-27.jpg", x: 90, y: 10, w: 10, r: -3, a: "3/4", f: 1, z: 3 },
    { i: "dlt-22.jpg", x: 22, y: 59, w: 15, r: -2, a: "1/1", z: 10 },
    { i: "dlt-21.jpg", x: 51, y: 51, w: 8, r: 3, a: "3/4", z: 11 },
    { i: "dlt-08.jpg", x: 57, y: 50, w: 20, r: 2, a: "4/5", z: 12 },
    { i: "dlt-13.jpg", x: 76, y: 48, w: 8, r: 3, a: "3/4", z: 13 },
    { i: "dlt-26.jpg", x: 91, y: 59, w: 10, r: 3, a: "3/4", f: 1, z: 14 },
  ];
  const frag = document.createDocumentFragment();
  items.forEach((it) => {
    const el = document.createElement("div");
    el.className = "insta-item" + (it.f ? " frame" : "");
    el.style.cssText = `--x:${it.x};--y:${it.y};--w:${it.w};--r:${it.r};--z:${it.z};--a:${it.a}`;
    el.innerHTML = `<img src="${U(it.i)}" alt="" loading="lazy">`;
    frag.appendChild(el);
  });
  board.prepend(frag);

  const els = gsap.utils.toArray(".insta-item");
  gsap.from(els, {
    scale: 0.82, autoAlpha: 0, y: 40, rotation: (i) => items[i].r + (i % 2 ? 8 : -8),
    duration: 0.9, ease: "back.out(1.4)", stagger: { each: 0.06, from: "random" },
    scrollTrigger: { trigger: board, start: "top 75%", once: true },
  });
  // deriva suave a distintas velocidades al hacer scroll
  els.forEach((el, i) => {
    gsap.to(el, {
      yPercent: (i % 3 - 1) * 9, ease: "none",
      scrollTrigger: { trigger: board, start: "top bottom", end: "bottom top", scrub: 0.6 },
    });
  });
})();

/* ---------- Historia: títulos palabra por palabra + líneas ---------- */
(() => {
  document.querySelectorAll(".story .split").forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(" ");
  });
  document.querySelectorAll(".story .chapter").forEach((ch) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: "top 78%", once: true } });
    tl.from(ch.querySelector(".chap-label"), { autoAlpha: 0, y: 12, duration: 0.6, ease: "power2.out" })
      .from(ch.querySelectorAll(".split .w > span"), { yPercent: 115, duration: 1, ease: "power3.out", stagger: 0.09 }, "<0.1")
      .from(ch.querySelectorAll(".chap-row > *"), { autoAlpha: 0, y: 24, duration: 0.8, ease: "power2.out", stagger: 0.12 }, "-=0.6");
    const ico = ch.querySelector(".chap-ico");
    if (ico) {
      ico.querySelectorAll("path, circle").forEach((p) => {
        const len = p.getTotalLength ? p.getTotalLength() : 0;
        if (len) tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, "-=1.1");
      });
    }
  });
})();

/* ---------- Números: cuentan hasta su valor ---------- */
document.querySelectorAll(".stats li").forEach((li, i) => {
  const b = li.querySelector("[data-count]");
  const target = +b.dataset.count, suffix = b.dataset.suffix || "";
  const o = { v: 0 };
  const tl = gsap.timeline({ scrollTrigger: { trigger: ".stats-row", start: "top 85%", once: true }, delay: i * 0.15 });
  tl.from(li, { autoAlpha: 0, y: 30, duration: 0.8, ease: "power2.out" })
    .to(o, { v: target, duration: 1.8, ease: "power2.out", onUpdate: () => (b.textContent = Math.round(o.v) + suffix) }, "<0.1")
    .from(li.querySelector("p"), { autoAlpha: 0, y: 12, duration: 0.7, ease: "power2.out" }, "-=0.9");
});

/* ---------- Reseñas de Google Maps en mosaico ---------- */
(() => {
  const board = document.getElementById("revBoard");
  if (!board) return;
  const MAP = "https://www.google.com/maps/search/?api=1&query=-31.4191439,-64.1867496";
  const U = (id) => `images/${id}`;
  // reseñas reales de Google Maps (textos acortados con … donde Maps los corta)
  const R = [
    ["Sergio", "Local Guide", "hace 3 meses", "Excelente atención de los chicos. Comimos una milanesa con puré y unas zucchini, muy rico todo, precios correctos…"],
    ["Sol R.", "Local Guide", "hace 2 meses", "Hermoso lugar super bien ambientado. Los mozos super amables, la comida super abundante y rica. Los ingredientes de excelente calidad."],
    ["Anabella G.", "Local Guide", "hace 2 meses", "Una gran experiencia en este lugar. Realmente es un lugar que te aísla de la realidad de afuera. Todo tenue, olor a comida casera, una atención espectacular. Me sentí muy cómoda y comí de diez."],
    ["Gabriela S.", "Local Guide", "hace un mes", "Hermoso y cálido ambiente! Me encantó. La atención excelente, los chicos superatentos y educados. La comida muy buena. Para volver siempre!"],
    ["Camila N.", "Local Guide", "hace 2 meses", "Este lugar es una verdadera joyita escondida. El menú del día es excelente, muy rico y abundante. El postre un espectáculo también! Además, el servicio es muy cálido…"],
    ["Mica M.", "Local Guide", "hace un mes", "Hermoso. Realmente es sentirse en casa. Son todos muy amables y la comida no tuvo sentido. De postre un brownie de chocolate blanco que casi lloro."],
    ["Julián V.", "", "hace 2 meses", "Ambiente cálido, atención de jóvenes estudiantes muy atentos y serviciales. La comida excelente, todo casero. Por un precio accesible contás con plato principal, bebida y postre."],
    ["Brenda M.", "Local Guide", "hace 4 meses", "Excelente los almuerzos. Me gustó mucho que sean livianos. El ambiente con buena música. Es tranquilo. Buena atención y calidez en el ambiente."],
    ["Ryan G.", "", "hace 3 meses", "One of the best restaurants I’ve been in Córdoba in the 4 years coming here. The interior is very unique and with good music. The food and coffee is amazing. I’ll be coming back often."],
    ["Eloisa L.", "Local Guide", "hace 3 meses", "Me encantó el lugar. Tiene un ambiente hermoso, con una decoración, iluminación y estética muy lindas, se nota que todo está muy bien pensado. La atención también fue excelente…"],
  ];
  const star = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z"/></svg>';
  const stars = star.repeat(5);
  const rev = (k) => { const [n, g, w, t] = R[k]; return `<article class="rev-card"><div class="rev-stars" aria-label="5 estrellas">${stars}</div><q>${t}</q><p class="rev-who">${n}</p><p class="rev-meta">${g ? g + " · " : ""}${w}</p></article>`; };
  const photo = (id, a = "1/1", bw = false) => `<div class="rev-tile${bw ? " bw" : ""}" style="--a:${a}"><img src="${U(id)}" alt="" loading="lazy"></div>`;
  const stat = `<article class="rev-card stat dark"><span class="big">4,9</span><div class="rev-stars">${stars}</div><p class="rev-meta" style="margin-top:.7rem">502 reseñas en Google</p></article>`;
  const visit = `<article class="rev-card"><p class="kick">Contanos</p><h4>¿Ya nos visitaste?</h4><p>Contanos cómo fue tu experiencia en Google. ¡Tu opinión nos ayuda un montón!</p><a class="lnk" href="${MAP}" target="_blank" rel="noopener">Dejá tu reseña →</a></article>`;
  const where = `<article class="rev-card"><p class="kick">Dónde</p><h4>Obispo Trejo 305</h4><p>Córdoba, Argentina. Abierto todos los días, cerramos a las 21:30.</p><a class="lnk" href="${MAP}" target="_blank" rel="noopener">Cómo llegar →</a></article>`;
  const menu = `<article class="rev-card"><p class="kick">Del día</p><h4>Menú ejecutivo</h4><p>Plato principal, bebida y postre, todo casero. Cambia cada día.</p></article>`;

  const cols = [
    [photo("dlt-27.jpg", "4/3", true), visit, photo("dlt-17.jpg"), rev(0)],
    [photo("dlt-05.jpg", "4/3"), rev(1), photo("dlt-18.jpg", "3/4"), where, rev(4)],
    [photo("dlt-28.jpg", "3/4", true), rev(2), photo("dlt-10.jpg", "4/3"), menu, rev(5)],
    [photo("dlt-12.jpg", "5/4"), rev(3), stat, photo("dlt-22.jpg", "3/4"), rev(6)],
    [photo("dlt-21.jpg", "3/4"), rev(7), photo("dlt-23.jpg", "1/1", true), rev(8), rev(9)],
  ];
  const dur = [78, 92, 70, 86, 74];
  board.innerHTML = cols.map((items, i) => {
    const html = items.join("");
    return `<div class="rev-col"><div class="rev-track" style="--dur:${dur[i]}s;--dir:${i % 2 ? "reverse" : "normal"}">${html}<div aria-hidden="true" style="display:contents">${html}</div></div></div>`;
  }).join("");

  gsap.from(".rev-col", { autoAlpha: 0, y: 40, duration: 1, ease: "power2.out", stagger: 0.1,
    scrollTrigger: { trigger: board, start: "top 85%", once: true } });
})();

/* ---------- Footer: frase gigante + barrido (como psg.fr) ---------- */
(() => {
  const mark = document.getElementById("footMark");
  if (!mark) return;
  const words = [...mark.querySelectorAll(".mw")];
  const fitMark = () => {
    mark.style.fontSize = "100px";
    const avail = mark.parentElement.clientWidth;
    let size = 100;
    // ajuste iterativo (el ancho no escala de forma perfectamente lineal)
    for (let i = 0; i < 4; i++) {
      size = (size * avail) / mark.scrollWidth;
      mark.style.fontSize = size + "px";
    }
    mark.style.fontSize = size * 0.995 + "px";
  };
  document.fonts.ready.then(fitMark);
  fitMark();
  window.addEventListener("resize", fitMark);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // bloque de color que cruza cada palabra; a mitad del barrido aparece el texto
  const tl = gsap.timeline({ paused: true });
  words.forEach((w, i) => {
    const blk = w.querySelector(".blk"), txt = w.querySelector(".mt");
    gsap.set(blk, { x: 0, xPercent: -101 });
    gsap.set(txt, { x: -50, opacity: 0 });
    tl.fromTo(blk, { xPercent: -101 }, { xPercent: 0, duration: 0.4, ease: "none", immediateRender: false }, i * 0.1)
      .set(txt, { opacity: 1 }, i * 0.1 + 0.4)
      .fromTo(txt, { x: -50 }, { x: 0, duration: 0.4, ease: "none", immediateRender: false }, i * 0.1 + 0.4)
      .fromTo(blk, { xPercent: 0 }, { xPercent: 101, duration: 0.4, ease: "none", immediateRender: false }, i * 0.1 + 0.4);
  });
  let played = false;
  ScrollTrigger.create({
    trigger: "main", start: "bottom 70%",
    onEnter: () => { if (!played) { played = true; tl.play(0); } },
  });
  // en pantallas chicas el footer no es sticky: dispara cuando entra a la vista
  if (!matchMedia("(min-width: 768px) and (min-height: 700px)").matches) {
    ScrollTrigger.create({ trigger: mark, start: "top 95%", onEnter: () => { if (!played) { played = true; tl.play(0); } } });
  }
})();

/* ---------- Header: se muestra al salir del hero ---------- */
const header = document.querySelector(".site-header");
const setHeaderHidden = (hidden) => header.classList.toggle("is-hidden", hidden);

/* Texto blanco mientras el header está sobre la imagen del hero */
ScrollTrigger.create({
  trigger: ".image-wrapper",
  start: "top top",
  end: () => "bottom top+=" + header.offsetHeight,
  onToggle: (self) => header.classList.toggle("on-image", self.isActive),
});

/* ---------- Animación del hero (scrub) ---------- */
const hero = document.querySelector(".intro-hero");
const bg = hero.querySelector(".background-picture");
const img = bg.querySelector("img");
const upper = hero.querySelector("[data-intro-hero-upper-text]");
const lower = hero.querySelector("[data-intro-hero-lower-text]");
const arrow = hero.querySelector("[data-intro-hero-arrow]");

gsap.set(img, { scale: 1.1, yPercent: -20 });

gsap.matchMedia().add(
  { isMobile: "(max-width: 1099px)", isDesktop: "(min-width: 1100px)" },
  (ctx) => {
    const { isMobile } = ctx.conditions;
    const tl = gsap.timeline();
    tl.addLabel("start");

    tl.fromTo(
      bg,
      { clipPath: isMobile
          ? "polygon(30% 35%, 70% 35%, 70% 80%, 30% 80%)"
          : "polygon(43% 35%, 57% 35%, 57% 80%, 43% 80%)" },
      { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "sine.inOut" },
      "start"
    );
    tl.to(img, { scale: 1, yPercent: 0, duration: 0.5, ease: "sine.inOut" }, "start");
    tl.fromTo(upper, { yPercent: 0, autoAlpha: 1 }, { yPercent: -110, autoAlpha: 0, duration: 0.3 }, "start");
    tl.fromTo([lower, arrow], { yPercent: 0, autoAlpha: 1 }, { yPercent: 110, autoAlpha: 0, duration: 0.3, stagger: 0.05 }, "start");

    ScrollTrigger.create({
      animation: tl,
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onEnterBack: () => setHeaderHidden(true),
      onLeave: () => setHeaderHidden(false),
    });
  }
);
