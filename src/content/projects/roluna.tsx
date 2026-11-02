import { Flow } from "@/components/Flow";
import { firstFrame } from "@/lib/art/first-frame";
import { BASE_PATH } from "@/lib/base";
import { Chips, Decisions } from "./parts";

// File, caption, alt text.
const SCREENS = [
  ["welcome", "Welcome", "Welcome screen"],
  ["discover", "Discover", "Discover swipe deck"],
  ["filters", "Filters", "Filter sheet"],
  ["saved", "Saved", "Saved tab"],
  ["settings", "Settings", "Settings"],
];

// Layer, choice.
const LAYERS = [
  ["Mobile", "React Native + Expo (managed), TypeScript strict"],
  ["Navigation", "Expo Router (file-based)"],
  ["Server state", "React Query (TanStack)"],
  ["Auth", "Firebase Auth: email/password + native Apple & Google Sign In"],
  ["Gestures / animation", "react-native-gesture-handler + react-native-reanimated"],
  ["Backend", "Node + Express + TypeScript"],
  ["Database", "MongoDB Atlas"],
  ["Cache / queues", "Upstash Redis"],
  ["Listings", "Adzuna API (US)"],
  ["Validation", "Zod schemas shared between client and server"],
  ["Hosting / CI", "Render (push-to-deploy) + GitHub Actions"],
  ["Distribution", "Expo EAS Build → TestFlight"],
];

