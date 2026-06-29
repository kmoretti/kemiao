import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* Replays an entrance animation (by remounting via a bumped key) on hover —
   but only on devices with a true pointer. Touchscreens synthesize a
   `mouseenter` on tap, which would replay a lone squiggle/frame *without* its
   hover-gated note, reading as half-broken; ignoring those keeps the page a
   clean static thing on touch and the full delight on desktop. */
function useHoverReplay() {
  const [key, setKey] = useState(0);
  const replay = () => {
    if (window.matchMedia?.("(hover: hover)").matches) setKey((k) => k + 1);
  };
  return [key, replay] as const;
}

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
  const [trace, reInk] = useHoverReplay();
  return (
    <span
      onMouseEnter={reInk}
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

/* Hand-drawn marker stamp — a wobbly ellipse scrawled around a word, slightly
   askew, like the red "FOLLOW UP" rubber-stamp on a sticky. Inked in the
   given marker accent. */
function HandStamp({
  children,
  color,
}: {
  children: string;
  color: keyof typeof MARKER;
}) {
  return (
    <span
      className="relative inline-flex -rotate-[8deg] items-center justify-center px-3 py-1 font-hand text-[0.95rem] leading-none"
      style={{ color: MARKER[color] }}
    >
      <svg
        viewBox="0 0 100 44"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <path
          d="M15,9 C42,2 72,4 90,12 C100,18 96,31 83,37 C57,45 25,44 10,34 C1,28 4,15 17,8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

/* The detail that unfolds beneath a project row. Deliberately *not* a card —
   no box, no shadow — just a typed note set between two hairline rules (the
   image's framed-monospace look), then a quiet meta line: the stack on the
   left, and on the right a hand-drawn marker stamp alongside the repo link
   (the stamp stands in for the link when a project is closed source). */
export function ProjectDetail({
  blurb,
  stack,
  href,
  site,
  color,
  stamp,
}: {
  blurb: string;
  stack?: string[];
  href?: string;
  site?: string;
  color: keyof typeof MARKER;
  stamp: string;
}) {
  const detailLink =
    "group/link relative inline-flex items-center font-mono text-[0.7rem] text-soft underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-ink hover:decoration-current";
  return (
    <div className="mb-1 mt-2.5">
      <p className="framed-note py-2 font-mono text-[0.72rem] font-medium leading-[1.5] text-soft">
        {blurb}
      </p>
      <div className="mt-2 flex items-center gap-3">
        {stack && stack.length > 0 && (
          <span className="min-w-0 truncate font-mono text-[0.66rem] text-muted">
            {stack.join("  ·  ")}
          </span>
        )}
        {/* gap-5 clears the absolute link arrows from the next link; pr-5
            keeps the rightmost arrow inside the overflow-clipped fold panel. */}
        <span className="ml-auto flex shrink-0 items-center gap-5 pr-5">
          <HandStamp color={color}>{stamp}</HandStamp>
          {site && (
            <a href={site} className={detailLink}>
              Website
              <LinkDoodle />
            </a>
          )}
          {href && (
            <a href={href} className={detailLink}>
              GitHub
              <LinkDoodle />
            </a>
          )}
        </span>
      </div>
    </div>
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
  const [trace, reTrace] = useHoverReplay();
  return (
    <span
      className="group/note relative inline-block whitespace-nowrap"
      onMouseEnter={reTrace}
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

/* Small hand-drawn heart inked in marker red — flags a link as a "support me"
   gesture rather than just another profile link. Slightly off-kilter so it
   reads as scrawled, not stamped. */
export function HeartDoodle() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mr-1 inline-block size-3 -translate-y-px -rotate-6 align-middle text-marker motion-safe:group-hover/link:animate-heartbeat"
    >
      <path
        fill="currentColor"
        d="M8,13.6 C8,13.6 2.2,9.5 2.1,5.7 C2,3.9 3.5,2.7 5.1,3 C6.4,3.2 7.5,4.2 8,5.2 C8.6,4.1 9.6,3.2 10.9,3 C12.5,2.7 14,3.9 13.9,5.7 C13.8,9.5 8,13.6 8,13.6 Z"
      />
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

/* Postage-stamp perforated border — a fine dashed outline hugging a note, set
   a few px inside the edge. The dash pattern stays uniform at any box size
   (non-scaling stroke) and inks itself in the note's currentColor. */
export function DashedFrame() {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      className="pointer-events-none absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] overflow-visible opacity-70"
    >
      <rect
        x="0.6"
        y="0.6"
        width="98.8"
        height="98.8"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="2 3.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
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

/* QR code popover — on hover, a polaroid-style card appears below the link
   showing a QR code image. Uses the same group-hover reveal as Annotation,
   but for images instead of text. */
export function QrPopover({
  src,
  label,
  children,
}: {
  src: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group/qr relative inline-block">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 z-50 mt-0.5 -translate-x-1/2 rotate-1 scale-90 w-max whitespace-nowrap opacity-0 transition-[opacity,transform] duration-200 group-hover/qr:scale-100 group-hover/qr:opacity-100"
        style={{
          top: "100%",
          backgroundColor: "white",
          borderRadius: "10px 8px 11px 9px / 8px 11px 9px 10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 20px -4px rgba(0,0,0,0.15)",
          padding: "6px",
        }}
      >
        <img
          src={src}
          alt={`QR code for ${label}`}
          width={128}
          height={128}
          className="block size-[128px] rounded-sm"
          draggable={false}
        />
      </span>
    </span>
  );
}

/* Hand-drawn ↗ arrow — a tiny marker scribble for the "view more" button. */
function MoreArrow() {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="inline-block size-[14px] -translate-y-px overflow-visible align-middle"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5,13.5 C8,10.5 11.5,7.5 14.5,4.5" />
        <path d="M9.5,4.5 C12,3.8 14,4.2 14.5,5 C14.8,6.5 14.2,9.5 13.5,12" />
      </g>
    </svg>
  );
}

/* "View more on GitHub" stamp — a small rubber-stamp button at the bottom-right
   of the Projects section. Visible only when the number of projects exceeds
   `showCount`. */
export function ProjectsMoreBtn({ href, label }: { href: string; label?: string }) {
  return (
    <div className="mt-3 flex justify-end">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="stamp group/more inline-flex -rotate-1 items-center gap-1 rounded-[3px] px-2.5 py-[5px] font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em] no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-0"
      >
        {label ?? "more on github"}
        <MoreArrow />
      </a>
    </div>
  );
}

/* Hand-drawn night/day toggle — a quick ink sketch in the margin, like
   someone doodled a moon or sun next to the monogram. Uses the same hover
   re-trace as HandUnderline so the ink feels alive.

   Light page → shows a crescent moon + star flecks (click → dark mode).
   Dark page  → shows a wobbly sun sketch (click → light mode). */
export function ThemeToggle() {
  const [trace, reTrace] = useHoverReplay();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setDark((d) => !d)}
      onMouseEnter={reTrace}
      className="group/theme -rotate-3 cursor-pointer select-none text-muted/70 transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-0 hover:text-ink/80"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="block size-[28px] overflow-visible"
      >
        {dark ? (
          <g key={trace}>
            <path
              className={trace === 0 ? "scribble" : "retrace"}
              d="M12,4 C7.5,4.5 4.5,8 4.5,12.5 C4.5,17.5 8,21 13,21 C16,21 19,19 20.5,16 C17.5,17 14,16.5 11.5,14 C9,11.5 8.5,8 10,5.5 C10.5,4.5 11,4 12,4 Z"
            />
            <path
              className={trace === 0 ? "scribble" : "retrace"}
              d="M19,6 C19.5,5.5 20.8,6.2 20.5,7"
              style={{ animationDelay: "0.2s" }}
            />
            <path
              className={trace === 0 ? "scribble" : "retrace"}
              d="M17.5,3 C18.2,2.5 19,3.5 18.5,4.2"
              style={{ animationDelay: "0.35s" }}
            />
          </g>
        ) : (
          <g key={trace}>
            <path
              className={trace === 0 ? "scribble" : "retrace"}
              d="M12,4.5 C16,4.5 19.5,7.5 19.5,12 C19.5,16.5 16,19.5 12,19.5 C8,19.5 4.5,16.5 4.5,12 C4.5,7.5 8,4.5 12,4.5 Z"
            />
            <g strokeWidth="2">
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M12,2 L12,3.5"
                style={{ animationDelay: "0.1s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M12,20.5 L12,22"
                style={{ animationDelay: "0.15s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M18.5,5.5 L17.3,6.7"
                style={{ animationDelay: "0.2s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M6.7,17.3 L5.5,18.5"
                style={{ animationDelay: "0.25s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M22,12 L20.5,12"
                style={{ animationDelay: "0.3s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M3.5,12 L2,12"
                style={{ animationDelay: "0.35s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M18.5,18.5 L17.3,17.3"
                style={{ animationDelay: "0.4s" }}
              />
              <path
                className={trace === 0 ? "scribble" : "retrace"}
                d="M6.7,6.7 L5.5,5.5"
                style={{ animationDelay: "0.45s" }}
              />
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}
