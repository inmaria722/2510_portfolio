gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// 스크롤 및 이동 기능 변수 설정
let headerScrollTrigger = null; // 헤더 스크롤 감지 기능을 담을 변수
let mySwiper = null; // 슬라이더 객체
let typingTimeouts = []; // 타자 효과의 타이머
let isLoadingComplete = false; // 로딩 체크 깃발
const fadeOutDuration = 700; // 로딩 화면 사라지는 시간

// 타자 인터랙션
function typeWriter($element, text, baseSpeed, onComplete) {
  let i = 0;
  $element.html("");
  $element.css("visibility", "visible");
  $element.addClass("typing");

  function type() {
    // 로딩 끝나면 타이핑 멈추기
    // skip 버튼 눌렀을 때 중단
    if (isLoadingComplete) {
      $element.removeClass("typing");
      return;
    }

    if (i < text.length) {
      //글자 가져오기
      const char = text.charAt(i);

      // html 태그 처리
      if (char === "<") {
        const tagCloseIndex = text.indexOf(">", i);
        if (tagCloseIndex !== -1) {
          $element.append(text.substring(i, tagCloseIndex + 1));
          i = tagCloseIndex;
        }
      } else {
        // 일반 글자
        $element.append(char);
      }

      // 다음 글자로 이동
      i++;

      // 속도 조절 : 기본 속도 + 랜덤 시간
      let delay = baseSpeed + Math.random() * baseSpeed;

      // 쉼표나 마침표 뒤에서는 잠시 쉬어가기
      if (char === "," || char === ".") {
        delay += 350;
      }

      // 재귀 호출
      const timeoutId = setTimeout(type, delay);
      typingTimeouts.push(timeoutId);
    } else {
      // 모두 다 쳤을 때 종료
      $element.removeClass("typing");
      if (onComplete) onComplete();
    }
  }
  type();
}

// 로딩 종료 및 메인 화면 전환
function completeLoading() {
  // 로딩 끝났을 경우 리턴
  if (isLoadingComplete) return;
  isLoadingComplete = true;

  //현재 대기 중인 글자 타이핑 취소
  typingTimeouts.forEach(clearTimeout);
  typingTimeouts = [];

  // 스킵 버튼 숨기기
  $("#skip-loading-btn").css("display", "none");

  // loaded 클래스 추가
  const $loaderWrapper = $("#loading");
  $loaderWrapper.addClass("loaded");

  // 로딩 화면 사라진 후 메인 기능 시작
  setTimeout(function () {
    $loaderWrapper.css("display", "none");
    if (typeof initHeaderScroll === "function") {
      initHeaderScroll();
    }
  }, fadeOutDuration);
}

$(window).on("load", function () {
  const $span1 = $("#loading .con div:first-child span"); // 첫번째 줄 요소
  const $span2 = $("#loading .con div:last-child span"); // 두번째 줄 요소
  const text1 = $span1.html();
  const text2 = $span2.html();
  const typeSpeed = 60; // 글자당 속도
  const delayBetween = 200; // 첫 줄 끝나고 0.2초 쉼
  const delayAfter = 500; // 다 끝나고 0.5초 뒤에 닫기
  typingTimeouts = [];

  // 순차 실행
  typeWriter($span1, text1, typeSpeed, function () {
    if (isLoadingComplete) return;

    // 0.2초 텀으로 출발
    const timeout1 = setTimeout(function () {
      typeWriter($span2, text2, typeSpeed, function () {
        if (isLoadingComplete) return;
        const timeout2 = setTimeout(function () {
          completeLoading(); // 0.5초 뒤에 닫기
        }, delayAfter);
        typingTimeouts.push(timeout2);
      });
    }, delayBetween);
    typingTimeouts.push(timeout1);
  });
});

