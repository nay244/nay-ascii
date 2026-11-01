import { Flow } from "@/components/Flow";
import { firstFrame } from "@/lib/art/first-frame";
import { Chips } from "./parts";

// This page says only what the résumé says, so no step asks a question or leaves a gap to fill.
export function HypervBody() {
  return (
    <>
      <h3>How it ran</h3>
      <Flow
        piece="project-hyperv"
        rows={20}
        caption="Three teams · three phases"
        fallback={firstFrame("project-hyperv", 46)}
        steps={[
          { stop: "plan", name: "Plan", when: "phase 1", children: <p>With the network, server and application teams.</p> },
          { stop: "test", name: "Test", when: "phase 2" },
          { stop: "execute", name: "Execute", when: "phase 3", children: <p>Zero production downtime, and the project deadline met.</p> },
        ]}
      />

      <h3>Stack</h3>
      <Chips items={["VMware", "Hyper-V"]} />
    </>
  );
}
