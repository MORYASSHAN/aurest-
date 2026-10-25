'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';

export default function FeatureCard({ number, title, text, image, delay = 0 }) {
  const cardRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Spotlight that follows the cursor across the card, coalesced to RAF
  const handlePointerMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      if (!cardRef.current) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${clientX - rect.left}px`);
      card.style.setProperty('--my', `${clientY - rect.top}px`);
    });
  };

  return (
    <Reveal delay={delay}>
      <article ref={cardRef} className="card" onPointerMove={handlePointerMove}>
        <div className="card-media">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 900px) 100vw, 380px"
          />
          <span className="num">{number}</span>
        </div>
        <div className="card-body">
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </article>
    </Reveal>
  );
}
