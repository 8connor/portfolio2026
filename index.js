(function () {
  emailjs.init("user_tssWZv8azwNWJGRvDkwsl");
})();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const scrollProgressEl = document.getElementById("scrollProgress");
  let progressTicking = false;

  const updateScrollProgress = () => {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    scrollProgressEl.style.width = `${progress}%`;
    progressTicking = false;
  };

  updateScrollProgress();

  window.addEventListener("scroll", () => {
    if (!progressTicking) {
      requestAnimationFrame(updateScrollProgress);
      progressTicking = true;
    }
  });

  document.querySelectorAll(".project-card").forEach((card, index) => {
    card.classList.add("reveal");
    card.style.transitionDelay = `${(index % 4) * 0.08}s`;
  });

  const supportsHover = window.matchMedia("(hover: hover)").matches;

  if (!prefersReducedMotion && supportsHover) {
    const maxTilt = 5;

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - y) * maxTilt * 2;

        card.style.transition = "transform 0.1s ease-out";
        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.4s ease";
        card.style.transform = "";
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  const statEls = document.querySelectorAll(".stat__number");

  const animateStat = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(eased * target)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  if (prefersReducedMotion) {
    statEls.forEach((el) => {
      el.textContent = `${el.dataset.target}${el.dataset.suffix || ""}`;
    });
  } else {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statEls.forEach((el) => statObserver.observe(el));
  }

  document.getElementById("contact_form").addEventListener("submit", (e) => {
    e.preventDefault();

    this.contactNum.value = (Math.random() * 100000) | 0;

    emailjs
      .sendForm("service_no22119", "template_fbgakbo", "#contact_form")
      .then(
        function (res) {
          console.log(res.status);

          if (res.status === 200) {
            console.log("success");

            var frm = document.getElementById("contact_form");
            frm.reset();

            document.getElementById('contact-inputs').style.display = 'none';
            document.getElementById('thank-you').style.display = 'block';

            return false;
          }
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  });
});
