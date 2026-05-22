'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const TITLES = [
  'Es wird Zeit, Geld zu verdienen.',
  'Der frühe Vogel fängt den Auftrag.',
  'Kein Pitch, kein Profit.',
  'Wer rastet, der verpasst den Bonus.',
  'Heute ist ein guter Tag für einen Deal.',
  'Bereit für den nächsten Move?',
  'Der Markt wartet auf niemanden.',
  'Jetzt oder nie — der Kalender leert sich nicht selbst.',
];

const IMAGES = [
  '/funnycard/funny1.png',
  '/funnycard/funny2.png',
  '/funnycard/funny3.png',
  '/funnycard/funny4.png',
];

const CARD_W = 248;
const CARD_H = 312; // image 248 + title strip ~64

type Side = 'left' | 'right';

interface Constraints { top: number; left: number; right: number; bottom: number }

interface Config {
  side: Side;
  img: string;
  title: string;
  rotation: number;
  constraints: Constraints;
}

function buildConstraints(side: Side): Constraints {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const startX = side === 'right' ? vw - CARD_W - 28 : 28;
  const startY = 28;
  return {
    top:    -startY,
    left:   -startX,
    right:  vw - startX - CARD_W,
    bottom: vh - startY - CARD_H,
  };
}

function getRotation(side: Side): number {
  const magnitude = 2 + Math.random() * 4; // 2–6°
  return side === 'right' ? -magnitude : magnitude;
}

export function FunnyCard() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    const side: Side = Math.random() > 0.5 ? 'right' : 'left';
    setConfig({
      side,
      img:         IMAGES[Math.floor(Math.random() * IMAGES.length)],
      title:       TITLES[Math.floor(Math.random() * TITLES.length)],
      rotation:    getRotation(side),
      constraints: buildConstraints(side),
    });
  }, []);

  if (!config) return null;

  const positionStyle: React.CSSProperties =
    config.side === 'right'
      ? { position: 'fixed', top: 28, right: 28, zIndex: 50 }
      : { position: 'fixed', top: 28, left: 28, zIndex: 50 };

  return (
    <motion.div
      drag
      dragConstraints={config.constraints}
      dragElastic={0.08}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.72, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileDrag={{ scale: 1.04, zIndex: 200 }}
      transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.7 }}
      style={{
        ...positionStyle,
        width:         CARD_W,
        borderRadius:  '14px',
        overflow:      'hidden',
        rotate:        config.rotation,
        cursor:        'grab',
        boxShadow:     '0 12px 36px rgba(14,14,12,0.30), 0 3px 10px rgba(14,14,12,0.16)',
        border:        '1px solid rgba(14,14,12,0.10)',
        background:    '#FCFCFD',
        userSelect:    'none',
        transformOrigin: config.side === 'right' ? 'top right' : 'top left',
        touchAction:   'none',
      }}
    >
      {/* Image — flush to top, left, right */}
      <div style={{ position: 'relative', width: CARD_W, height: CARD_W }}>
        <Image
          src={config.img}
          alt={config.title}
          fill
          sizes={`${CARD_W}px`}
          draggable={false}
          style={{ objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }}
        />
      </div>

      {/* Title strip — flush to left, right, bottom */}
      <div
        style={{
          padding:     '10px 13px 13px',
          background:  '#FCFCFD',
          borderTop:   '1px solid rgba(14,14,12,0.06)',
        }}
      >
        <p
          style={{
            fontFamily:    'var(--font-display)',
            fontStyle:     'italic',
            fontWeight:    400,
            fontSize:      '13px',
            lineHeight:    1.3,
            color:         'var(--ink)',
            letterSpacing: '-0.01em',
            margin:        0,
          }}
        >
          {config.title}
        </p>
      </div>
    </motion.div>
  );
}
