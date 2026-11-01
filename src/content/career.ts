// From the résumé (Oct 2026), plus the Security+ dates from nay-quartz. The phone number and home city stay off the site.
export type Entry = {
  kind: "work" | "edu";
  // "Aug 2024 – Jun 2025": a start and an end, joined by an en dash with spaces.
  dates: string;
  title: string;
  org: string;
  place?: string;
  points?: string[];
  link?: { href: string; text: string };
};

export type Cert = {
  name: string;
  issuer: string;
  // A certificate without a date shows no date line.
  date?: string;
  // Where to check the certificate. Absent when there is nothing to check.
  verify?: string;
};

export type SkillGroup = { label: string; items: string[] };

const COUNTY = { org: "Arlington County Government", place: "Arlington, VA" };

// Newest first.
export const ENTRIES: Entry[] = [
  {
    kind: "work", dates: "Jun 2025 – Sep 2026", title: "Security Engineer", ...COUNTY,
    points: [
      "Managed enterprise firewall operations across 16 Palo Alto firewalls, collaborating with network, server, and application teams to onboard devices and maintain secure, reliable connectivity for county systems and users.",
      "Maintained security infrastructure by applying vendor security patches aligned with published CVE vulnerability releases, reducing exposure to known vulnerabilities.",
      "Supported migration of on-premises applications and infrastructure to Microsoft Azure, gaining hands-on experience with cloud platforms, services, networking, and security controls.",
      "Conducted an organization-wide cybersecurity risk self-assessment using the CISA NCSR framework, analyzing maturity data across security domains to identify control gaps and provide prioritized, data-driven remediation recommendations to leadership.",
    ],
    link: { href: "/projects/azure", text: "Azure Firewall Migration" },
  },
  {
    kind: "work", dates: "Aug 2024 – Jun 2025", title: "IT Analyst", ...COUNTY,
    points: [
      "Diagnosed and resolved hardware, software, connectivity, and system access issues across Windows, macOS, and mobile devices for 3,000+ end users; documented and tracked all work through ServiceNow ticketing system.",
      "Managed device compliance and lifecycle using Microsoft Intune, including endpoint provisioning via Autopilot deployment, policy enforcement, and mobile device setup/configuration across a large-scale enterprise environment.",
      "Built a Power BI reporting solution integrating Intune data to track hardware age and replacement eligibility, supporting procurement and asset lifecycle planning.",
    ],
  },
  { kind: "edu", dates: "2023 – 2024", title: "M.S. Data Analytics", org: "Western Governors University" },
  { kind: "edu", dates: "2018 – 2021", title: "B.S. Information Technology (Cybersecurity)", org: "George Mason University" },
];

export const CERTS: Cert[] = [
  { name: "CompTIA Security+", issuer: "CompTIA", date: "Jun 2021 · valid to Jun 2027", verify: "https://verify.comptia.org" },
  { name: "Azure Fundamentals (AZ-900)", issuer: "Microsoft" },
  { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
];

export const SKILLS: SkillGroup[] = [
  { label: "security operations", items: ["Microsoft Sentinel", "Microsoft Defender for Endpoint", "Microsoft Entra ID", "Palo Alto firewalls", "Prisma Access", "Microsoft Azure", "SolarWinds", "BlueCat", "ServiceNow", "Jira", "Active Directory", "CISA NCSR", "SCADA systems"] },
  { label: "data analytics", items: ["SQL", "Python (NumPy, Pandas)", "Power BI", "Tableau", "KPI reporting", "AWS Redshift"] },
  { label: "office & productivity", items: ["Excel", "Word", "PowerPoint", "Outlook", "Adobe Acrobat"] },
];
