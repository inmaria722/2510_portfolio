gsap.registerPlugin(ScrollTrigger);

let typingTimeouts = [];
let isLoadingComplete = false;
const fadeOutDuration = 700;

function typeWriter($element, text, baseSpeed, onComplete) {
  let i = 0;
  $element.html("");
  $element.css("visibility", "visible");
  $element.addClass("typing");

  function type() {
    if (isLoadingComplete) {
      $element.removeClass("typing");
      return;
    }

    if (i < text.length) {
      const char = text.charAt(i);

      if (char === "<") {
        const tagCloseIndex = text.indexOf(">", i);
        if (tagCloseIndex !== -1) {
          $element.append(text.substring(i, tagCloseIndex + 1));
          i = tagCloseIndex;
        }
      } else {
        $element.append(char);
      }

      i++;

      let delay = baseSpeed + Math.random() * baseSpeed;
      if (char === "," || char === ".") {
        delay += 350;
      }

      const timeoutId = setTimeout(type, delay);
      typingTimeouts.push(timeoutId);
    } else {
      $element.removeClass("typing");
      if (onComplete) onComplete();
    }
  }

  type();
}

function completeLoading() {
  if (isLoadingComplete) return;
  isLoadingComplete = true;

  typingTimeouts.forEach(clearTimeout);
  typingTimeouts = [];

  $("#skip-loading-btn").css("display", "none");

  const $loaderWrapper = $("#loading");
  $loaderWrapper.addClass("loaded");

  setTimeout(function () {
    $loaderWrapper.css("display", "none");
    if (typeof initHeaderScroll === "function") {
      initHeaderScroll();
    }
  }, fadeOutDuration);
}

$(window).on("load", function () {
  const $span1 = $("#loading .con div:first-child span");
  const $span2 = $("#loading .con div:last-child span");

  const text1 = $span1.html();
  const text2 = $span2.html();

  const typeSpeed = 55;
  const delayBetween = 200;
  const delayAfter = 500;

  typingTimeouts = [];

  typeWriter($span1, text1, typeSpeed, function () {
    if (isLoadingComplete) return;

    const timeout1 = setTimeout(function () {
      typeWriter($span2, text2, typeSpeed, function () {
        if (isLoadingComplete) return;

        const timeout2 = setTimeout(function () {
          completeLoading();
        }, delayAfter);
        typingTimeouts.push(timeout2);
      });
    }, delayBetween);
    typingTimeouts.push(timeout1);
  });
});

$(document).ready(function () {
  $("#skip-loading-btn").on("click", function (e) {
    e.preventDefault();
    completeLoading();
  });
});
$(document).ready(function () {
  gsap.registerPlugin(ScrollToPlugin);

  const scrollSpeed = 800;
  function smoothScrollAndSlide(targetSelector, slideIndex) {
    const $target = $(targetSelector);

    if ($target.length === 0) {
      console.error("Scroll target not found:", targetSelector);
      return;
    }

    gsap.to(window, {
      duration: scrollSpeed / 1000,
      scrollTo: $target.offset().top,
      ease: "power2.inOut",

      onComplete: function () {
        if (slideIndex !== undefined) {
          let swiperInstance = null;

          if (
            document.querySelector(".mySwiper") &&
            document.querySelector(".mySwiper").swiper
          ) {
            swiperInstance = document.querySelector(".mySwiper").swiper;
          } else if (typeof mySwiper !== "undefined") {
            swiperInstance = mySwiper;
          }

          if (swiperInstance) {
            swiperInstance.slideTo(slideIndex, 0);
          } else {
            console.warn("Swiper instance 'mySwiper' not found on click.");
          }
        }
      },
    });
  }

  $("header > div").on("click", function (e) {
    e.preventDefault();
    gsap.to(window, {
      duration: scrollSpeed / 1000,
      scrollTo: 0,
      ease: "power2.inOut",
    });
  });

  $("header ul li:nth-child(1) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".profile-box");
  });

  $("header ul li:nth-child(2) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 0);
  });

  $("header ul li:nth-child(3) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 1);
  });

  $("header ul li:nth-child(4) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 4);
  });

  $("header ul li:nth-child(5) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 5);
  });
});

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

  //   fade-up
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
        start: "bottom bottom-=100px",
        toggleActions: "play none none none",
        once: true,

        refreshPriority: -1,
      },
    });
  });

  // fade-left
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

  // project-img-ver stagger
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

// project-box
$(document).ready(function () {
  const $textBoxes = $(".project-box .con .left .text-box");

  const swiper = new Swiper(".mySwiper", {
    direction: "vertical",
    slidesPerView: 1,
    spaceBetween: 30,

    autoplay: false,
    mousewheel: false,
    allowTouchMove: false,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  gsap.registerPlugin(ScrollTrigger);

  const slideCount = swiper.slides.length;
  const pinDuration = (slideCount - 1) * 500;
  let lastIndex = 0;

  const st = ScrollTrigger.create({
    trigger: ".project-box",
    pin: true,
    start: "top top",
    end: () => "+=" + pinDuration,

    scrub: 0.3,

    snap: {
      snapTo: 1 / (slideCount - 1),
      duration: 0.6,
      ease: "power1.inOut",
    },

    onUpdate: (self) => {
      const activeIndex = Math.round(self.progress * (slideCount - 1));

      if (activeIndex !== lastIndex) {
        swiper.slideTo(activeIndex, 600);

        $textBoxes.removeClass("active");
        $textBoxes.eq(activeIndex).addClass("active");

        lastIndex = activeIndex;
      }
    },
  });

  swiper.on("slideChange", function () {
    const activeIndex = swiper.activeIndex;
    if (activeIndex === lastIndex) {
      return;
    }

    $textBoxes.removeClass("active");
    $textBoxes.eq(activeIndex).addClass("active");

    lastIndex = activeIndex;
    const newProgress = activeIndex / (slideCount - 1);
    const newScrollPos = st.start + newProgress * pinDuration;
    window.scrollTo(0, newScrollPos);
  });

  $textBoxes.eq(0).addClass("active");
});

// cursor
$(document).ready(function () {
  const $customCursor = $(".custom-cursor");
  const $hoverTargets = $(".project-item");
  const $cursorText = $(".cursor-text");

  $(document).on("mousemove", function (e) {
    $customCursor.css({
      top: e.clientY + "px",
      left: e.clientX + "px",
    });

    // ▼ 1. 이 부분을 삭제했습니다.
    // $customCursorFollower.css({ ... });
  });

  $hoverTargets
    .on("mouseenter", function () {
      const text = $(this).data("cursor-text");

      if (text) {
        $cursorText.text(text);
      } else {
        $cursorText.text("View");
      }

      $customCursor.addClass("custom-cursor-active");

      // ▼ 2. 이 부분을 삭제했습니다.
      // $customCursorFollower.addClass("custom-cursor-active");
    })
    .on("mouseleave", function () {
      $customCursor.removeClass("custom-cursor-active");

      // ▼ 3. 이 부분을 삭제했습니다.
      // $customCursorFollower.removeClass("custom-cursor-active");

      $cursorText.text("");
    });
});
