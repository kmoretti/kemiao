import type { ReactNode } from "react";
import avatarMark from "../assets/avatar-mark.png";
import { intro } from "../content";
import {
  DraggableSticker,
  HandUnderline,
  MarkerHighlight,
  Monogram,
  Pushpin,
} from "./desk";

/* Phrase-level accents for the intro copy. Each phrase gets a different
   hand-drawn flourish — edit the list (or colors) to taste. */
const ACCENTS: { phrase: string; wrap: (s: string) => ReactNode }[] = [
  {
    phrase: intro.name,
    wrap: (s) => (
      <HandUnderline color="red" note="yep, that's me">
        {s}
      </HandUnderline>
    ),
  },
  {
    phrase: "full-stack",
    wrap: (s) => (
      <HandUnderline color="green" note="does a bit of everything">
        {s}
      </HandUnderline>
    ),
  },
  {
    phrase: "design",
    wrap: (s) => <MarkerHighlight note="pixels matter">{s}</MarkerHighlight>,
  },
  {
    phrase: "The Finals",
    wrap: (s) => (
      <HandUnderline color="blue" note="★ my comfort game">
        {s}
      </HandUnderline>
    ),
  },
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

/* The header monogram + draggable avatar, the intro paragraphs with their
   marker accents, and the pinned blue status note. */
export function Intro() {
  return (
    <>
      <header
        className="rise flex items-start justify-between gap-4"
        style={{ animationDelay: "0ms" }}
      >
        <DraggableSticker className="shrink-0">
          <span className="peel-hint block">
            <img
              src={avatarMark}
              alt={intro.name}
              width={44}
              height={44}
              draggable={false}
              className="size-11"
            />
          </span>
        </DraggableSticker>
        <Monogram>{intro.initial}</Monogram>
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
        <a
          href={intro.github}
          className="font-medium underline underline-offset-2"
        >
          GitHub
        </a>{" "}
        or{" "}
        <a
          href={intro.message}
          className="font-medium underline underline-offset-2"
        >
          message me
        </a>
        .
      </aside>
    </>
  );
}
