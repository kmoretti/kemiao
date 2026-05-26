import { Intro } from "./components/intro";
import {
  Artifacts,
  Elsewhere,
  Experience,
  Projects,
} from "./components/sections";

export default function App() {
  return (
    <div className="min-h-svh">
      <main className="mx-auto max-w-[33rem] px-6 pt-16 pb-28 sm:pt-24">
        <Intro />
        <Experience />
        <Projects />
        <Artifacts />
        <Elsewhere />
      </main>
    </div>
  );
}
