import { useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

type RevealOptions = {
  selector?: string;
  rootMargin?: string;
  threshold?: number | number[];
};

const defaultOptions: Required<RevealOptions> = {
  selector: '[data-reveal]',
  rootMargin: '0px 0px -10% 0px',
  threshold: 0.2,
};

export default function useScrollReveal(
  deps: readonly unknown[] = [],
  options: RevealOptions = {}
) {
  const prefersReducedMotion = useReducedMotion();
  const { selector, rootMargin, threshold } = { ...defaultOptions, ...options };

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));

    if (nodes.length === 0) {
      return;
    }

    if (prefersReducedMotion) {
      nodes.forEach((node) => node.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add('is-revealed');
            observer.unobserve(target);
          }
        });
      },
      { rootMargin, threshold }
    );

    nodes.forEach((node) => {
      if (node.dataset.revealDelay) {
        node.style.setProperty('--reveal-delay', `${Number(node.dataset.revealDelay)}ms`);
      }
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [prefersReducedMotion, selector, rootMargin, threshold, ...deps]);
}
