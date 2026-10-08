'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';

export default function FeatureCard({ number, title, text, image, delay = 0 }) {
  const cardRef = useRef(null);

  // Spotlight that follows the cursor across the card
  const handlePointerMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
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