export function RolunaBody() {
  return (
    <>
      <h3>Overview</h3>
      <p>
        Roluna reframes the job hunt as a swipe deck. Users sign in, set a target role with optional filters (location, distance, job type, salary range), and swipe
        through live job listings rendered as cards: right to save, left to pass. Saved listings live on their own tab where they can be marked as applied, and
        tapping a saved row opens the original posting on the source site.
      </p>
      <p>
        <strong>Mental model:</strong> search results, rendered as a Swipe deck, with persistent Saved and Applied state.
      </p>
      <p>
        It&apos;s a full-stack solo build: a Node/Express backend serving a cache of real job listings, and a React Native iOS client with a hand-built,
        gesture-driven swipe deck.
      </p>

      <h3>The app</h3>
      <div className="icon-row">
        <img src={`${BASE_PATH}/static/roluna/roluna-icon.png`} alt="Roluna app icon" width={48} height={48} />
        <p>
          Production iOS app icon: a warm clay <strong>r</strong> on the brand gradient.
        </p>
      </div>
      <ul className="screens">
        {SCREENS.map(([file, name, alt]) => (
          <li key={file}>
            <figure>
              <img src={`${BASE_PATH}/static/roluna/roluna-${file}.png`} alt={`Roluna: ${alt}`} width={804} height={1748} loading="lazy" />
              <figcaption>{name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="note screens-note">High-fidelity UI · Clay theme · designed in-prototype, captured at iOS 402×874</p>
      <Decisions
        items={[
          [
            "Discover",
            "A search bar opens a full-screen modal with role autocomplete (~180 roles, fuzzy-matched client-side). A filter rail shows every active filter. The centrepiece is a custom swipe deck built on Reanimated gestures, with animated SAVE/PASS stamps that fade in as you drag and a multi-level undo that survives across the session.",
          ],
          [
            "Filters",
            "A half-sheet with location autocomplete (~190 US cities), a stepped distance slider, multi-select job-type chips, a min/max salary range with validation, and date-posted controls.",
          ],
          [
            "Saved",
            "An animated segmented control switches between All / To apply / Applied. Each row can be marked as applied or opened on the source site, with a remove confirmation.",
          ],
          ["Settings", "Editable defaults for Role, Location, and Job types persisted on-device, plus account management and Apple-compliant account deletion."],
          [
            "Smart defaults",
            "User defaults are stored locally; on a cold start the app auto-seeds Discover from them, and the first manual search of a session takes over.",
          ],
        ]}
      />

      <h3>Cache-first deck</h3>
      <p>
        The backend uses a <strong>cache-first deck strategy</strong>. A scheduled job ingests listings from the Adzuna API into a shared MongoDB collection twice a day; user searches then hit that cache the vast majority of the time, with an on-demand API fallback for long-tail queries. This decouples user activity from the API&apos;s daily quota and keeps the whole system comfortably inside a free tier.
      </p>
      <Flow
        piece="project-roluna"
        rows={20}
        caption="Listings to deck · cache first"
        fallback={firstFrame("project-roluna", 46)}
        steps={[
          { stop: "adzuna", name: "Adzuna API", when: "source", children: <p>US listings, on a daily quota.</p> },
          { stop: "ingest", name: "Ingest cron", when: "2× a day", children: <p>A twice-daily sweep into the cache, under a Redis lock.</p> },
          { stop: "mongo", name: "Mongo cache", when: "14-day TTL", children: <p>Shared jobs, cleaned up on a rolling 14-day window.</p> },
          { stop: "api", name: "Express API", when: "backend", children: <p>Deck, swipes and saved roles, with the on-demand fallback for long-tail queries.</p> },
          { stop: "deck", name: "Swipe deck", when: "client", children: <p>The iOS client, built on Reanimated.</p> },
          { stop: "saved", name: "Saved snapshot", when: "per user", children: <p>A copy of the job taken at save time, which survives the cache purge.</p> },
        ]}
      />

      <h3>Key design decisions</h3>
      <Decisions
        items={[
          [
            "Cache-first, quota-aware",
            "Twice-daily bulk ingestion populates a shared listings cache, so most user searches never touch the live API; an on-demand fallback handles rare queries. This single decision is what makes a free-tier listings quota viable for an MVP.",
          ],
          [
            "Per-user state that survives the purge",
            "Saved listings denormalise a snapshot of the job at save time, so a saved role stays intact even after the rolling 14-day cache cleanup removes the original posting. Dismissed jobs auto-expire via a database TTL index.",
          ],
          [
            "Shared validation contract",
            <>One set of Zod schemas (job types, search inputs with a <code>salaryMax ≥ salaryMin</code> refinement, swipe payloads) is shared across client and server through a monorepo workspace, so the two sides can&apos;t drift out of sync.</>,
          ],
          [
            "Auth bridge",
            "Firebase handles identity; the backend mints its own user record keyed by the Firebase UID and verifies the token on every request, bridging Firebase Auth to server-side data ownership.",
          ],
        ]}
      />

      <h3>Architecture</h3>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Choice</th>
          </tr>
        </thead>
        <tbody>
          {LAYERS.map(([layer, choice]) => (
            <tr key={layer}>
              <td>{layer}</td>
              <td>{choice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Engineering challenges</h3>
      <table className="long">
        <thead>
          <tr>
            <th>Hurdle</th>
            <th>Resolution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dev build launched to a blank white screen</td>
            <td data-label="resolution">
              An SDK-version mismatch: a dependency installed for a newer Expo SDK called native APIs that didn&apos;t exist in the pinned React Native version. Pinned every native dep to its SDK-matched version and reinstalled clean.
            </td>
          </tr>
          <tr>
            <td>
              <code>Unable to find a specification for &apos;EXDevLauncher&apos;</code>
            </td>
            <td data-label="resolution">
              In an npm-workspaces monorepo, Expo&apos;s iOS autolinker doesn&apos;t recurse into nested <code>node_modules</code>. Hoisted the transitive native modules by declaring them explicitly in the leaf workspace.
            </td>
          </tr>
          <tr>
            <td>New searches kept showing stale cards</td>
            <td data-label="resolution">
              The deck only reloaded when empty, so a fresh search left the old cards in place. Tracked the previous query hash in a ref and split the logic into a query-change effect and a top-up effect.
            </td>
          </tr>
          <tr>
            <td>
              <code>ITMS-90725</code> rejection at submit
            </td>
            <td data-label="resolution">
              Apple&apos;s iOS 26 SDK gate flipped to enforced mid-submission. Switched the cloud build worker to the latest macOS/Xcode image, a one-line fix that satisfied the gate even on the older Expo SDK.
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Stack</h3>
      <Chips
        items={[
          "React Native", "Expo", "Expo Router", "TypeScript", "React Query", "Firebase Auth", "Reanimated", "Node", "Express", "MongoDB", "Redis", "Zod",
          "Adzuna API", "Render", "GitHub Actions", "EAS Build", "TestFlight",
        ]}
      />

      <h3>Status</h3>
      <p>
        The backend and mobile app are complete and run end-to-end on a production TestFlight build. Remaining work is the App Store submission itself: privacy policy, listing metadata, screenshots, and review. The project was built and is run entirely on free tiers, with the Apple Developer Program as the only fixed cost.
      </p>
    </>
  );
}
