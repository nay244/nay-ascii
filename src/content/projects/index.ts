import type { PieceSlug } from "../../lib/art/load.ts";

// The four projects, in card order, with the text a card and a write-up's opening share. Copied from the mockups' projects-data.js.
export type ProjectMeta = {
  slug: string;
  piece: PieceSlug;
  title: string;
  kind: "work" | "personal";
  sum: string;
  lede: string;
  stack: string[];
  facts: [string, string][];
};

export const PROJECTS: ProjectMeta[] = [
  {
    slug: "azure", piece: "project-azure-virtualfw", title: "Azure Firewall Migration", kind: "work",
    sum: "Moved an Azure hub's firewalls from an active-passive pair to three active-active firewalls behind one internal load balancer, and cut four zones down to two.",
    lede: "Redesigned an enterprise hub-and-spoke firewall architecture in Azure, migrating from a 2-node Active-Passive PAN-OS cluster across 4 network zones to a 3-node Active-Active-Active cluster behind an Azure Internal Load Balancer with a unified 2-zone model.",
    stack: ["PAN-OS", "Panorama", "Azure Load Balancer", "NAT Gateway", "ExpressRoute"],
    facts: [["firewalls", "2 → 3"], ["zones", "4 → 2"], ["spoke next hops", "3 → 1"]],
  },
  {
    slug: "servicenow", piece: "project-servicenow-dashboard", title: "ServiceNow Data Pipeline", kind: "work",
    sum: "A nine-stage pipeline that carries ServiceNow tickets through AWS into Power BI, transforming them with DBT and refreshing the dashboards after every load.",
    lede: "End-to-end data pipeline extracting ServiceNow ITSM records through AWS managed services, transforming via DBT, and delivering live Power BI dashboards, built on a medallion architecture.",
    stack: ["AppFlow", "Redshift", "EventBridge", "SQS", "Jenkins", "DBT", "Power BI"],
    facts: [["stages", "9"], ["source tables", "4"], ["manual steps", "0"]],
  },
  {
    slug: "hyperv", piece: "project-hyperv-move", title: "VMware to Hyper-V Migration", kind: "work",
    sum: "Migrated virtual machine infrastructure from VMware to Hyper-V with the network, server and application teams, to cut costs and modernize. Planned, tested and executed with zero production downtime, on deadline.",
    lede: "Worked with the network, server and application teams to migrate virtual machine infrastructure from VMware to Hyper-V, as a cost-reduction and infrastructure modernization initiative. Planned, tested and executed with zero production downtime, on deadline.",
    stack: ["VMware", "Hyper-V"],
    facts: [["production downtime", "0"], ["teams", "3"], ["deadline", "met"]],
  },
  {
    slug: "roluna", piece: "project-roluna-deck", title: "Roluna", kind: "personal",
    sum: "A swipe-to-discover job-search app for iOS, built solo from the Node backend to the React Native client, and live on TestFlight.",
    lede: "A swipe-to-discover job-search app for iOS: set the role you want, then swipe through real postings one card at a time. Right swipe saves, left swipe passes, and saved roles get their own tab with apply tracking. Built solo with React Native + Expo on a Node + MongoDB backend, and currently live on TestFlight.",
    stack: ["React Native", "Expo", "Node", "Express", "MongoDB", "Redis"],
    facts: [["built by", "solo"], ["listing refresh", "2× a day"], ["status", "TestFlight"]],
  },
];

export const getProject = (slug: string): ProjectMeta | undefined => PROJECTS.find((p) => p.slug === slug);
