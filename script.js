gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

let headerScrollTrigger = null;
let mySwiper = null;
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

/* =======================================
   4. 메인 스크립트 (Document Ready)
   ======================================= */
$(document).ready(function () {
  // --- 스킵 버튼 ---
  $("#skip-loading-btn").on("click", function (e) {
    e.preventDefault();
    completeLoading();
  });

  // --- 헤더 (숨김 & 스크롤스파이) ---
  const scrollSpeed = 800;
  const $links = $("header ul li a");
  const $projectBox = $(".project-box");
  const header = $("header")[0];
  let lastDirection = 0;
  let isNavigating = false;

  function removeAllActive() {
    if ($links && $links.length > 0) {
      $links.removeClass("active");
    }
  }

  function smoothScrollAndSlide(targetSelector, slideIndex) {
    const $target = $(targetSelector);
    if ($target.length === 0) return;
    gsap.to(window, {
      duration: scrollSpeed / 1000,
      scrollTo: $target.offset().top,
      ease: "power2.inOut",
      onStart: () => (isNavigating = true),
      onComplete: () => {
        isNavigating = false;
        if (slideIndex !== undefined) {
          if (mySwiper) {
            mySwiper.slideTo(slideIndex, 0);
          }
        }
      },
    });
  }

  headerScrollTrigger = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      if (isNavigating) {
        gsap.to(header, { y: "0%", duration: 0.6, ease: "power1.inOut" });
        lastDirection = -1;
        return;
      }
      const currentDirection = self.direction;
      if (self.scroll() === 0) {
        gsap.to(header, { y: "0%", duration: 0.6, ease: "power1.inout" });
        lastDirection = -1;
      } else if (currentDirection !== lastDirection) {
        if (currentDirection === 1) {
          gsap.to(header, { y: "-100%", duration: 0.6, ease: "power1.inout" });
        } else if (currentDirection === -1) {
          gsap.to(header, { y: "0%", duration: 0.6, ease: "power1.inout" });
        }
        lastDirection = currentDirection;
      }
    },
  });

  $("header > div").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    gsap.to(window, {
      duration: scrollSpeed / 1000,
      scrollTo: 0,
      ease: "power2.inOut",
      onStart: () => (isNavigating = true),
      onComplete: () => (isNavigating = false),
    });
  });
  $("header ul li:nth-child(1) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".profile-box");
  });
  $("header ul li:nth-child(2) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 0);
  });
  $("header ul li:nth-child(3) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 1);
  });
  $("header ul li:nth-child(4) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 4);
  });
  $("header ul li:nth-child(5) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 5);
  });

  function updateActiveSlide(index) {
    if ($links && $links.length > 0) {
      removeAllActive();
      if (index === 0) $links.eq(1).addClass("active");
      else if (index === 1) $links.eq(2).addClass("active");
      else if (index === 4) $links.eq(3).addClass("active");
      else if (index === 5) $links.eq(4).addClass("active");
    }
  }

  ScrollTrigger.create({
    trigger: ".profile-box",
    start: "top 50%",
    end: "bottom 50%",
    onToggle: (self) => {
      if (isNavigating) return;
      if (self.isActive) {
        removeAllActive();
        if ($links && $links.length > 0) {
          $links.eq(0).addClass("active");
        }
      } else {
        removeAllActive();
      }
    },
  });

  const projectTrigger = ScrollTrigger.create({
    trigger: $projectBox,
    start: "top 50%",
    end: "bottom 50%",
    onToggle: (self) => {
      if (isNavigating) return;
      if (self.isActive) {
        if (mySwiper) {
          updateActiveSlide(mySwiper.realIndex);
        }
      } else {
        removeAllActive();
      }
    },
  });

  // --- Lenis 스크롤 ---
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // --- GSAP 섹션 애니메이션 (fade-up, fade-left) ---
  const fadeUpTargets = $("[fade='up']").not(".t-project-item");
  if (fadeUpTargets.length > 0) {
    $.each(fadeUpTargets, function (i, e) {
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
  }

  const fadeLeftTargets = $("[fade='left']");
  if (fadeLeftTargets.length > 0) {
    $.each(fadeLeftTargets, function (i, e) {
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
  }

  // --- GSAP 섹션 애니메이션 (project-img-ver) ---
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

  // --- list-btn (탭 기능) ---
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

  // --- Project Box (Swiper 핀 & 스크롤 연동) ---
  const $textBoxes = $(".project-box .con .left .text-box");

  mySwiper = new Swiper(".mySwiper", {
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

  if (mySwiper && mySwiper.slides.length > 0) {
    const slideCount = mySwiper.slides.length;
    const pinDuration = (slideCount - 1) * 500;
    let lastIndex = 0;

    const st = ScrollTrigger.create({
      trigger: ".project-box",
      pin: true,
      start: "top top",
      end: () => "+=" + pinDuration,
      scrub: 0.2,
      snap: {
        snapTo: 1 / (slideCount - 1),
        duration: 0.6,
        ease: "power1.inOut",
      },
      onUpdate: (self) => {
        const activeIndex = Math.round(self.progress * (slideCount - 1));
        if (activeIndex !== lastIndex) {
          mySwiper.slideTo(activeIndex, 600);
          if ($textBoxes && $textBoxes.length > 0) {
            $textBoxes.removeClass("active");
            $textBoxes.eq(activeIndex).addClass("active");
          }
          lastIndex = activeIndex;
        }
      },
    });

    mySwiper.on("slideChange", function () {
      if (projectTrigger && projectTrigger.isActive && !isNavigating) {
        updateActiveSlide(mySwiper.realIndex);
      }
      const activeIndex = mySwiper.activeIndex;
      if (activeIndex === lastIndex) {
        return;
      }
      if ($textBoxes && $textBoxes.length > 0) {
        $textBoxes.removeClass("active");
        $textBoxes.eq(activeIndex).addClass("active");
      }
      lastIndex = activeIndex;
      const newProgress = activeIndex / (slideCount - 1);
      const newScrollPos = st.start + newProgress * pinDuration;
      window.scrollTo(0, newScrollPos);
    });

    if ($textBoxes && $textBoxes.length > 0) {
      $textBoxes.eq(0).addClass("active");
    }
  }

  // --- 커스텀 커서 ---
  const $customCursor = $(".custom-cursor");
  const $hoverTargets = $(".project-item");
  const $cursorText = $(".cursor-text");
  $(document).on("mousemove", function (e) {
    $customCursor.css({
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
    })
    .on("mouseleave", function () {
      $customCursor.removeClass("custom-cursor-active");
      $cursorText.text("");
    });

  // --- 푸터 이동 버튼 ---
  const $goToFooterBtn = $("#goToFooterBtn");
  const $footer = $("#footer");

  $goToFooterBtn.on("click", function (e) {
    e.preventDefault();

    if (headerScrollTrigger) {
      headerScrollTrigger.disable();
    }

    gsap.to(window, {
      duration: 1.0,
      scrollTo: $footer.offset().top,

      ease: "power2.inOut",
      onComplete: () => {
        if (headerScrollTrigger) {
          headerScrollTrigger.enable();
        }
      },
    });
  });

  ScrollTrigger.create({
    start: 300,
    onEnter: () => $goToFooterBtn.addClass("show"),
    onLeaveBack: () => $goToFooterBtn.removeClass("show"),
  });
});
