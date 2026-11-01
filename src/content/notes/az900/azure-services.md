## Compute Options

| Service | Type | When to Use |
|---|---|---|
| **Azure Virtual Machines (VMs)** | IaaS | Full OS control, lift-and-shift migrations, custom environments |
| **VM Scale Sets** | IaaS | Auto-scale groups of identical VMs based on demand or schedule |
| **Availability Sets** | IaaS | Distribute VMs across fault domains & update domains to avoid single-point failures within a datacenter |
| **Azure Virtual Desktop** | IaaS | Cloud-hosted Windows desktops accessible from any device (VDI) |
| **Azure App Service** | PaaS | Host web apps, APIs, and mobile backends without managing infrastructure |
| **Azure Functions** | PaaS/Serverless | Event-driven, short-lived functions. Pay per execution. No server management. |
| **Azure Container Instances (ACI)** | PaaS | Run containers without managing VMs or orchestrators. Fastest way to run a container on Azure. |
| **Azure Kubernetes Service (AKS)** | PaaS | Managed Kubernetes for orchestrating containerized apps at scale |

## Networking Services

| Service | Purpose |
|---|---|
| **Azure Virtual Network (VNet)** | Fundamental networking building block. Provides an isolated, private network in Azure. Segment with subnets. Control traffic with network security groups (NSGs). |
| **VNet Peering** | Connects two VNets so resources can communicate privately without going over the public internet — even across regions. |
| **Azure VPN Gateway** | Sends encrypted traffic between Azure VNet and on-premises networks over the public internet. Use for site-to-site or point-to-site VPN. |
| **Azure ExpressRoute** | Private, dedicated connection between on-premises and Azure (not over the public internet). Higher reliability, speed, and lower latency than VPN. |
| **Azure DNS** | Host your DNS domains in Azure. Provides name resolution using Azure infrastructure. Supports private DNS zones for internal resources. |
| **Public Endpoints** | Resources accessible over the internet via a public IP. |
| **Private Endpoints** | Resources accessible only within a private VNet via a private IP. Enhances security by keeping traffic off the public internet. |

> **VPN vs ExpressRoute:** VPN Gateway = encrypted tunnel over the public internet (lower cost, easier setup). ExpressRoute = private dedicated circuit (more reliable, faster, more expensive). Use ExpressRoute for mission-critical, high-bandwidth workloads.

## Storage Account Types & Services

| Storage Type | Purpose | Use Cases |
|---|---|---|
| **Blob Storage** | Object storage for unstructured data | Images, videos, backups, log files, data for analytics |
| **Azure Files** | Fully managed file shares in the cloud (SMB/NFS) | Lift-and-shift of on-premises file servers, shared app configs |
| **Queue Storage** | Message queuing between app components | Decouple application components, async processing |
| **Table Storage** | NoSQL key/attribute store | Flexible datasets, user data, IoT telemetry |
| **Azure Disks** | Block storage for VMs (managed disks) | OS disks, data disks for Virtual Machines |

## Storage Access Tiers (Blob)

| Tier | Access Frequency | Storage Cost | Access Cost |
|---|---|---|---|
| **Hot** | Frequently accessed | Higher | Lower |
| **Cool** | Infrequently accessed (≥30 days) | Lower | Higher |
| **Cold** | Rarely accessed (≥90 days) | Lower | Higher |
| **Archive** | Rarely accessed, flexible latency (≥180 days) | Lowest | Highest (rehydration needed) |

## Redundancy Options

| Option | Copies | Protection |
|---|---|---|
| **LRS** (Locally Redundant) | 3 copies in 1 datacenter | Hardware failures within a datacenter |
| **ZRS** (Zone Redundant) | 3 copies across 3 AZs in 1 region | Datacenter/zone failures |
| **GRS** (Geo Redundant) | 3 copies locally + 3 copies in paired region | Regional disasters |
| **GZRS** (Geo Zone Redundant) | ZRS primary + GRS secondary | Zone + regional disasters (highest durability) |

## Data Movement Options

- **AzCopy** — Command-line tool to copy blobs or files to/from a storage account. Good for scripted/automated transfers.
- **Azure Storage Explorer** — GUI application to manage storage accounts. Works on Windows, macOS, and Linux.
- **Azure File Sync** — Syncs on-premises Windows Server file shares with Azure Files. Cache frequently accessed files locally.
- **Azure Migrate** — Centralized hub for assessing and migrating on-premises servers, databases, and apps to Azure.
- **Azure Data Box** — Physical device for offline bulk data transfer. Order a device, copy data to it, ship it to Microsoft. Ideal for large datasets (TBs–PBs) where network transfer isn't practical.
