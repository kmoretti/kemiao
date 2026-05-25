// All page copy lives here so it's easy to edit without touching layout.

export const intro = {
  name: "L1nSn0w",
  initial: "L", // used for the corner script monogram
  lines: [
    "Hi, I'm L1nSn0w — a 22-year-old Software Engineering student at GDUT, based in China.",
    "A full-stack dev at heart, with a soft spot for well-made products and design — the Apple & Google kind.",
    "Off the clock I'm hunting down clever software, playing The Finals, or talking tech with anyone who'll listen.",
  ],
  // Shown as the blue marginalia note.
  status:
    "Currently interning at LangGenius — open to open-source collaborations.",
  github: "https://github.com/lin-snow",
  message: "mailto:l1nsn0w@qq.com",
} as const;

// A dated row: the label on the left, the date on the right.
export type Entry = {
  label: string;
  date: string;
  href?: string;
};

export const experience: Entry[] = [
  { label: "Backend Software Engineer, LangGenius", date: "2025–Present" },
  { label: "B.Eng. Software Engineering, GDUT", date: "in progress" },
];

// A project. `badge` is the hand-drawn sticker text (kept short so it reads
// well in the marker font); `color` picks one of the marker accents. `href`
// is optional — omit it for closed-source / unlinked projects.
export type Project = {
  label: string;
  badge: string;
  color: "red" | "green" | "blue";
  href?: string;
};

export const projects: Project[] = [
  { label: "Kemate — a Vercel-like PaaS", badge: "PaaS", color: "green" },
  {
    label: "Ech0 — self-hosted microblog",
    href: "https://github.com/lin-snow/Ech0",
    badge: "★ 2k",
    color: "red",
  },
  {
    label: "Dox — todos that live in your terminal.",
    href: "https://github.com/lin-snow/dox",
    badge: "</> TUI",
    color: "blue",
  },
];

export const artifacts: Entry[] = [
  {
    label: "2025 Year in Review",
    date: "2026.01",
    href: "https://blog.vaaat.com/posts/2025_summary/",
  },
  {
    label: "2024 Year in Review",
    date: "2025.01",
    href: "https://blog.vaaat.com/posts/2024_summary/",
  },
  {
    label: "2023 Year in Review",
    date: "2024.01",
    href: "https://blog.vaaat.com/posts/2023_summary/",
  },
];

export type Link = { label: string; href: string };

export const links: Link[] = [
  { label: "GitHub", href: "https://github.com/lin-snow" },
  { label: "Blog", href: "https://blog.vaaat.com" },
  { label: "Memo", href: "https://memo.vaaat.com" },
  { label: "CV", href: "https://cv.vaaat.com" },
  { label: "Email", href: "mailto:l1nsn0w@qq.com" },
];
