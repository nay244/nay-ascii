## Physical Infrastructure

| Component | Description |
|---|---|
| **Data Centers** | Physical facilities housing servers, storage, and networking. Azure has 300+ datacenters globally. Customers never interact directly with them. |
| **Availability Zones (AZ)** | Physically separate datacenters within a single Azure region. Each zone has independent power, cooling, and networking. Deploying across AZs gives a **99.99% VM SLA**. Protects against datacenter-level failures. |
| **Azure Regions** | Geographic areas containing one or more datacenters. Examples: East US, West Europe, Southeast Asia. Azure has 60+ regions worldwide. Choose region closest to users for lowest latency. |
| **Region Pairs** | Each region is paired with another region in the same geography (e.g., East US ↔ West US). If a major outage occurs, Microsoft prioritizes restoring one region in the pair. Replication distance ≥ 300 miles ensures geo-redundancy. |
| **Sovereign Regions** | Isolated instances of Azure for compliance: **Azure Government** (US federal agencies), **Azure China 21Vianet** (operated by a local partner). Data stays within national boundaries. |

## Management Infrastructure (Logical)

Azure organizes resources in a hierarchy. From broadest to narrowest:

- **Management Groups** — Containers for multiple subscriptions. Apply governance (policies, RBAC) across all subscriptions in the group. Up to 6 levels of nesting.
- **Subscriptions** — A unit of billing and access management. Every Azure resource lives in a subscription. An Azure account can have multiple subscriptions (e.g., one per department).
- **Resource Groups** — Logical containers for Azure resources. All resources must belong to a resource group. Deleting a resource group deletes all resources inside it.
- **Resources** — Individual Azure services: VMs, storage accounts, databases, etc.
