import Link from "next/link";
import { Nav } from "./Nav";

// "nay naing" is the way back home, so it's left off home itself and the links sit alone at the right.
export function Header({ showName = true }: { showName?: boolean }) {
  return (
    <header className={showName ? "hdr" : "hdr hdr-end"}>
      {showName && <Link className="brand" href="/">nay naing</Link>}
      <Nav />
    </header>
  );
}
