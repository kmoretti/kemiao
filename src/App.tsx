import { useEffect } from "react";
import { Intro } from "./components/intro";
import {
  Artifacts,
  Elsewhere,
  Experience,
  LivePanel,
  Projects,
} from "./components/sections";

/* Swap the tab title to a cheeky note while the page is hidden, restoring it
   when the visitor comes back. */
function useAwayTitle(away: string) {
  useEffect(() => {
    const original = document.title;
    const onChange = () => {
      document.title = document.hidden ? away : original;
    };
    document.addEventListener("visibilitychange", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      document.title = original;
    };
  }, [away]);
}

export default function App() {
  useAwayTitle("come back :(");

  return (
    <div className="min-h-svh">
      <main className="mx-auto max-w-[33rem] px-6 pt-16 pb-28 sm:pt-24">
        <Intro />
        <LivePanel />
        <Experience />
        <Projects />
        <Artifacts />
        <Elsewhere />
      </main>
    </div>
  );
}
