import { useEffect, useState, type ReactNode } from "react";
import {
  artifacts,
  artifactsConfig,
  experience,
  links,
  liveConfig,
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
  LivePlatformIcon,
  ProjectDetail,
  ProjectsMoreBtn,
  Pushpin,
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

type LiveDevice = {
  device_id: string;
  device_name: string;
  platform: string;
  app_name: string;
  app_id: string;
  is_online: number;
  last_seen_at: string;
  display_title: string;
  extra?: { battery_percent: number; battery_charging: boolean };
};

type LiveActivity = {
  id: number;
  device_id: string;
  device_name: string;
  platform: string;
  app_name: string;
  app_id: string;
  display_title: string;
  started_at: string;
};

type LiveData = {
  devices: LiveDevice[];
  recent_activities: LiveActivity[];
  server_time: string;
  viewer_count: number;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function LivePanel() {
  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = () =>
      fetch(liveConfig.apiUrl)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((d: LiveData) => {
          if (!cancelled) setData(d);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data && !error) return null;
  if (error || !data) return null;

  const onlineDevices = data.devices.filter((d) => d.is_online);
  const recent = data.recent_activities.slice(0, 5);

  return (
    <section className="rise mt-9" style={{ animationDelay: "150ms" }}>
      <div
        className="relative border px-4 pt-[18px] pb-3"
        style={{
          borderColor: `color-mix(in srgb, var(--color-ink) 18%, transparent)`,
          borderRadius: "8px 5px 9px 6px / 5px 9px 6px 8px",
        }}
      >
        <Pushpin />

        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>live</SectionLabel>
          <span
            className="inline-flex items-center gap-1 rounded-[3px] px-2 py-[3px] font-mono text-[0.55rem] font-medium uppercase tracking-[0.12em]"
            style={{
              color: "var(--color-marker-green)",
              border: "1px solid color-mix(in srgb, var(--color-marker-green) 50%, transparent)",
              outline: "1px solid color-mix(in srgb, var(--color-marker-green) 50%, transparent)",
              outlineOffset: "2px",
            }}
          >
            <span className="relative inline-block size-[5px]">
              <span
                className="live-ping absolute inset-0 rounded-full"
                style={{ background: "var(--color-marker-green)" }}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--color-marker-green)" }}
              />
            </span>
            live
          </span>
        </div>

        <div className="space-y-3">
          {onlineDevices.map((device) => (
            <div key={device.device_id} className="flex items-start gap-2.5">
              <LivePlatformIcon platform={device.platform} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[0.78rem] font-medium text-ink">
                    {device.device_name}
                  </span>
                  <LiveDot />
                  {device.extra?.battery_percent != null && (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[0.62rem] tabular-nums text-muted">
                      <span>{device.extra.battery_percent}%</span>
                      {device.extra.battery_charging && (
                        <svg viewBox="0 0 12 12" aria-hidden="true" className="size-2.5 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5.5,1 L5.5,5 L2.5,5 L6.5,11 L6.5,7 L9.5,7 Z" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 font-mono text-[0.68rem] leading-snug text-soft">
                  {device.app_name}
                  {device.display_title && (
                    <>
                      <span className="mx-1 text-muted/50">·</span>
                      <span className="text-muted">{device.display_title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {recent.length > 0 && (
          <>
            <div
              className="my-3"
              style={{
                borderTop: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
              }}
            />
            <div className="space-y-[3px]">
              {recent.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 font-mono text-[0.64rem]"
                >
                  <span className="shrink-0 tabular-nums text-muted">
                    {timeAgo(a.started_at)}
                  </span>
                  <span
                    className="size-[3px] shrink-0 rounded-full"
                    style={{
                      background: i === 0
                        ? "var(--color-marker-green)"
                        : "color-mix(in srgb, var(--color-ink) 20%, transparent)",
                    }}
                  />
                  <span className="min-w-0 truncate text-soft">{a.app_name}</span>
                  {a.display_title && (
                    <span className="hidden min-w-0 truncate text-muted/60 sm:inline">
                      · {a.display_title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[0.6rem] text-muted/50">
          <LiveDot />
          {data.viewer_count} watching
        </div>
      </div>
    </section>
  );
}

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
  const [rssTotal, setRssTotal] = useState(0);

  useEffect(() => {
    if (artifactsConfig.mode !== "rss" || !artifactsConfig.rssUrl) return;
    let cancelled = false;
    fetch(`/api/rss?url=${encodeURIComponent(artifactsConfig.rssUrl)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Entry[]) => {
        if (!cancelled) {
          setRssTotal(data.length);
          setRssEntries(data.slice(0, artifactsConfig.showCount));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const source = rssEntries ?? artifacts;
  const showMore = artifactsConfig.mode === "rss" && rssTotal > artifactsConfig.showCount && artifactsConfig.moreHref;

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
      {showMore && (
        <ProjectsMoreBtn href={artifactsConfig.moreHref} label="view all" />
      )}
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
