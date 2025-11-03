$(document).ready(function () {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
});

gsap.registerPlugin(ScrollTrigger);

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
