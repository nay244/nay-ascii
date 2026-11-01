import { Fragment } from "react";

// A project's headline numbers. An arrow in a value is set smaller and fainter than the digits around it.
export function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="facts">
      {items.map(([name, value]) => (
        <div key={name}>
          <dt>{name}</dt>
          <dd>
            {value.split("→").map((part, i) => (
              <Fragment key={i}>
                {i > 0 && <span>→</span>}
                {part}
              </Fragment>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
