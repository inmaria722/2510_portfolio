gsap.registerPlugin(ScrollTrigger);

$(document).ready(function () {
  // lenis
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // header
  const header = $("header")[0];
  let lastDirection = 0;

  ScrollTrigger.create({
    start: 0,
    end: "max",

    onUpdate: (self) => {
      const currentDirection = self.direction;

      if (self.scroll() === 0) {
        gsap.to(header, {
          y: "0%",
          duration: 0.6,
          ease: "power1.inout",
        });
        lastDirection = -1;
      } else if (currentDirection !== lastDirection) {
        if (currentDirection === 1) {
          gsap.to(header, {
            y: "-100%",
            duration: 0.6,
            ease: "power1.inout",
          });
        } else if (currentDirection === -1) {
          gsap.to(header, {
            y: "-0%",
            duration: 0.6,
            ease: "power1.inout",
          });
        }
        lastDirection = currentDirection;
      }
    },
  });

  // 1. [fade="up"] 애니메이션 (충돌 수정됨)
  const fadeUpTargets = $("[fade='up']").not(".t-project-item");
  fadeUpTargets.each(function (i, e) {
    const delay = $(e).data("delay") || 0;

    gsap.from(e, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      delay: delay,
      scrollTrigger: {
        trigger: e,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  });

  // 2. [fade="left"] 애니메이션
  const fadeLeftTargets = $("[fade='left']");
  fadeLeftTargets.each(function (i, e) {
    const delay = $(e).data("delay") || 0;

    gsap.from(e, {
      opacity: 0,
      x: -60,
      duration: 0.6,
      delay: delay,
      scrollTrigger: {
        trigger: e,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  });

  // 3. project-img-ver stagger
  gsap.from(".project-img-ver .project-item", {
    opacity: 0,
    x: -80,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.15,
    scrollTrigger: {
      trigger: ".project-img-ver",
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  // list-btn
  $(".list-btn button").on("click", function () {
    $(this).addClass("active").siblings().removeClass("active");

    const targetContent = $(this).data("target");

    $(".project-img-ver, .project-text-ver").removeClass("active");

    const $targetElement = $(targetContent);
    $targetElement.addClass("active");

    ScrollTrigger.refresh();

    if (
      targetContent === ".project-text-ver" &&
      !$targetElement.hasClass("animated-once")
    ) {
      gsap.set(".project-text-ver .t-project-item", {
        maxHeight: 0,
        opacity: 0,
        overflow: "hidden",
      });

      gsap.to(".project-text-ver .t-project-item", {
        maxHeight: "500px",
        opacity: 1,

        duration: 0.4,
        ease: "power1.out",
        stagger: 0.05,

        onComplete: function () {
          gsap.set(this.targets(), { overflow: "visible", maxHeight: "none" });
        },
      });

      $targetElement.addClass("animated-once");
    }
  });
});
