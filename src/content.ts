// All page copy lives here so it's easy to edit without touching layout.

export const intro = {
  name: "克喵Moretti",
  initial: "M", // used for the corner script monogram
  lines: [
    "Hi, I'm 克喵Moretti, a 20-year-old college student from Suzhou, Jiangsu. I'm currently a junior studying in Nanjing, majoring in Automation Technology and Application.",
    "My ID comes from the novel *Lord of the Mysteries*. I usually enjoy reading novels, tweaking my blog, and browsing online communities.",
    "I like to look for interesting articles and projects on GitHub and friend links, and then try to implement them. When I come across a fun blog, I'll also try to deploy and modify it~"

  ],
  // Shown as the blue marginalia note.
  status:
    "Upcoming intern at Schneider Electric — open to open-source collaborations.",
  github: "https://s.081531.xyz/github",
  telegram: "https://imgbed.081531.xyz/file/telegram/image(3).png",
  qq: "https://imgbed.081531.xyz/file/telegram/image(2).png",
  message: "https://s.081531.xyz/mail",
  lotm: "https://bangumi.tv/subject/290411",
} as const;

// A dated row: the label on the left, the date on the right.
export type Entry = {
  label: string;
  date: string;
  href?: string;
};

export const experience: Entry[] = [
  { label: "Studying at NIIT", date: "2023–Present" },
  { label: "Interning at Schneider Electric", date: "Right away" },
];

// A project. `date` shows on the row's hand-cut sticky tag. `href` is optional
// — omit it for closed-source / unlinked projects. `site` is an optional live /
// official site shown next to the repo link. `blurb` and `stack` fill the detail
// revealed when the row is clicked. `stamp` is the short word scrawled in the
// hand-drawn marker stamp on that detail, and `color` picks the marker accent
// it's inked in.
export type Project = {
  label: string;
  date: string;
  color: "red" | "green" | "blue";
  stamp: string;
  href?: string;
  site?: string;
  blurb?: string;
  stack?: string[];
};

export const projects: Project[] = [
  {
    label: "Astro-blog",
    href: "https://github.com/kmoretti/blog",
    site: "https://blog.081531.xyz",
    date: "2026",
    color: "red",
    stamp: "blog",
    blurb:
      "An Astro framework blog customized for personal use based on an open-source project. Future content will focus on tech stacks and document troubleshooting tutorials.",
    stack: ["Astro", "MDX"],
  },
  {
    label: "Home-Vue-Go",
    href: "https://github.com/kmoretti/Home-Vue-go",
    date: "2026",
    color: "blue",
    stamp: "homepage",
    blurb:
      "A personalized Go fork of the JLinMr/Home-Vue project, used as a navigation page with added icon adaptations.",
    stack: ["Go", "Vue"],
  },
  {
    label: "Moment",
    href: "https://github.com/kmoretti/moments",
    date: "2026",
    color: "green",
    stamp: "Memos",
    blurb:
      "Minimalist Moments, customized with some personal features.",
    stack: ["Go"],
  },
];

export const projectsConfig = {
  showCount: 5,
  moreHref: "https://s.081531.xyz/github",
};

export const artifacts: Entry[] = [
  {
    label: "2025 Year in Review",
    date: "2026.01",
    href: "https://blog.sn0w.fyi/posts/2025_summary/",
  },
  {
    label: "2024 Year in Review",
    date: "2025.01",
    href: "https://blog.sn0w.fyi/posts/2024_summary/",
  },
  {
    label: "2023 Year in Review",
    date: "2024.01",
    href: "https://blog.sn0w.fyi/posts/2023_summary/",
  },
];

export const artifactsConfig = {
  mode: "rss" as "manual" | "rss",
  rssUrl: "https://blog.081531.xyz/rss.xml",
  showCount: 5,
  moreHref: "https://blog.081531.xyz",
};

// `heart: true` marks a "support me" link (rendered with a hand-drawn heart) so
// it reads as a CTA rather than just another profile link.
export type Link = { label: string; href: string; heart?: boolean };

export const links: Link[] = [
  { label: "GitHub", href: "https://s.081531.xyz/github" },
  { label: "Blog", href: "https://s.081531.xyz/blog" },
  { label: "Ech0", href: "https://m.081531.xyz" },
  { label: "Guide", href: "https://s.081531.xyz/home" },
  { label: "Sponsor", href: "https://sponsor.081531.xyz", heart: true },
];
