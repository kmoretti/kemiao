import { useEffect, useState, type ReactNode } from "react";
import {
  artifacts,
  artifactsConfig,
  experience,
  links,
  projects,
  projectsConfig,
  type Entry,
  type Project,
} from "../content";
import {
  DateTag,
  elsewhereLink,
  HeartDoodle,
  LinkDoodle,
  LiveDot,
  ProjectDetail,
  ProjectsMoreBtn,
  SectionLabel,
  Stamp,
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
  const [rssEntries, setRssEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    if (artifactsConfig.mode !== "rss" || !artifactsConfig.rssUrl) return;
    let cancelled = false;
    fetch(`/api/rss?url=${encodeURIComponent(artifactsConfig.rssUrl)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Entry[]) => {
        if (!cancelled) setRssEntries(data.slice(0, artifactsConfig.showCount));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const source = rssEntries ?? artifacts;

  return (
    <section className="rise mt-9" style={{ animationDelay: "300ms" }}>
      <SectionLabel>artifacts</SectionLabel>
      <ul>
        {source?.map((r: Entry, i) => (
          <RowShell key={r.href ?? r.label}>
            <a
              href={r.href}
              className="group/link relative min-w-0 text-[0.95rem] leading-snug text-ink underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-ink/40"
            >
              {r.label}
              <LinkDoodle />
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

/* A project row that toggles its unfolding detail. The row itself is the
   button (so the whole thing is an easy target); the outbound repo link lives
   inside the detail, which keeps interactive elements from nesting and gives
   the closed-source project somewhere to "open" too. Open/closed is owned by
   the parent so only one row can be expanded at a time. */
function ProjectRow({
  r,
  dateTilt,
  open,
  onToggle,
}: {
  r: Project;
  dateTilt: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `proj-${r.label.replace(/\W+/g, "-")}`;
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-1.5 text-left"
      >
        <span className="min-w-0 text-[0.95rem] leading-snug text-ink underline decoration-transparent underline-offset-4 transition-colors duration-200 group-hover:decoration-ink/40">
          {r.label}
        </span>
        <DateTag tilt={dateTilt}>{r.date}</DateTag>
      </button>
      {/* `inert` while folded so the clipped link stays out of tab/AT order. */}
      <div id={panelId} className={`fold ${open ? "open" : ""}`} inert={!open}>
        <div>
          <ProjectDetail
            blurb={r.blurb ?? ""}
            stack={r.stack}
            href={r.href}
            site={r.site}
            color={r.color}
            stamp={r.stamp}
          />
        </div>
      </div>
    </li>
  );
}

export function Projects() {
  // Only one project sits open at a time; clicking the open row closes it.
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const visible = projects.slice(0, projectsConfig.showCount);
  const showMore = projects.length >= projectsConfig.showCount;
  return (
    <section className="rise mt-9" style={{ animationDelay: "400ms" }}>
      <SectionLabel>projects</SectionLabel>
      <ul>
        {visible.map((r: Project, i) => (
          <ProjectRow
            key={r.label}
            r={r}
            dateTilt={i % 2 === 0 ? "-rotate-2" : "rotate-1"}
            open={openLabel === r.label}
            onToggle={() =>
              setOpenLabel((cur) => (cur === r.label ? null : r.label))
            }
          />
        ))}
      </ul>
      {showMore && projectsConfig.moreHref && (
        <ProjectsMoreBtn href={projectsConfig.moreHref} />
      )}
    </section>
  );
}

export function Elsewhere() {
  const lastIndex = links.length - 1;
  return (
    <section className="rise mt-9" style={{ animationDelay: "500ms" }}>
      <SectionLabel>elsewhere</SectionLabel>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {links.map((l, i) => (
          <li
            key={l.label}
            className={
              i === lastIndex
                ? "flex grow items-center justify-between gap-2.5"
                : undefined
            }
          >
            <a href={l.href} className={elsewhereLink}>
              {l.heart && <HeartDoodle />}
              {l.label}
              <LinkDoodle />
            </a>
            {/* Pin the "around / online" dot to the last link's row so the two
                always wrap together — never to its own line. The growing li
                pushes the dot to the right edge regardless of row width. */}
            {i === lastIndex && <LiveDot />}
          </li>
        ))}
      </ul>
    </section>
  );
}
