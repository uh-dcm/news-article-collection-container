import { ModeToggle } from './ui/mode-toggle';

export default function Header() {
  return (
    <div className="border-border/70 relative flex place-content-between items-center border-b p-3 shadow-sm shadow-slate-50 dark:shadow-slate-700">
      <img
        className="mx-2"
        width="40"
        src="https://avatars.githubusercontent.com/u/80965139?s=200&v=4"
      ></img>
      <h3 className="scroll-m-20 text-2xl font-medium tracking-tight">
        News article collector
      </h3>
      <div className="grow"></div>
      <div>
        <ModeToggle></ModeToggle>
      </div>
    </div>
  );
}
