import { Diagram } from "@/components/Diagram";
import { Chips, Decisions } from "./parts";

// Area, before, after.
const CHANGES = [
  ["Firewall HA model", "2-node, Active-Passive", "3-node, Active-Active-Active behind Azure ILB"],
  ["Zone model", "4 zones: Outside, DMZ, Inside, Vendor", "2 zones: Outside, Inside"],
  ["Spoke next hop", "Per-zone floating IPs (3 distinct hops)", "Single Azure ILB frontend IP"],
  ["Internet egress", "Via firewall policy / outside interface", "Azure NAT Gateway on Outside subnet"],
  ["On-premises path", "ExpressRoute → NETHUB-Prem floating IP", "ExpressRoute → Gateway Subnet (unchanged)"],
  ["Firewall policy", "Panorama 4-zone template stack", "New Panorama 2-zone template stack"],
];

export function AzureBody() {
  return (
    <>
      <h3>Overview</h3>
      <p>
        A network infrastructure project modernising a production Azure NETHUB environment. The existing design used two PAN-OS firewalls in an Active-Passive HA pair
        with four discrete network zones (Outside, DMZ, Inside, Vendor) and per-zone floating IPs as next hops for all spoke VNETs. The new design replaces this with
        three PAN-OS firewalls running Active-Active-Active behind an Azure Standard Internal Load Balancer, collapsing to two zones and a single ILB next-hop IP for
        every spoke.
      </p>
      <figure className="panel" style={{ marginTop: 12 }}>
        <figcaption style={{ color: "var(--faint)" }}>One load balancer · three firewalls</figcaption>
        <Diagram piece="project-azure" cols={62} rows={19} />
      </figure>

      <h3>Before and after</h3>
      <div className="diagram">
        <figure className="panel before">
          <figcaption>Before · active-passive · 4 zones</figcaption>
          <Diagram piece="project-azure-before" cols={46} rows={38} />
        </figure>
        <figure className="panel after">
          <figcaption>After · active-active-active · 2 zones</figcaption>
          <Diagram piece="project-azure-after" cols={46} rows={38} />
        </figure>
      </div>

      <h3>Architecture changes</h3>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          {CHANGES.map(([area, before, after]) => (
            <tr key={area}>
              <td>{area}</td>
              <td data-label="before">{before}</td>
              <td data-label="after">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note" style={{ marginTop: 12 }}>
        <strong>Unchanged:</strong> Gateway Subnet, ExpressRoute circuits (×2 via Equinix Cloud Exchange), VNet peerings, Application Gateway (WAF).
      </p>

      <h3>Key design decisions</h3>
      <Decisions
        items={[
          [
            "Azure ILB with HA Ports",
            "The ILB load balancing rule uses HA Ports (protocol: All, port: 0), which is what ensures 5-tuple flow symmetry for stateful inspection. Return traffic for a session always hits the same firewall that handled the forward flow. Standard per-port LB rules are not sufficient for a stateful firewall behind an ILB.",
          ],
          [
            "Azure NAT Gateway",
            "Attached to the Outside subnet, NAT Gateway handles outbound internet SNAT at the Azure SDN layer for all three firewall outside interfaces. PAN-OS source NAT rules for internet-bound traffic are removed to prevent double-NAT.",
          ],
          [
            "Zone consolidation",
            "The DMZ and Vendor zones are absorbed into a single Inside zone. All spoke VNETs regardless of their former zone classification now share one route table next-hop entry pointing to the ILB frontend IP, simplifying long-term route management from three maintenance surfaces to one.",
          ],
        ]}
      />

      <h3>Stack</h3>
      <Chips items={["PAN-OS", "Panorama", "Azure Virtual Network", "Azure Internal Load Balancer", "Azure NAT Gateway", "ExpressRoute", "Azure Route Tables", "Bitbucket"]} />
    </>
  );
}
