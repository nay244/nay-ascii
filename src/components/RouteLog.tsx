"use client";

import type { Day } from "@/content/japan-2023";
import { DotArt } from "./DotArt";
import { useStops } from "./useStops";

// The travel log: the route map stays in view beside the days, and hovering a day ripples its stop and lights its label.
export function RouteLog({ days }: { days: Day[] }) {
  const { artRef, activeStop, bind } = useStops("japan-route");
  return (
    <div className="log">
      <figure className="map">
        <DotArt name="japan-route" ref={artRef} activeStop={activeStop} />
        <figcaption>Two bases, Osaka and Tokyo, with side trips from each.</figcaption>
      </figure>
      <ol className="days">
        {days.map(([when, place, acts], i) => (
          <li key={when} data-stop={place} {...bind(place)}>
            <h4>
              <span className="place">{place}</span>
              <span className="when">{`day ${i + 1} · ${when}`}</span>
            </h4>
            <ul className="acts">
              {acts.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