$(document).ready(function () {
  // 스킵 버튼 눌렀을 때
  $("#skip-loading-btn").on("click", function (e) {
    e.preventDefault();
    completeLoading();
  });

  const scrollSpeed = 800; // 스크롤 이동 속도
  const $links = $("header ul li a"); // 메뉴 링크들
  const $projectBox = $(".project-box"); // 프로젝트 섹션
  const header = $("header")[0]; // 헤더 요소 (DOM 객체 꺼내기)
  let lastDirection = 0; // 스크롤 방향 기억용
  let isNavigating = false; // 현재 자동 이동 중인지 체크

  // 헤더 메뉴 초기화 함수
  function removeAllActive() {
    if ($links && $links.length > 0) {
      $links.removeClass("active");
    }
  }

  // 헤더 -> 목적지 이동
  function smoothScrollAndSlide(targetSelector, slideIndex) {
    // 목적지 요소 존재 여부 확인
    const $target = $(targetSelector);
    if ($target.length === 0) return;

    gsap.to(window, {
      duration: scrollSpeed / 1000, // 0.8초
      scrollTo: $target.offset().top, // 목적지의 top으로 스크롤
      ease: "power2.inOut",

      // 다른 기능과 충돌 방지
      onStart: () => (isNavigating = true),

      onComplete: () => {
        isNavigating = false;
        // 슬라이드 번호 확인
        if (slideIndex !== undefined) {
          if (mySwiper) {
            // 해당 번호의 슬라이드로 이동
            mySwiper.slideTo(slideIndex, 0);
          }
        }
      },
    });
  }

  // 스마트 헤더
  headerScrollTrigger = ScrollTrigger.create({
    start: 0,
    end: "max",

    // 스크롤 할 때 마다 실행
    onUpdate: (self) => {
      // 자동 이동 중일 땐 보여주기
      if (isNavigating) {
        gsap.to(header, { y: "0%", duration: 0.6, ease: "power1.inOut" });
        lastDirection = -1;
        return;
      }
      const currentDirection = self.direction;

      // 스크롤 위치가 최상단 0 일때
      if (self.scroll() === 0) {
        gsap.to(header, { y: "0%", duration: 0.6, ease: "power1.inout" });
        lastDirection = -1;

        //방향이 바뀌었을 때만 실행
      } else if (currentDirection !== lastDirection) {
        //내리면 숨기기, 올리면 보여주기
        if (currentDirection === 1) {
          gsap.to(header, { y: "-100%", duration: 0.6, ease: "power1.inout" });
        } else if (currentDirection === -1) {
          gsap.to(header, { y: "0%", duration: 0.6, ease: "power1.inout" });
        }
        lastDirection = currentDirection;
      }
    },
  });

  // 헤더 이벤트 핸들러
  $("header > div").on("click", function (e) {
    e.preventDefault();
    removeAllActive();

    // 맨 위로 이동
    gsap.to(window, {
      duration: scrollSpeed / 1000,
      scrollTo: 0,
      ease: "power2.inOut",
      onStart: () => (isNavigating = true),
      onComplete: () => (isNavigating = false),
    });
  });

  // 프로필 이동
  $("header ul li:nth-child(1) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".profile-box");
  });

  // 첫번째 슬라이드 이동
  $("header ul li:nth-child(2) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 0);
  });

  // 2번 슬라이드 이동
  $("header ul li:nth-child(3) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 2);
  });

  // 5번 슬라이드 이동
  $("header ul li:nth-child(4) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 5);
  });

  // 6번 슬라이드 이동
  $("header ul li:nth-child(5) a").on("click", function (e) {
    e.preventDefault();
    removeAllActive();
    $(this).addClass("active");
    smoothScrollAndSlide(".project-box", 6);
  });

  function updateActiveSlide(index) {
    if ($links && $links.length > 0) {
      removeAllActive();

      if (index === 0 || index === 1) {
        $links.eq(1).addClass("active");
      } else if (index === 2 || index === 3 || index === 4) {
        $links.eq(2).addClass("active");
      } else if (index === 5) {
        $links.eq(3).addClass("active");
      } else if (index === 6 || index === 7) {
        $links.eq(4).addClass("active");
      }
    }
  }

  // 메뉴 불 켜기
  ScrollTrigger.create({
    trigger: ".banner",
    start: "top 50%",
    end: "bottom 50%",
    onToggle: (self) => {
      if (isNavigating) return;
      if (self.isActive) {
        removeAllActive();
        if ($links && $links.length > 0) {
          $links.eq(0).addClass("active");
        }
      }
    },
  });

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
      }
    },
  });

  // lenis와 gsap 동기화하여 스무스 스크롤 최적화
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // fadeUp
  const fadeUpTargets = $("[data-fade='up']").not(".t-project-item");
  if (fadeUpTargets.length > 0) {
    $.each(fadeUpTargets, function (i, e) {
      const delay = $(e).data("delay") || 0; // delay값 가져오기
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

  // fadeLeft
  const fadeLeftTargets = $("[data-fade='left']");
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

  // project-img-ver 순차적으로 등장
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

  // 탭 버튼 기능
  $(".list-btn button").on("click", function () {
    // 내가 클릭한 버튼에만 불키기
    $(this).addClass("active").siblings().removeClass("active");

    // 콘텐츠 교체
    const targetContent = $(this).data("target"); // 보여줄 대상 가져오기
    $(".project-img-ver, .project-text-ver").removeClass("active"); // 다 숨기기
    const $targetElement = $(targetContent);
    $targetElement.addClass("active"); // 원하는 것만 보여주기
    ScrollTrigger.refresh(); // 높이 바뀌었으니 다시 계산

    // text 버전 리스트 펼치기
    if (
      targetContent === ".project-text-ver" &&
      !$targetElement.hasClass("animated-once")
    ) {
      // 준비 세팅
      gsap.set(".project-text-ver .t-project-item", {
        maxHeight: 0,
        opacity: 0,
        overflow: "hidden",
      });

      // 실행
      gsap.to(".project-text-ver .t-project-item", {
        maxHeight: "500px",
        opacity: 1,
        duration: 0.4,
        ease: "power1.out",
        stagger: 0.05,

        // 애니메이션 끝나면 높이 제한 해제
        onComplete: function () {
          gsap.set(this.targets(), { overflow: "visible", maxHeight: "none" });
        },
      });

      // 애니메이션 실행했음 표시
      $targetElement.addClass("animated-once");
    }
  });

  // 스크롤리텔링

  if (window.innerWidth > 768) {
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

    // 가짜 스크롤 영역 만들기
    if (mySwiper && mySwiper.slides.length > 0) {
      const slideCount = mySwiper.slides.length;
      const pinDuration = (slideCount - 1) * 500; // 슬라이드 1개당 500px씩 영역 확보
      let lastIndex = 0;

      const st = ScrollTrigger.create({
        trigger: ".project-box",
        pin: true, // 화면 고정
        start: "top top",
        end: () => "+=" + pinDuration, // 확보한 길이만큼 고정 유지
        scrub: 0.4, // 부드럽게
        snap: {
          // 자석 효과로 끊어주기
          snapTo: 1 / (slideCount - 1),
          duration: 0.5,
          ease: "power1.inOut",
        },
        onUpdate: (self) => {
          // 스크롤 진행률을 슬라이드 번호로 변환
          const activeIndex = Math.round(self.progress * (slideCount - 1));

          // 번호가 바뀌면 슬라이드 이동
          if (activeIndex !== lastIndex) {
            mySwiper.slideTo(activeIndex, 200);
            if ($textBoxes && $textBoxes.length > 0) {
              // 텍스트 박스도 같이 바꾸기
              $textBoxes.removeClass("active");
              $textBoxes.eq(activeIndex).addClass("active");
            }

            // 헤더 메뉴 불 켜기
            if (!isNavigating) {
              updateActiveSlide(activeIndex);
            }

            lastIndex = activeIndex;
          }
        },
      });

      // 역방향 제어
      mySwiper.on("slideChange", function () {
        if (!isNavigating) {
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

        // 현재 슬라이드 번호를 다시 스크롤 위치로 계산
        const newProgress = activeIndex / (slideCount - 1);
        const newScrollPos = st.start + newProgress * pinDuration;

        // 실제 스크롤바 위치로 이동
        window.scrollTo(0, newScrollPos);
      });

      if ($textBoxes && $textBoxes.length > 0) {
        $textBoxes.eq(0).addClass("active");
      }
    }
  }

  // 마우스 커서 커스텀
  const $customCursor = $(".custom-cursor"); // 커서 역할을 할 div
  const $hoverTargets = $(".project-item");
  const $cursorText = $(".cursor-text");

  // 마우스가 움직일 때마다 이벤트 발생
  $(document).on("mousemove", function (e) {
    $customCursor.css({
      top: e.clientY + "px", // 마우스 Y좌표
      left: e.clientX + "px", // 마우스 X좌표
    });
  });

  $hoverTargets // 프로젝트 아이템들
    .on("mouseenter", function () {
      // 글자 바꾸기
      const text = $(this).data("cursor-text"); //html에 적힌 글자 가져오기
      if (text) {
        $cursorText.text(text);
      } else {
        $cursorText.text("View"); // 없으면 view
      }

      // 모양 바꾸기
      $customCursor.addClass("custom-cursor-active");
    })
    .on("mouseleave", function () {
      // 원상복구
      $customCursor.removeClass("custom-cursor-active");
      $cursorText.text("");
    });

  // 푸터 퀵 이동 버튼
  const $goToFooterBtn = $("#goToFooterBtn");
  const $footer = $("#footer");

  $goToFooterBtn.on("click", function (e) {
    e.preventDefault();

    // 헤더 감지 기능 잠시 끄기
    if (headerScrollTrigger) {
      headerScrollTrigger.disable();
    }

    // 푸터 위치로 이동
    gsap.to(window, {
      duration: 1.0,
      scrollTo: $footer.offset().top,

      ease: "power2.inOut",
      // 도착하면 다시 헤더 기능 켜기
      onComplete: () => {
        if (headerScrollTrigger) {
          headerScrollTrigger.enable();
        }
      },
    });
  });

  // 스크롤 어느정도 내리면 보여주기
  ScrollTrigger.create({
    start: 300,
    onEnter: () => $goToFooterBtn.addClass("show"),
    onLeaveBack: () => $goToFooterBtn.removeClass("show"),
  });
});
