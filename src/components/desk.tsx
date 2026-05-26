import {
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
  color,
  stamp,
}: {
  blurb: string;
  stack?: string[];
  href?: string;
  color: keyof typeof MARKER;
  stamp: string;
}) {
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
        <span className="ml-auto flex shrink-0 items-center gap-3">
          <HandStamp color={color}>{stamp}</HandStamp>
          {href && (
            <a
              href={href}
              className="group/link relative inline-flex items-center font-mono text-[0.7rem] text-soft underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-ink hover:decoration-current"
            >
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
