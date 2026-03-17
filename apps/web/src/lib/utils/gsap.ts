import gsap from "gsap";

/**
 * Anima entrada de elementos com fade + translateY (leve).
 * Uso: ref no container e chamar após mount.
 */
export function animateIn(
  element: HTMLElement | null,
  options?: { delay?: number; stagger?: number; y?: number },
): void {
  if (!element) return;
  const { delay = 0, stagger = 0.05, y = 8 } = options ?? {};
  const children = element.querySelectorAll("[data-animate-in]");
  gsap.fromTo(
    children.length > 0 ? children : element,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: 0.35,
      delay,
      stagger: children.length > 0 ? stagger : 0,
      ease: "power2.out",
    },
  );
}

/**
 * Anima um único elemento (fade + scale sutil).
 */
export function animateElement(
  element: HTMLElement | null,
  options?: { delay?: number; scale?: number },
): void {
  if (!element) return;
  const { delay = 0, scale = 0.98 } = options ?? {};
  gsap.fromTo(
    element,
    { opacity: 0, scale },
    {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      delay,
      ease: "power2.out",
    },
  );
}
