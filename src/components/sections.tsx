import type { ReactNode } from "react";
import {
  artifacts,
  experience,
  links,
  projects,
  type Entry,
  type Project,
} from "../content";
import {
  CopyEmailLink,
  DateTag,
  elsewhereLink,
  LinkDoodle,
  LiveDot,
  SectionLabel,
  Stamp,
  Sticker,
} from "./desk";

/* ------------------------------- list rows -------------------------------- */

function RowShell({ children }: { children: ReactNode }) {
  return (
    <li className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-1.5">
      {children}
    </li>
  );
}

function Label({ children }: { children: string }) {
  return (
    <span className="min-w-0 text-[0.95rem] leading-snug text-ink">
      {children}
    </span>
  );
}

function PlainMeta({ children }: { children: string }) {
  return (
    <span className="shrink-0 font-mono text-[0.78rem] text-muted tabular-nums">
      {children}
    </span>
  );
}

/* -------------------------------- sections -------------------------------- */

export function Experience() {
  return (
    <section className="rise mt-9" style={{ animationDelay: "200ms" }}>
      <SectionLabel>experience</SectionLabel>
      <ul>
        {experience.map((r: Entry, i) => (
          <RowShell key={r.label}>
            <Label>{r.label}</Label>
            {i === 0 ? (
              <Stamp>{r.date}</Stamp>
            ) : (
              <PlainMeta>{r.date}</PlainMeta>
            )}
          </RowShell>
        ))}
      </ul>
    </section>
  );
}

export function Artifacts() {
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
            <DateTag tilt={i % 2 === 0 ? "-rotate-2" : "rotate-1"}>
              {r.date}
            </DateTag>
          </RowShell>
        ))}
      </ul>
    </section>
  );
}

export function Projects() {
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

export function Elsewhere() {
  return (
    <section className="rise mt-9" style={{ animationDelay: "500ms" }}>
      <SectionLabel>elsewhere</SectionLabel>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith("mailto:") ? (
              <CopyEmailLink href={l.href} label={l.label} />
            ) : (
              <a href={l.href} className={elsewhereLink}>
                {l.label}
                <LinkDoodle />
              </a>
            )}
          </li>
        ))}
        {/* "around / online" dot, pushed to the far right of the row */}
        <li className="ml-auto flex items-center" aria-hidden="true">
          <LiveDot />
        </li>
      </ul>
    </section>
  );
}
