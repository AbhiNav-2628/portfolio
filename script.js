const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Give the opening type a restrained entrance while preserving a complete no-JS page.
if (!motionReduced) {
  requestAnimationFrame(() => body.classList.add("reveal-ready"));
}

const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  nav?.classList.remove("is-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const navLinks = [...document.querySelectorAll("#site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-project-trigger]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = document.querySelector(`#project-${button.dataset.projectTrigger}-detail`);
    if (!detail) return;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    detail.hidden = expanded;
    button.firstChild.textContent = expanded ? "Explore build " : "Close build ";
  });
});

// A low-key particle field gives the dark layout depth without adding an image dependency.
const canvas = document.querySelector("#particle-field");
if (canvas && !motionReduced) {
  const context = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const makeParticle = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.25 + 0.2,
    opacity: Math.random() * 0.42 + 0.08,
    speed: Math.random() * 0.12 + 0.025,
    drift: (Math.random() - 0.5) * 0.08,
  });

  const populate = () => {
    particles.length = 0;
    const amount = Math.min(85, Math.max(28, Math.round((width * height) / 21000)));
    for (let i = 0; i < amount; i += 1) particles.push(makeParticle());
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;
      if (particle.y < -8) Object.assign(particle, makeParticle(), { y: height + 8 });
      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;
      context.beginPath();
      context.fillStyle = `rgba(210, 180, 255, ${particle.opacity})`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  populate();
  draw();
  window.addEventListener("resize", () => { resize(); populate(); }, { passive: true });
}

// Pointer effects: a violet orb, a responsive light source, and gentle depth on the hero core.
const core = document.querySelector(".core-wrap");
const hero = document.querySelector(".hero");
const cursorOrb = document.querySelector(".cursor-orb");
const hasFinePointer = !motionReduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (hasFinePointer && cursorOrb) {
  let targetX = -100;
  let targetY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let cursorFrame;

  const renderCursor = () => {
    cursorX += (targetX - cursorX) * 0.2;
    cursorY += (targetY - cursorY) * 0.2;
    cursorOrb.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    cursorFrame = requestAnimationFrame(renderCursor);
  };

  const resetCore = () => {
    core?.style.removeProperty("transform");
    hero?.classList.remove("has-pointer");
  };

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    body.classList.add("has-mouse");

    if (hero) {
      const bounds = hero.getBoundingClientRect();
      if (event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
        const localX = ((event.clientX - bounds.left) / bounds.width) * 100;
        const localY = ((event.clientY - bounds.top) / bounds.height) * 100;
        hero.style.setProperty("--pointer-x", `${localX}%`);
        hero.style.setProperty("--pointer-y", `${localY}%`);
        hero.classList.add("has-pointer");

        const tiltX = (localX / 100 - 0.5) * 22;
        const tiltY = (localY / 100 - 0.5) * 16;
        core?.style.setProperty("transform", `translateY(-43%) translate3d(${tiltX}px, ${tiltY}px, 0) rotateX(${-tiltY / 2}deg) rotateY(${tiltX / 2}deg)`);
      } else {
        resetCore();
      }
    }
  }, { passive: true });

  window.addEventListener("pointerdown", () => cursorOrb.classList.add("is-pressing"), { passive: true });
  window.addEventListener("pointerup", () => cursorOrb.classList.remove("is-pressing"), { passive: true });
  window.addEventListener("blur", () => { body.classList.remove("has-mouse"); resetCore(); });
  document.addEventListener("mouseleave", () => { body.classList.remove("has-mouse"); resetCore(); });

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("pointerenter", () => cursorOrb.classList.add("is-hover"));
    element.addEventListener("pointerleave", () => cursorOrb.classList.remove("is-hover"));
  });

  document.querySelectorAll(".project-more, .project-ext-link, .cv-button, .contact-actions a").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const shiftX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
      const shiftY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 7;
      element.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
    });
    element.addEventListener("pointerleave", () => element.style.removeProperty("transform"));
  });

  renderCursor();
  window.addEventListener("beforeunload", () => cancelAnimationFrame(cursorFrame), { once: true });
}
