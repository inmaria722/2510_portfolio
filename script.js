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
            $loaderWrapper.css("display", "none");
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
  // 1. GSAP 플러그인 등록 (필수!)
  // 이 코드가 있어야 ScrollToPlugin이 작동합니다.
  gsap.registerPlugin(ScrollToPlugin);

  const scrollSpeed = 800; // 0.8초 (ms)

  /* =======================================
     공용 스크롤 및 슬라이드 함수 (★GSAP 버전으로 수정★)
     ======================================= */
  function smoothScrollAndSlide(targetSelector, slideIndex) {
    const $target = $(targetSelector);

    if ($target.length === 0) {
      console.error("Scroll target not found:", targetSelector);
      return;
    }

    // 1. (★수정★) jQuery animate 대신 GSAP ScrollTo 사용
    gsap.to(window, {
      duration: scrollSpeed / 1000, // ms를 초 단위로 변경 (800 -> 0.8)
      scrollTo: $target.offset().top, // 타겟의 y좌표로 스크롤
      ease: "power2.inOut", // 부드러운 스크롤 효과

      // 2. 스크롤 완료 후 실행할 콜백 (Swiper 이동)
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
            swiperInstance.slideTo(slideIndex, 0); // 즉시 이동
          } else {
            console.warn("Swiper instance 'mySwiper' not found on click.");
          }
        }
      },
    });
  }

  /* =======================================
     헤더 링크 클릭 이벤트 (변경 없음)
     ======================================= */

  // 1. *inmaria (로고) 클릭 시: 맨 위로 이동
  $("header > div").on("click", function (e) {
    e.preventDefault();
    // (★수정★) 여기도 GSAP으로 변경
    gsap.to(window, {
      duration: scrollSpeed / 1000,
      scrollTo: 0,
      ease: "power2.inOut",
    });
  });

  // 2. Profile (li 1번째)
  $("header ul li:nth-child(1) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".profile-box");
  });

  // 3. Branding (li 2번째 -> 슬라이드 0번)
  $("header ul li:nth-child(2) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 0);
  });

  // 4. Redesign (li 3번째 -> 슬라이드 1번)
  $("header ul li:nth-child(3) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 1);
  });

  // 5. Appdesign (li 4번째 -> 슬라이드 4번)
  $("header ul li:nth-child(4) a").on("click", function (e) {
    e.preventDefault();
    smoothScrollAndSlide(".project-box", 4);
  });

  // 6. Clonecoding (li 5번째 -> 슬라이드 5번)
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
