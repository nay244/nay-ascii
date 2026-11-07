import { Chips, Decisions } from "./parts";

export const TECHCONCEPTS_URL = "https://techconcepts.naaay-naing.workers.dev";

// Lesson, what it covers. The four lessons ready on the live site.
const READY = [
  ["How the Internet Works", "The 14 protocols the internet runs on, from HTTP and DNS to email, SSH and TLS, each with its own short walkthrough."],
  ["Subnetting", "How one big network is cut into smaller ones, how many devices fit in each, and how a device tells whether another is its neighbour."],
  ["DHCP", "A laptop joins a Wi-Fi network and gets an address, plus the other settings it needs to go online, from the router in four short messages."],
  ["Firewalls", "A firewall checks each connection against its list of rules, from the top down, and why the order of the rules matters."],
];

// Layer, choice. From the site's README and design docs.
const LAYERS = [
  ["Site", "Astro, built to static files, with React islands for the interactive scenes"],
  ["Lesson engine", "Framework-free TypeScript: playback, a timeline that turns a position into scene state, and the network maths (IPv4, subnets, firewall rules)"],
  ["Lessons", "One TypeScript file each, checked by a schema that fails the build on a breach: 4 to 6 steps, at most 120 words a step, and a time estimate"],
  ["Progress", "Saved only in the browser, and the site still works when storage is blocked or full"],
  ["Accessibility", "Colour tokens that meet WCAG AA in both themes, colour never the only signal, reduced motion and keyboard controls"],
  ["Tests", "Vitest for units and components, Playwright end to end"],
  ["Hosting", "Static files on Cloudflare Workers"],
];

export function TechconceptsBody() {
  return (
    <>
      <h3>Overview</h3>
      <p>
        TechConcepts teaches how technology works by showing it. Each lesson plays a real process, such as a laptop asking the network for an address, one step
        at a time, and explains each step in plain words. There&apos;s nothing to sign up for, and any lesson can be opened in any order.
      </p>
      <p>
        <a href={TECHCONCEPTS_URL} target="_blank" rel="noopener noreferrer">Visit TechConcepts ↗</a>
      </p>

      <h3>How a lesson works</h3>
      <Decisions
        items={[
          ["Watch", "A scene plays the process step by step. Messages travel along the cables, and the learner can pause, slow down or step back at any point."],
          ["Learn", "Each idea starts with an everyday comparison, then gives the real term. Exam-level detail waits in a Go deeper section, closed until it's wanted."],
          ["Practice", "A few questions, each answer explained. Nothing is scored or saved."],
        ]}
      />

      <h3>The first track</h3>
      <p>
        Networking Concepts is written for anyone starting out, including people studying for entry-level IT certifications. It plans 20 lessons, and these four
        are ready:
      </p>
      <table>
        <thead>
          <tr>
            <th>Lesson</th>
            <th>What it covers</th>
          </tr>
        </thead>
        <tbody>
          {READY.map(([name, text]) => (
            <tr key={name}>
              <td>{name}</td>
              <td data-label="what it covers">{text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 20 }}>
        Four more tracks are planned: Cryptography, AI Concepts, Privilege Escalation, and Threat &amp; Vulnerability Management.
      </p>

      <h3>How it&apos;s built</h3>
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
              <td data-label="choice">{choice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Stack</h3>
      <Chips items={["Astro", "React", "TypeScript", "Vitest", "Playwright", "Cloudflare Workers"]} />
    </>
  );
}
