import Link from "next/link";
import { Nav } from "./Nav";

// "nay naing" is the way back home, so it's left off home itself.
export function Header({ showName = true }: { showName?: boolean }) {
  return (
    <header className="hdr">
      {showName && <Link className="brand" href="/">nay naing</Link>}
      <Nav />
    </header>
  );
}
