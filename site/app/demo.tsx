'use client';

import * as React from 'react';
import type { Contenu } from './content';

/**
 * Une page de Carnet en miniature. Les cases se cochent pour de vrai, avec la
 * coche et le trait de l'application.
 */
export function Demo({ t }: { t: Contenu['demo'] }) {
  const [faites, setFaites] = React.useState(() => t.taches.map(([, coche]) => coche));

  return (
    <div className="relative">
      {/* Deux feuilles glissées dessous : une pile, pas une carte */}
      <div aria-hidden className="bg-sheet ring-rule absolute inset-0 translate-x-3 translate-y-2 rotate-[2.2deg] rounded-[10px] ring-1" />
      <div aria-hidden className="bg-sheet ring-rule absolute inset-0 -translate-x-2 translate-y-1.5 -rotate-[1.6deg] rounded-[10px] ring-1" />

      <div className="bg-sheet ring-rule relative rounded-[10px] px-7 py-8 shadow-[0_1px_0_rgba(11,12,14,.04),0_30px_60px_-30px_rgba(11,12,14,.35)] ring-1 sm:px-9">
        <p className="text-[40px] leading-none">☀️</p>
        <h3 className="titre mt-3 text-[34px]">{t.titre}</h3>

        <ul className="mt-5 space-y-2.5">
          {t.taches.map(([texte], i) => {
            const coche = faites[i];
            return (
              <li key={texte}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={coche}
                  onClick={() => setFaites((f) => f.map((v, j) => (j === i ? !v : v)))}
                  className="group flex w-full items-center gap-3 text-left text-[15px]"
                >
                  <span
                    className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors duration-200 ${
                      coche ? 'border-ink bg-ink' : 'border-ink/30 bg-sheet group-hover:border-ink'
                    }`}
                  >
                    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                      <path
                        d="M2.5 6.2 5 8.6l4.6-5.2"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                        style={{
                          strokeDasharray: 1,
                          strokeDashoffset: coche ? 0 : 1,
                          transition: 'stroke-dashoffset 220ms ease-out'
                        }}
                      />
                    </svg>
                  </span>
                  <span className="relative">
                    <span className={`transition-colors duration-300 ${coche ? 'text-ink-soft' : ''}`}>{texte}</span>
                    {/* Le trait se dessine de gauche à droite, comme au stylo */}
                    <span
                      aria-hidden
                      className="bg-ink-soft/70 absolute top-1/2 left-0 h-px transition-[width] duration-300 ease-out"
                      style={{ width: coche ? '100%' : '0%' }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-[15px]">
          {t.lienAvant}{' '}
          <span className="decoration-ink/25 font-medium underline underline-offset-[3px]">🚀 {t.lienPage}</span>.
        </p>
      </div>
    </div>
  );
}
