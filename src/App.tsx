import type { ReactNode } from "react";
import avatarMark from "./assets/avatar-mark.png";
import {
  artifacts,
  experience,
  intro,
  links,
  projects,
  type Entry,
  type Project,
} from "./content";

/* ----------------------------- desk elements ----------------------------- */

/* Hand-cut sticky note for dates — uneven corners + a light tilt so the
   writing list reads like little notes pinned to the page. */
function DateTag({ children, tilt }: { children: string; tilt: string }) {
  return (
    <span
      className={`${tilt} sticky-note inline-block shrink-0 px-2 py-[3px] font-mono text-[0.68rem] leading-none tabular-nums`}
      style={{ borderRadius: "9px 6px 8px 6px / 6px 8px 6px 9px" }}
    >
      {children}
    </span>
  );
}

function Stamp({ children }: { children: string }) {
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
function MarkerFrame({ stroke }: { stroke: string }) {
  return (
    <svg
      viewBox="0 0 120 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <g
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
function Sticker({
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
  const className = `${tilt} relative inline-flex shrink-0 items-center px-3 py-[4px] font-hand text-[1.05rem] leading-none`;
  const style = {
    color: stroke,
    backgroundColor: `color-mix(in srgb, ${stroke} 12%, var(--color-paper))`,
    // uneven radii read as hand-cut paper rather than a CSS pill
    borderRadius: "13px 8px 12px 9px / 8px 12px 9px 13px",
    filter:
      "drop-shadow(0 1px 1px rgba(0,0,0,0.05)) drop-shadow(0 7px 10px rgba(0,0,0,0.12))",
  };
  const inner = (
    <>
      <MarkerFrame stroke={stroke} />
      <span className="relative">{badge}</span>
    </>
  );
  if (!href) {
    return (
      <span className={className} style={style}>
        {inner}
      </span>
    );
  }
  return (
    <a
      href={href}
      aria-label={`${label} — open`}
      className={`${className} transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-0`}
      style={style}
    >
      {inner}
    </a>
  );
}

/* Wavy marker underline that hugs whatever text it wraps. */
function HandUnderline({
  children,
  color = "red",
}: {
  children: string;
  color?: keyof typeof MARKER;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        viewBox="0 0 120 10"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-0.5 left-0 h-[7px] w-full overflow-visible"
      >
        <path
          className="scribble"
          d="M2,6 C22,2 40,9 58,5 C78,1 98,9 118,4"
          fill="none"
          stroke={MARKER[color]}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/* Highlighter swipe behind text — a slightly tilted, uneven marker stroke. */
function MarkerHighlight({ children }: { children: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
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
    </span>
  );
}

/* Little hand-drawn pushpin that "pins" the note to the page. */
function Pushpin() {
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

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Spark />
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">
        {children}
      </span>
    </div>
  );
}

/* ------------------------------- list rows -------------------------------- */

function RowShell({ children }: { children: ReactNode }) {
  return (
    <li className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-1.5">
      {children}
    </li>
  );
}

function Label({ children }: { children: string }) {
  return <span className="min-w-0 text-[0.95rem] leading-snug text-ink">{children}</span>;
}

function PlainMeta({ children }: { children: string }) {
  return (
    <span className="shrink-0 font-mono text-[0.78rem] text-muted tabular-nums">
      {children}
    </span>
  );
}

/* --------------------------------- page ----------------------------------- */

function Experience() {
  return (
    <section className="rise mt-9" style={{ animationDelay: "200ms" }}>
      <SectionLabel>experience</SectionLabel>
      <ul>
        {experience.map((r: Entry, i) => (
          <RowShell key={r.label}>
            <Label>{r.label}</Label>
            {i === 0 ? <Stamp>{r.date}</Stamp> : <PlainMeta>{r.date}</PlainMeta>}
          </RowShell>
        ))}
      </ul>
    </section>
  );
}

function Artifacts() {
  return (
    <section className="rise mt-9" style={{ animationDelay: "300ms" }}>
      <SectionLabel>artifacts</SectionLabel>
      <ul>
        {artifacts.map((r: Entry, i) => (
          <RowShell key={r.label}>
            <a
              href={r.href}
              className="min-w-0 text-[0.95rem] leading-snug text-ink underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-ink/40"
            >
              {r.label}
            </a>
            <DateTag tilt={i % 2 === 0 ? "-rotate-2" : "rotate-1"}>{r.date}</DateTag>
          </RowShell>
        ))}
      </ul>
    </section>
  );
}

function Projects() {
  return (
    <section className="rise mt-9" style={{ animationDelay: "400ms" }}>
      <SectionLabel>projects</SectionLabel>
      <ul>
        {projects.map((r: Project, i) => (
          <RowShell key={r.label}>
            {r.href ? (
              <a
                href={r.href}
                className="min-w-0 text-[0.95rem] leading-snug text-ink underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-ink/40"
              >
                {r.label}
              </a>
            ) : (
              <Label>{r.label}</Label>
            )}
            <Sticker
              href={r.href}
              label={r.label}
              badge={r.badge}
              color={r.color}
              tilt={i % 2 === 0 ? "-rotate-3" : "rotate-2"}
            />
          </RowShell>
        ))}
      </ul>
    </section>
  );
}

function Elsewhere() {
  return (
    <section className="rise mt-9" style={{ animationDelay: "500ms" }}>
      <SectionLabel>elsewhere</SectionLabel>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="font-mono text-[0.78rem] text-soft underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-ink hover:decoration-current"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Phrase-level accents for the intro copy. Each phrase gets a different
   hand-drawn flourish — edit the list (or colors) to taste. */
const ACCENTS: { phrase: string; wrap: (s: string) => ReactNode }[] = [
  { phrase: intro.name, wrap: (s) => <HandUnderline color="red">{s}</HandUnderline> },
  { phrase: "full-stack", wrap: (s) => <HandUnderline color="green">{s}</HandUnderline> },
  { phrase: "design", wrap: (s) => <MarkerHighlight>{s}</MarkerHighlight> },
  { phrase: "The Finals", wrap: (s) => <HandUnderline color="blue">{s}</HandUnderline> },
];

function decorateIntro(line: string): ReactNode {
  const pattern = ACCENTS.map((a) =>
    a.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|");
  return line.split(new RegExp(`(${pattern})`)).map((part, i) => {
    const accent = ACCENTS.find((a) => a.phrase === part);
    return <span key={i}>{accent ? accent.wrap(part) : part}</span>;
  });
}

export default function App() {
  return (
    <div className="min-h-svh">
      <main className="mx-auto max-w-[33rem] px-6 pt-16 pb-28 sm:pt-24">
        <header
          className="rise flex items-start justify-between gap-4"
          style={{ animationDelay: "0ms" }}
        >
          <img
            src={avatarMark}
            alt={intro.name}
            width={44}
            height={44}
            className="size-11 shrink-0"
          />
          <span className="select-none pt-1 font-script text-6xl leading-none text-muted/70">
            {intro.initial}
          </span>
        </header>

        <div
          className="rise mt-7 space-y-3 text-[0.95rem] leading-relaxed"
          style={{ animationDelay: "90ms" }}
        >
          {intro.lines.map((line) => (
            <p key={line}>{decorateIntro(line)}</p>
          ))}
        </div>

        <aside
          className="note rise relative mt-5 rounded-md px-3.5 py-3 font-mono text-[0.72rem] leading-relaxed"
          style={{ animationDelay: "170ms" }}
        >
          <Pushpin />
          {intro.status} Find me on{" "}
          <a href={intro.github} className="font-medium underline underline-offset-2">
            GitHub
          </a>{" "}
          or{" "}
          <a href={intro.message} className="font-medium underline underline-offset-2">
            message me
          </a>
          .
        </aside>

        <Experience />
        <Projects />
        <Artifacts />
        <Elsewhere />
      </main>
    </div>
  );
}
