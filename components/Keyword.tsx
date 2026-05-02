'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getDefinition } from '@/lib/glossary';

interface KeywordProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export default function Keyword({ term, children, className = '' }: KeywordProps) {
  const definition = getDefinition(term);

  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleEnter = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    setVisible(true);
  }, []);

  if (!definition) return <span className={className}>{children}</span>;

  return (
    <>
      <span
        ref={ref}
        className={`border-b border-dotted border-forest-bright/60 cursor-help ${className}`}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>

      {visible && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(5,15,5,0.97)',
            border: '1px solid rgba(34,197,94,0.5)',
            borderRadius: 8,
            padding: '7px 12px',
            fontSize: 12,
            fontFamily: 'Nunito, sans-serif',
            color: '#d1fae5',
            maxWidth: 240,
            whiteSpace: 'normal',
            boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
            lineHeight: 1.5,
          }}>
            {definition}
            <div style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(34,197,94,0.5)',
            }} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
