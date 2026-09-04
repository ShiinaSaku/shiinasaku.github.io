// Scroll reveal observer — works with Astro view transitions.
const setupReveal = () => {
  const els = document.querySelectorAll(".reveal, .stagger");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );
  els.forEach((el) => io.observe(el));
};

setupReveal();
document.addEventListener("astro:after-swap", setupReveal);
