import type { Metadata } from "next";
import Link from "next/link";
import { CERTS, ENTRIES, SKILLS } from "@/content/career";
import type { Entry } from "@/content/career";
import "./career.css";

export const metadata: Metadata = { title: "Career" };

const work = ENTRIES.filter((e) => e.kind === "work");
const edu = ENTRIES.filter((e) => e.kind === "edu");

// Back-to-back roles at one employer share a heading, newest first.
const employers: { org: string; place?: string; roles: Entry[] }[] = [];
for (const e of work) {
  const last = employers.at(-1);
  if (last && last.org === e.org) last.roles.push(e);
  else employers.push({ org: e.org, place: e.place, roles: [e] });
}

// The span from the first role's start to the last role's end.
const span = (roles: Entry[]) => `${roles.at(-1)!.dates.split(" – ")[0]} – ${roles[0].dates.split(" – ")[1]}`;

function Org({ entry }: { entry: Entry }) {
  return <div className="org">{entry.place ? `${entry.org} · ${entry.place}` : entry.org}</div>;
}

function Points({ entry }: { entry: Entry }) {
  return (
    <>
      {entry.points && (
        <ul className="points">
          {entry.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {entry.link && (
        <Link className="see" href={entry.link.href}>
          {`→ project: ${entry.link.text}`}
        </Link>
      )}
    </>
  );
}

export default function Career() {
  const latest = work[0];
  return (
    <div className="page-career">
      <h1 className="page-title">career</h1>
      <p className="page-lede">Cybersecurity engineer and data analyst, working from both a defensive and a data-driven angle.</p>
      <div className="links">
        <a href="https://www.linkedin.com/in/naaay-naing/">linkedin ↗</a>
        <a href="https://github.com/nay244/">github ↗</a>
      </div>
      <div className="split">
        <div>
          <h3 className="sec">latest</h3>
          <div className="now-card role">
            <span className="kind work">work</span>
            <h3>{latest.title}</h3>
            <Org entry={latest} />
            <span className="dates">{latest.dates}</span>
          </div>
          <h3 className="sec">certifications</h3>
          <ul className="cert-list">
            {CERTS.map((c) => (
              <li key={c.name}>
                <span className="name">{c.name}</span>
                <span className="meta">{c.issuer}</span>
                {c.date && <span className="meta">{c.date}</span>}
                {c.verify && <a href={c.verify}>verify ↗</a>}
              </li>
            ))}
          </ul>
          <h3 className="sec">skills</h3>
          <div className="stack-skills">
            {SKILLS.map((g) => (
              <div key={g.label}>
                <span className="label">{g.label}</span>
                <ul className="chips">
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="sec">experience</h3>
          <div className="history">
            {employers.map((g) => (
              <div className="employer" key={g.org}>
                <h3 className="emp">{g.org}</h3>
                <div className="dates">{g.place ? `${g.place} · ${span(g.roles)}` : span(g.roles)}</div>
                <ol className="roles">
                  {g.roles.map((e) => (
                    <li className="role" key={e.title}>
                      <h4>{e.title}</h4>
                      <div className="dates">{e.dates}</div>
                      <Points entry={e} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <h3 className="sec">education</h3>
          <div className="history">
            {edu.map((e) => (
              <div className="role" key={e.title}>
                <h3>{e.title}</h3>
                <Org entry={e} />
                <div className="dates">{e.dates}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
