// ──────────────────────────────────────────
// TechMarquee — draggable momentum scroll with hover reveal
// ──────────────────────────────────────────
import { memo, useRef, useState, useCallback } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const techBadges = [
  { name: 'OpenAI', desc: 'GPT-4o Mini' },
  { name: 'Pinecone', desc: 'Vector Database' },
  { name: 'LangChain', desc: 'LLM Framework' },
  { name: 'Redis', desc: 'Memory Store' },
  { name: 'HuggingFace', desc: 'Reranker Model' },
  { name: 'FastAPI', desc: 'Backend API' },
  { name: 'React', desc: 'Frontend UI' },
  { name: 'Tailwind', desc: 'Styling' },
];

function Badge({ name, desc }) {
  return (
    <button
      tabIndex={0}
      className="flex items-center gap-3 px-5 py-2.5 rounded-full shrink-0
                 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm
                 opacity-70 hover:opacity-100 hover:border-mustard-500/20 hover:bg-white/[0.05]
                 hover:scale-105 focus-visible:opacity-100 focus-visible:border-mustard-500/30
                 focus-visible:outline-2 focus-visible:outline-mustard-400
                 transition-all duration-400 whitespace-nowrap cursor-grab active:cursor-grabbing"
    >
      <span className="text-sm font-semibold text-cream tracking-wide">{name}</span>
      <span className="text-2xs text-mist">{desc}</span>
    </button>
  );
}

function DraggableMarqueeRow({ reverse = false, speed = 0.5 }) {
  const containerRef = useRef(null);
  const xRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);

  // Total width of one set of badges
  const getHalfWidth = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 1;
    return el.scrollWidth / 2;
  }, []);

  // Momentum-style auto scroll
  useAnimationFrame(() => {
    if (paused || isDragging) return;
    const halfWidth = getHalfWidth();
    const direction = reverse ? 1 : -1;
    xRef.current += speed * direction;

    // Reset seamlessly
    if (Math.abs(xRef.current) >= halfWidth) {
      xRef.current = xRef.current % halfWidth;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  });

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartOffset.current = xRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    const halfWidth = getHalfWidth();
    xRef.current = dragStartOffset.current + delta;

    // Wrap around
    if (Math.abs(xRef.current) >= halfWidth) {
      xRef.current = xRef.current % halfWidth;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
                 cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setIsDragging(false); }}
      role="region"
      aria-label="Technology stack carousel"
    >
      <div
        ref={containerRef}
        className="flex gap-4 w-max"
        style={{ willChange: 'transform' }}
      >
        {/* Two sets for seamless loop */}
        {techBadges.map((b) => (
          <Badge key={`a-${b.name}`} name={b.name} desc={b.desc} />
        ))}
        {techBadges.map((b) => (
          <Badge key={`b-${b.name}`} name={b.name} desc={b.desc} />
        ))}
      </div>
    </div>
  );
}

function TechMarquee() {
  return (
    <section id="tech-bar" className="relative py-20 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-navy-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/30 to-navy-950" />

      <div className="relative z-10">
        <ScrollReveal className="text-center mb-10">
          <span className="text-2xs font-medium text-mustard-600 tracking-[0.25em] uppercase">
            Technology Stack
          </span>
          <p className="text-sm text-ash mt-2">
            Built on industry-leading AI infrastructure
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          <DraggableMarqueeRow speed={0.5} />
          <DraggableMarqueeRow reverse speed={0.4} />
        </div>
      </div>
    </section>
  );
}

export default memo(TechMarquee);
