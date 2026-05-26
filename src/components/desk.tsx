import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* ----------------------------- desk elements ----------------------------- */

/* Peel-off sticker — grab it, fling it around, and it springs back to its
   resting spot when you let go, the way a real sticker re-settles. It tilts
   and lifts slightly while held so it reads as physically picked up. */
export function DraggableSticker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);
  // True from release until the spring-back transition finishes, so the
  // sticker stays lifted above the page while it animates home.
  const [settling, setSettling] = useState(false);

  const grab = (e: ReactPointerEvent) => {
    origin.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setHeld(true);
    ref.current?.setPointerCapture(e.pointerId);
  };

  const move = (e: ReactPointerEvent) => {
    if (!origin.current) return;
    setPos({
      x: e.clientX - origin.current.x,
      y: e.clientY - origin.current.y,
    });
  };

  const release = () => {
    origin.current = null;
    setHeld(false);
    setSettling(true);
    setPos({ x: 0, y: 0 }); // springs home via the eased transition below
  };

  // Tilt with horizontal drag so it swings like it's stuck on by one corner.
  const tilt = held ? Math.max(-12, Math.min(12, pos.x * 0.08)) : 0;

  return (
    <div
      ref={ref}
      onPointerDown={grab}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onTransitionEnd={() => setSettling(false)}
      className={`${className ?? ""} touch-none select-none`}
      style={{
        cursor: held ? "grabbing" : "grab",
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${tilt}deg) scale(${held ? 1.08 : 1})`,
        // No transition while held (follows the pointer 1:1); on release the
        // overshooting ease-back gives the springy "snap home" bounce.
        transition: held
          ? "none"
          : "transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)",
        // Stay above everything (incl. the z-40 hover annotations) while
        // grabbed and during the spring-back, so it never slips underneath.
        position: held || settling ? "relative" : undefined,
        zIndex: held || settling ? 100 : undefined,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/* Corner script monogram that writes itself in on load and re-inks on hover
   (the key remount replays the wipe), echoing the page's drawn-by-hand feel. */
export function Monogram({ children }: { children: string }) {
  const [trace, setTrace] = useState(0);
  return (
    <span
      onMouseEnter={() => setTrace((t) => t + 1)}
      className="select-none pt-1 font-script text-6xl leading-none text-muted/70"
    >
      <span
        key={trace}
        className={`inline-block ${trace === 0 ? "inkwrite" : "inkwrite-re"}`}
      >
        {children}
      </span>
    </span>
  );
}

/* Hand-cut sticky note for dates — uneven corners + a light tilt so the
   writing list reads like little notes pinned to the page. Lifts and
   straightens when its row is hovered, like the project stickers. */
export function DateTag({
  children,
  tilt,
}: {
  children: string;
  tilt: string;
}) {
  return (
    <span
      className={`${tilt} sticky-note inline-block shrink-0 px-2 py-[3px] font-mono text-[0.68rem] leading-none tabular-nums transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-0`}
      style={{ borderRadius: "9px 6px 8px 6px / 6px 8px 6px 9px" }}
    >
      {children}
    </span>
  );
}

export function Stamp({ children }: { children: string }) {
  return (
    <span className="stamp inline-block -rotate-[5deg] rounded-[3px] px-2 py-[3px] font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em]">
      {children}
    </span>
  );
}

const MARKER = {
  red: "var(--color-marker)",
  green: "var(--color-marker-green)",
  blue: "var(--color-marker-blue)",
} as const;

/* The marker outline for a sticker: two slightly offset, wobbly strokes whose
   edges overshoot the corners — the way a felt-tip looks when you box something
   in twice. `vector-effect` keeps the line an even weight however wide the badge
   stretches; the second pass is fainter, for that "gone over it again" feel. */
function MarkerFrame({
  stroke,
  traceKey = 0,
}: {
  stroke: string;
  traceKey?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      {/* Remounting the group (via the key) replays the re-trace; the dash
          props inherit down to both passes, so the whole frame re-inks. */}
      <g
        key={traceKey}
        className={traceKey > 0 ? "retrace-frame" : undefined}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        <path d="M8,8 C34,5 64,10 113,5 M114,6 C117,18 115,28 113,39 M114,37 C80,41 44,35 6,40 M7,38 C4,28 6,17 8,6" />
        <path
          opacity="0.45"
          transform="translate(-0.6 0.8)"
          d="M9,9 C36,6 66,11 112,7 M113,8 C116,18 114,28 112,37 M113,35 C80,39 44,34 8,38 M9,37 C6,28 8,18 9,8"
        />
      </g>
    </svg>
  );
}

/* Hand-drawn sticker: tinted fill with uneven corners, hand-inked marker
   outline, lightly peeled off the page. Renders as a link when `href` is given
   (straightens and lifts on hover), otherwise as a plain badge. */
export function Sticker({
  href,
  label,
  badge,
  color,
  tilt,
}: {
  href?: string;
  label: string;
  badge: string;
  color: keyof typeof MARKER;
  tilt: string;
}) {
  const stroke = MARKER[color];
  // Bumping this on hover remounts the frame so it re-inks itself.
  const [trace, setTrace] = useState(0);
  const reInk = () => setTrace((t) => t + 1);
  const className = `${tilt} relative inline-flex shrink-0 items-center px-3 py-[4px] font-hand text-[1.05rem] leading-none`;
  const style = {
    color: stroke,
    backgroundColor: `color-mix(in srgb, ${stroke} 12%, var(--color-paper))`,
    // uneven radii read as hand-cut paper rather than a CSS pill
    borderRadius: "13px 8px 12px 9px / 8px 12px 9px 13px",
    filter:
      "drop-shadow(0 1px 1px rgba(0,0,0,0.04)) drop-shadow(0 3px 5px rgba(0,0,0,0.08))",
  };
  const inner = (
    <>
      <MarkerFrame stroke={stroke} traceKey={trace} />
      <span className="relative">{badge}</span>
    </>
  );
  if (!href) {
    return (
      <span className={className} style={style} onMouseEnter={reInk}>
        {inner}
      </span>
    );
  }
  return (
    <a
      href={href}
      aria-label={`${label} — open`}
      onMouseEnter={reInk}
      className={`${className} transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-0`}
      style={style}
    >
      {inner}
    </a>
  );
}

/* Wavy marker underline that hugs whatever text it wraps. */
export function HandUnderline({
  children,
  color = "red",
  note,
}: {
  children: string;
  color?: keyof typeof MARKER;
  note?: string;
}) {
  // Bumping this key remounts the path, replaying the re-trace animation each
  // time the phrase is hovered.
  const [trace, setTrace] = useState(0);
  return (
    <span
      className="group/note relative inline-block whitespace-nowrap"
      onMouseEnter={() => setTrace((t) => t + 1)}
    >
      {children}
      <svg
        viewBox="0 0 120 10"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-0.5 left-0 h-[7px] w-full overflow-visible"
      >
        <path
          key={trace}
          className={trace === 0 ? "scribble" : "retrace"}
          d="M2,6 C22,2 40,9 58,5 C78,1 98,9 118,4"
          fill="none"
          stroke={MARKER[color]}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {note && <Annotation stroke={MARKER[color]}>{note}</Annotation>}
    </span>
  );
}

/* Highlighter swipe behind text — a slightly tilted, uneven marker stroke. */
export function MarkerHighlight({
  children,
  note,
}: {
  children: string;
  note?: string;
}) {
  return (
    <span className="group/note relative inline-block whitespace-nowrap">
      <span
        aria-hidden="true"
        className="absolute inset-x-[-3px] bottom-[2px] top-[38%] -rotate-1"
        style={{
          background:
            "color-mix(in srgb, var(--color-sticky) 80%, transparent)",
          borderRadius: "6px 4px 7px 3px / 4px 7px 3px 6px",
        }}
      />
      <span className="relative">{children}</span>
      {note && <Annotation stroke="var(--color-stamp)">{note}</Annotation>}
    </span>
  );
}

/* Hand-scribbled margin note that peels up above its phrase on hover — paper
   stock, marker ink, lightly tilted, like a sticky added as an afterthought.
   The parent must carry the `group/note` class. */
function Annotation({
  children,
  stroke,
}: {
  children: string;
  stroke: string;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 -translate-x-1/2 -rotate-2 scale-90 whitespace-nowrap border px-2 py-[3px] font-hand text-[0.8rem] font-normal leading-none text-(--ann) opacity-0 transition-[opacity,transform] duration-200 group-hover/note:scale-100 group-hover/note:opacity-100"
      style={
        {
          "--ann": stroke,
          borderColor: `color-mix(in srgb, ${stroke} 55%, transparent)`,
          backgroundColor: "var(--color-paper)",
          // uneven corners read as hand-torn, not a CSS pill
          borderRadius: "9px 6px 8px 6px / 6px 8px 6px 9px",
          boxShadow: "0 1px 1px rgba(0,0,0,0.04), 0 3px 6px rgba(0,0,0,0.09)",
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}

/* Tiny marker arrow that sketches itself in to the upper-right of a link on
   hover — the "this goes somewhere" flourish. Inherits the link's color via
   currentColor; absolutely placed so it never nudges the layout. */
export function LinkDoodle() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="pointer-events-none absolute left-full top-[0.1em] ml-[3px] size-3 -translate-x-1 -rotate-3 overflow-visible opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3,12.6 C7,9 10,6 12.7,3.1" />
        <path d="M6.6,2.9 C9.4,2.7 12.4,2.9 12.9,3.2 C13.2,4.2 13.2,7 13,9.4" />
      </g>
    </svg>
  );
}

/* Small "live now" dot — a marker-green blob with a slow ping ring, an
   ambient "I'm around" indicator at the right edge of the elsewhere links. */
export function LiveDot() {
  return (
    <span className="relative inline-block size-[7px]">
      <span
        className="live-ping absolute inset-0 rounded-full"
        style={{ background: "var(--color-marker-green)" }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "var(--color-marker-green)" }}
      />
    </span>
  );
}

/* Shared look for the "elsewhere" links so the plain and copy-to-clipboard
   variants stay in sync. */
export const elsewhereLink =
  "group/link relative font-mono text-[0.78rem] text-soft underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-ink hover:decoration-current";

/* An "elsewhere" link for an email: opens the mailto as usual, but also copies
   the address and peels up a handwritten "copied!" sticky that fades on its
   own. Clipboard failures are ignored — the mailto still fires. */
export function CopyEmailLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = () => {
    const email = href.replace(/^mailto:/, "");
    navigator.clipboard?.writeText(email).then(
      () => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1300);
      },
      () => {},
    );
    // No preventDefault: let the mailto open the user's mail client too.
  };

  return (
    <a href={href} onClick={copy} className={elsewhereLink}>
      {label}
      <LinkDoodle />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 -translate-x-1/2 -rotate-2 whitespace-nowrap border px-2 py-[3px] font-hand text-[0.8rem] leading-none text-(--ok) transition-[opacity,transform] duration-200 ${copied ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
        style={
          {
            "--ok": "var(--color-marker-green)",
            borderColor:
              "color-mix(in srgb, var(--color-marker-green) 55%, transparent)",
            backgroundColor: "var(--color-paper)",
            borderRadius: "9px 6px 8px 6px / 6px 8px 6px 9px",
            boxShadow: "0 1px 1px rgba(0,0,0,0.04), 0 3px 6px rgba(0,0,0,0.09)",
          } as CSSProperties
        }
      >
        copied!
      </span>
    </a>
  );
}

/* Little hand-drawn pushpin that "pins" the note to the page. */
export function Pushpin() {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className="absolute -left-2.5 -top-2.5 size-7 -rotate-12 overflow-visible drop-shadow-sm"
    >
      {/* needle */}
      <path
        d="M13,12 L18.5,23"
        fill="none"
        stroke="var(--color-stamp)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* head */}
      <circle
        cx="11"
        cy="9"
        r="6.5"
        fill="var(--color-marker)"
        stroke="var(--color-paper)"
        strokeWidth="1.4"
      />
      {/* shine */}
      <circle cx="8.6" cy="6.8" r="1.7" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

/* Hand-drawn asterisk spark — three slightly-wobbly marker strokes, replaces
   the ✳ glyph that renders as a color emoji on iOS. */
function Spark() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-3 shrink-0 -rotate-6 overflow-visible text-marker"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M8,1.8 C7.7,5 8.2,11 8,14.2" />
        <path d="M2.4,4.6 C5,6.2 11,9.8 13.6,11.4" />
        <path d="M13.6,4.6 C11,6.2 5,9.8 2.4,11.4" />
      </g>
    </svg>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Spark />
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">
        {children}
      </span>
    </div>
  );
}
