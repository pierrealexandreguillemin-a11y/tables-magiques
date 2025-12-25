import { gsap } from 'gsap';

/**
 * Bibliothèque d'effets GSAP ultra modernes
 * ISO/IEC 25010 - Module réutilisable
 */

// Effet 1: Explosion de confettis pour les bonnes réponses
export const confettiExplosion = (container: HTMLElement, count = 50) => {
  const colors = [
    '#ff69b4',
    '#ba55d3',
    '#ffd700',
    '#00ff00',
    '#00ffff',
    '#ff6b6b',
  ];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${8 + Math.random() * 8}px;
      height: ${8 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: 50%;
      top: 50%;
      pointer-events: none;
      z-index: 1000;
    `;
    container.appendChild(particle);

    gsap.to(particle, {
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      scale: Math.random() * 0.5 + 0.5,
      duration: 1.5 + Math.random(),
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    });
  }
};

// Effet 2: Feux d'artifice multi-niveaux
export const fireworksDisplay = (container: HTMLElement) => {
  const fireworkCount = 5;
  const colors = ['#ff69b4', '#ffd700', '#00ff00', '#00ffff', '#ba55d3'];

  for (let f = 0; f < fireworkCount; f++) {
    setTimeout(() => {
      const centerX = Math.random() * 60 + 20; // 20-80% du container
      const centerY = Math.random() * 40 + 20; // 20-60% du container
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const color = colors[f % colors.length];
        particle.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${color};
          border-radius: 50%;
          left: ${centerX}%;
          top: ${centerY}%;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        `;
        container.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 100 + Math.random() * 100;

        gsap.to(particle, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance + 50, // gravité
          opacity: 0,
          scale: 0.3,
          duration: 1 + Math.random() * 0.5,
          ease: 'power2.out',
          onComplete: () => particle.remove(),
        });
      }
    }, f * 300);
  }
};

// Effet 3: Hover magnétique sur boutons
export const magneticHover = (element: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Effet 4: Animation de score qui monte
export const animateScore = (
  element: HTMLElement,
  from: number,
  to: number
) => {
  const obj = { value: from };

  gsap.to(obj, {
    value: to,
    duration: 1.5,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
};

// Effet 5: Shake pour mauvaise réponse
export const shakeError = (element: HTMLElement) => {
  const tl = gsap.timeline();
  tl.to(element, { x: -10, duration: 0.05 })
    .to(element, { x: 10, duration: 0.05 })
    .to(element, { x: -10, duration: 0.05 })
    .to(element, { x: 10, duration: 0.05 })
    .to(element, { x: -5, duration: 0.05 })
    .to(element, { x: 5, duration: 0.05 })
    .to(element, { x: 0, duration: 0.05 });
};

// Effet 6: Pop-in pour nouveau badge
export const badgeUnlock = (element: HTMLElement) => {
  gsap.from(element, {
    scale: 0,
    rotation: -180,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.7)',
  });

  // Glow pulsant
  gsap.to(element, {
    boxShadow: '0 0 30px rgba(255,215,0,0.8)',
    duration: 0.5,
    yoyo: true,
    repeat: 3,
  });
};

// Effet 7: Pulse pour timer critique
export const timerPulse = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 1.1,
    color: '#ff4444',
    duration: 0.3,
    yoyo: true,
    repeat: -1,
    ease: 'power1.inOut',
  });
};

// Effet 8: Stagger reveal pour liste de badges
export const staggerReveal = (
  elements: HTMLElement[] | NodeListOf<Element>
) => {
  gsap.from(elements, {
    y: 50,
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
  });
};

// Effet 9: Transition de page fluide
export const pageTransition = {
  enter: (element: HTMLElement) => {
    gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      ease: 'power2.out',
    });
  },
  exit: (element: HTMLElement, onComplete: () => void) => {
    gsap.to(element, {
      opacity: 0,
      y: -50,
      duration: 0.3,
      ease: 'power2.in',
      onComplete,
    });
  },
};

// Effet 10: Vague de chiffres pour le clavier
export const numberWave = (elements: HTMLElement[] | NodeListOf<Element>) => {
  gsap.from(elements, {
    scale: 0,
    rotation: -90,
    duration: 0.4,
    stagger: 0.05,
    ease: 'back.out(2)',
  });
};

// Effet 11: Celebration cascade pour victoire
export const celebrationCascade = (container: HTMLElement) => {
  const emojis = ['🎉', '🌟', '✨', '💫', '🦄', '👑', '🌈', '💖'];

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const emoji = document.createElement('div');
      emoji.textContent =
        emojis[Math.floor(Math.random() * emojis.length)] ?? '✨';
      emoji.style.cssText = `
        position: absolute;
        font-size: ${24 + Math.random() * 24}px;
        left: ${Math.random() * 100}%;
        top: -50px;
        pointer-events: none;
        z-index: 1000;
      `;
      container.appendChild(emoji);

      gsap.to(emoji, {
        y: window.innerHeight + 100,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 720 - 360,
        duration: 2 + Math.random() * 2,
        ease: 'power1.in',
        onComplete: () => emoji.remove(),
      });
    }, i * 150);
  }
};

// Effet 12: Glow pulsant sur élément actif
export const glowPulse = (element: HTMLElement, color = '#ff69b4') => {
  return gsap.to(element, {
    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
    duration: 0.8,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
};
