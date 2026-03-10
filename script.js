const root = document.documentElement;
const heroShell = document.querySelector(".hero-shell");
const heroStatus = document.querySelector(".hero-status-copy");
const bootRows = [...document.querySelectorAll(".boot-row")];
const revealItems = [...document.querySelectorAll(".reveal")];
const interestForm = document.getElementById("interest-form");
const formResponse = document.querySelector(".form-response");
const footerYear = document.getElementById("footer-year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const previewMode = new URLSearchParams(window.location.search).get("preview");

footerYear.textContent = new Date().getFullYear();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

function applyActivation(progress) {
  const bootProgress = easeOutCubic(clamp((progress - 0.05) / 0.7, 0, 1));
  const eyeProgress = easeOutCubic(clamp((progress - 0.18) / 0.42, 0, 1));

  root.style.setProperty("--activation", progress.toFixed(4));
  root.style.setProperty("--boot-intensity", bootProgress.toFixed(4));
  root.style.setProperty("--eye-open", eyeProgress.toFixed(4));

  document.body.classList.toggle("robot-live", progress > 0.62);

  if (heroStatus) {
    if (progress > 0.74) {
      heroStatus.textContent = "Embodied intelligence online";
    } else if (progress > 0.42) {
      heroStatus.textContent = "Model handoff / permissions syncing";
    } else {
      heroStatus.textContent = "Standby / secure bootstrap";
    }
  }

  bootRows.forEach((row) => {
    const threshold = Number(row.dataset.threshold || 0);
    row.classList.toggle("is-active", progress >= threshold);
  });
}

// The hero activation is driven by scroll progress through the sticky opening section.
function updateHeroFromScroll() {
  if (!heroShell) {
    return;
  }

  const rect = heroShell.getBoundingClientRect();
  const travel = Math.max(heroShell.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / travel, 0, 1);
  applyActivation(progress);
}

if (previewMode === "live") {
  applyActivation(1);
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if (prefersReducedMotion) {
  applyActivation(1);
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  let scrollTicking = false;

  const requestUpdate = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateHeroFromScroll();
      scrollTicking = false;
    });
  };

  updateHeroFromScroll();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

interestForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(interestForm);
  const name = String(formData.get("name") || "there").trim();
  const type = String(formData.get("interestType") || "partner").trim();

  formResponse.textContent = `Interest staged for ${type.toLowerCase()}: ${name}. Replace the local handler in script.js with your CRM endpoint to make submissions live.`;
  interestForm.reset();
});
