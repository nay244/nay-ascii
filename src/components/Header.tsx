import Link from "next/link";
import { Nav } from "./Nav";

export function Header() {
  return (
    <header className="hdr">
      {/* The way back home. data-avoid keeps the koi out from under it, like the links. */}
      <Link className="logo" href="/" aria-label="Home" data-avoid>
        {/* The same N and a half as app/icon.svg. It's drawn here so it can take the theme's color. */}
        <svg viewBox="0 0 500 270" aria-hidden="true">
          <path d="M96 0H120A104 104 0 0 0 224 104V0H320V174A96 96 0 0 1 224 270H200A104 104 0 0 0 96 166V270H0V96A96 96 0 0 1 96 0ZM340 82A104 104 0 0 0 404 104V0H500V270H380A104 104 0 0 0 340 188Z" />
        </svg>
      </Link>
      <Nav />
    </header>
  );
}
