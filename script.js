gsap.registerPlugin(ScrollTrigger);

/**
 * 텍스트를 한 글자씩 타이핑하는 함수 (★수정된 jQuery 버전★)
 * @param {jQuery} $element - 텍스트를 표시할 jQuery 객체
 * @param {string} text - 타이핑할 원본 텍스트 (HTML 포함)
 * @param {number} baseSpeed - 타이핑 기본 속도 (ms)
 * @param {function} onComplete - 타이핑 완료 시 실행할 콜백 함수
 */
function typeWriter($element, text, baseSpeed, onComplete) {
  let i = 0;
  $element.html("");

  $element.css("visibility", "visible");

  $element.addClass("typing"); // .classList.add('typing')

  function type() {
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

      setTimeout(type, delay);
    } else {
      $element.removeClass("typing"); // .classList.remove('typing')
      if (onComplete) onComplete();
    }
  }

  type(); // 타이핑 시작
}

$(window).on("load", function () {
  const $loaderWrapper = $("#loading");
  const $span1 = $("#loading .con div:first-child span");
  const $span2 = $("#loading .con div:last-child span");

  const text1 = $span1.html();
  const text2 = $span2.html();

  const typeSpeed = 30;
  const delayBetween = 200;
  const delayAfter = 500;
  const fadeOutDuration = 700;

  // 'typeWriter' 함수를 호출(사용)
  typeWriter($span1, text1, typeSpeed, function () {
    setTimeout(function () {
      typeWriter($span2, text2, typeSpeed, function () {
        setTimeout(function () {
          $loaderWrapper.addClass("loaded");
          setTimeout(function () {
            if (typeof initHeaderScroll === "function") {
              initHeaderScroll();
            }
          }, fadeOutDuration);
        }, delayAfter);
      });
    }, delayBetween);
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

    $customCursorFollower.css({
      top: e.clientY + "px",
      left: e.clientX + "px",
    });
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
      $customCursorFollower.addClass("custom-cursor-active");
    })
    .on("mouseleave", function () {
      $customCursor.removeClass("custom-cursor-active");
      $customCursorFollower.removeClass("custom-cursor-active");

      $cursorText.text("");
    });
});
