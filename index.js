(function () {
  emailjs.init("user_tssWZv8azwNWJGRvDkwsl");
})();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const typewriterEl = document.getElementById("typewriter");
  const roles = [
    "Software Engineer.",
    "React Developer.",
    "Node.js Developer.",
    "WordPress Developer.",
  ];

  if (typewriterEl) {
    if (prefersReducedMotion) {
      typewriterEl.textContent = roles[0];
    } else {
      const heroH2 = typewriterEl.closest("h2");
      const heroIntro = heroH2.parentElement;

      const makeMeasurer = () => {
        const measurer = heroH2.cloneNode(true);
        measurer.style.position = "absolute";
        measurer.style.visibility = "hidden";
        measurer.style.pointerEvents = "none";
        measurer.style.minHeight = "0";

        const measurerSpan = measurer.querySelector(".typewriter");
        measurerSpan.removeAttribute("id");

        heroIntro.appendChild(measurer);

        return { measurer, measurerSpan };
      };

      // Pins hero__intro's width and h2's height to the largest role string so the
      // flex-centered header doesn't re-center (shifting text sideways) as it types.
      const reserveHeroLayout = () => {
        heroIntro.style.width = "";

        const availableWidth = heroIntro.parentElement.clientWidth;
        const { measurer: widthMeasurer, measurerSpan: widthSpan } =
          makeMeasurer();
        widthMeasurer.style.width = "auto";
        widthMeasurer.style.whiteSpace = "nowrap";

        let maxNaturalWidth = 0;
        roles.forEach((role) => {
          widthSpan.textContent = role;
          maxNaturalWidth = Math.max(maxNaturalWidth, widthMeasurer.scrollWidth);
        });
        widthMeasurer.remove();

        const targetWidth = Math.min(maxNaturalWidth, availableWidth);
        heroIntro.style.width = `${targetWidth}px`;

        const { measurer: heightMeasurer, measurerSpan: heightSpan } =
          makeMeasurer();
        heightMeasurer.style.width = `${targetWidth}px`;

        let maxHeight = 0;
        roles.forEach((role) => {
          heightSpan.textContent = role;
          maxHeight = Math.max(maxHeight, heightMeasurer.offsetHeight);
        });
        heightMeasurer.remove();

        heroH2.style.minHeight = `${maxHeight}px`;
      };

      reserveHeroLayout();

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(reserveHeroLayout, 150);
      });

      let roleIndex = 0;
      let charIndex = typewriterEl.textContent.length;
      let deleting = true;

      const tick = () => {
        const current = roles[roleIndex];

        if (deleting) {
          charIndex--;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
          }
        } else {
          charIndex++;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, 1800);
            return;
          }
        }

        setTimeout(tick, deleting ? 40 : 70);
      };

      setTimeout(tick, 1800);
    }
  }

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
