import { Flow } from "@/components/Flow";
import { firstFrame } from "@/lib/art/first-frame";
import { Chips, Decisions } from "./parts";

// Server type, route, effect on production.
const ROUTES = [
  ["Load-balanced or clustered node", "Drain it, convert it, test it and return it, one node at a time.", "No outage. The other nodes carry the traffic."],
  ["Database with a replica", "Move the replica, fail over to it, then move the former primary.", "A brief, planned failover."],
  ["Domain controller", "Promote new controllers on Hyper-V and demote the old ones, instead of converting them.", "No outage."],
  ["Single server", "Sync while it runs, then stop it for a final sync in an agreed window.", "A short, planned outage."],
  ["Appliance or unsupported OS", "Use the vendor’s Hyper-V image, rebuild it or retire it.", "Decided case by case."],
];

// Wave, scope, size, what must be true before the next wave.
const WAVES = [
  ["0 · Lab", "Clones covering every OS and every route", "~10 clones", "All tests pass and rollback is timed"],
  ["1 · Non-production", "Development and test servers", "~30", "No repeat failures, and the runbook is corrected"],
  ["2 · Low risk", "Redundant services and internal tools", "~60 production", "A quiet week after the last batch"],
  ["3 · Business apps", "Applications, one dependency group at a time", "~100 production", "Owners have signed off every group"],
  ["4 · Critical", "Databases, identity and the most visible services", "~40 production", "A quiet two weeks after the last batch"],
  ["5 · Exceptions", "Appliances and anything held back", "~10 production", "VMware is empty"],
];

// What gets tested, and what passing looks like.
const TESTS = [
  ["Conversion", "The VM boots on the right generation, BIOS to Generation 1 and UEFI to Generation 2, with every disk and its data intact."],
  ["Guest", "VMware Tools is gone, Hyper-V integration services are running, Linux guests have Hyper-V drivers in their boot image, and Windows stays activated."],
  ["Network", "Each new adapter keeps its static address, VLAN, gateway and DNS. Test on an isolated network first, so a copy can’t conflict with the live server."],
  ["Application", "The owner runs a written smoke test against a copy and signs the result."],
  ["Performance", "CPU, memory and disk latency hold up at peak against a baseline captured on VMware."],
  ["Resilience", "VMs survive a live migration, a drained host and a host failed on purpose."],
  ["Operations", "A backup restores cleanly, and monitoring, patching and endpoint protection all report in."],
  ["Rollback", "The original comes back and passes its smoke test, within the change window, with the time recorded."],
];

// When, and what happens.
const RUNBOOK = [
  ["14 days before", "The change is approved, owners agree the window and smoke test, and users are told."],
  ["7 days before", "The first sync starts while the source runs. Snapshots are cleared and network settings are recorded."],
  ["1 day before", "A fresh backup is verified, and a named person is on point for rollback."],
  ["Drain", "The server leaves its load balancer, or its application stops."],
  ["Cut over", "VMware Tools comes off, the source shuts down, the final sync runs and the VM starts on Hyper-V."],
  ["Validate", "Network, services and the smoke test are checked before any traffic returns."],
  ["Decide", "Go or no-go, before users return."],
  ["14 days after", "The powered-off original is deleted, once backups are proven and the owner signs off."],
];

// Team, then its part in each phase.
const TEAMS = [
  ["Network", "VLAN and virtual switch mapping, firewall rules", "Connectivity and failover paths", "Load balancer drains, network checks"],
  ["Server", "Inventory, Hyper-V cluster, conversion tool", "Conversion, performance, rollback", "Runs each cutover"],
  ["Application", "Owners, dependencies, change windows", "Writes and runs the smoke tests", "Signs off, or calls a no-go"],
];

function Rows({ head, rows, long }: { head: string[]; rows: string[][]; long?: boolean }) {
  return (
    <table className={long ? "long" : undefined}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([first, ...rest]) => (
          <tr key={first}>
            <td>{first}</td>
            {rest.map((cell, i) => (
              <td key={head[i + 1]} data-label={head[i + 1].toLowerCase()}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// "How it ran" says only what the résumé says. Everything after it is a general plan, and the page says so.
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

      <h3>A typical plan for 200+ production servers</h3>
      <p>
        This is how a move of this size is typically planned, tested and run. It isn’t a record of this project: the batch sizes, timings and thresholds are examples.
      </p>
      <p>
        Converting a VM means stopping it for a final sync, so avoiding production downtime is decided server by server. Services with a redundant partner move one
        node at a time, and a server with no partner moves in a window agreed with its owner.
      </p>

      <h3>Plan: know what’s moving</h3>
      <Decisions
        items={[
          ["Inventory", "Export every VM from vCenter with its OS, firmware type, CPU, memory, disks, networks and snapshots. Reconcile it with the CMDB, so every server has a named owner and a criticality rating."],
          ["Dependencies", "Combine application owner interviews with network flow data to find which servers must move together. Those groups set the order of the waves."],
          ["Landing zone", "Build a Hyper-V failover cluster that can lose a host, map every VMware port group to a VLAN on the virtual switches, and connect backup, monitoring, patching and endpoint protection before any server arrives."],
          ["Conversion tool", "Options include Virtual Machine Manager’s conversion wizard, Windows Admin Center’s VM Conversion extension and restoring from a backup product. Each has limits, such as VMM needing the source powered off and not converting VMs on vSAN, so the tool is proven in the lab first."],
        ]}
      />
      <p style={{ marginTop: 20 }}>Every server then gets one of five routes:</p>
      <Rows head={["Server", "Route", "Effect on production"]} rows={ROUTES} long />
      <p style={{ marginTop: 20 }}>The routes and dependency groups become waves, lowest risk first, moved in batches small enough to roll back in one window:</p>
      <Rows head={["Wave", "Scope", "Size", "To move on"]} rows={WAVES} />

      <h3>Test: prove it before production</h3>
      <p>Each OS and route goes through the same checks in the lab, and each check needs evidence before the go/no-go for production.</p>
      <Rows head={["Check", "What passing looks like"]} rows={TESTS} />

      <h3>Execute: the same runbook every time</h3>
      <Rows head={["When", "What happens"]} rows={RUNBOOK} />
      <div style={{ marginTop: 24 }}>
        <Decisions
          items={[
            ["Rollback", "The VMware original stays powered off and unchanged. Before users return, rolling back means stopping the Hyper-V copy, starting the original and rerunning the smoke test. After users return, new data lives only on the copy, so going back becomes a data decision with the owner. That’s why the go/no-go comes first."],
            ["Stop rules", "A wave pauses on a major incident caused by the migration, a failed rollback, or the same smoke test failing on more than one server. The cause is fixed and added to the lab tests before the wave resumes."],
            ["Finish", "After the last wave, backup and monitoring come off VMware, the hosts are decommissioned and the licenses end. The last wave is scheduled well before the renewal date, because that date is where the savings start."],
          ]}
        />
      </div>

      <h3>Who does what</h3>
      <Rows head={["Team", "Plan", "Test", "Execute"]} rows={TEAMS} />

      <h3>Stack</h3>
      <Chips items={["VMware", "Hyper-V"]} />
    </>
  );
}
