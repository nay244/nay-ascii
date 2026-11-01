import type { ReactNode } from "react";

// The two small lists the write-ups share: a few decisions, each with a heading, and a row of stack chips.
export function Decisions({ items }: { items: [string, ReactNode][] }) {
  return (
    <div className="decisions">
      {items.map(([name, text]) => (
        <section key={name}>
          <h4>{name}</h4>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="chips">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
