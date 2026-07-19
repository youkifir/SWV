'use client';

import { useState } from 'react';

type Item = { question: string; answer: string };

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="stack" style={{ gap: 10 }}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              type="button"
              className="spread"
              onClick={() => setOpenIndex(open ? null : i)}
              style={{
                width: '100%',
                background: 'transparent',
                boxShadow: 'none',
                color: 'var(--text)',
                padding: '16px 20px',
                textAlign: 'left',
                fontWeight: 600,
                borderRadius: 0,
              }}
            >
              <span>{item.question}</span>
              <span style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease', fontSize: 18 }}>+</span>
            </button>
            {open && (
              <p className="muted" style={{ padding: '0 20px 18px', margin: 0 }}>
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
