## Service Models

| Model | Full Name | Description | Azure Example |
|---|---|---|---|
| **IaaS** | Infrastructure as a Service | You manage OS, middleware, runtime, apps. Provider manages hardware. | Azure Virtual Machines |
| **PaaS** | Platform as a Service | Provider manages OS and infrastructure. You manage apps and data. | Azure App Service |
| **SaaS** | Software as a Service | Provider manages everything. You use the software. | Microsoft 365 |

> **Key Exam Point:** IaaS = you patch the OS. PaaS = Microsoft patches the OS. Azure Virtual Machines = IaaS. Azure App Service = PaaS. Microsoft 365 = SaaS.

## Deployment Models

- **Public Cloud** — Resources owned and operated by a third-party provider, shared across multiple customers. Pay-as-you-go pricing.
- **Private Cloud** — Resources used exclusively by one organization. May be hosted on-premises or by a third party.
- **Hybrid Cloud** — Combines public and private clouds, allowing data and apps to move between them.

## CapEx vs. OpEx

| | CapEx (Capital Expenditure) | OpEx (Operational Expenditure) |
|---|---|---|
| **Definition** | Upfront investment in physical infrastructure | Pay-as-you-go, ongoing costs |
| **Example** | Buying servers, building a data center | Paying monthly for cloud resources |
| **Cloud model** | Traditional on-premises | Cloud computing |

> Cloud computing shifts IT spending from **CapEx to OpEx**. The **consumption-based model** means you pay only for what you use — no upfront costs, no wasted capacity.

## Shared Responsibility Model

Defines what **Microsoft** manages vs. what **you** (the customer) manage depending on the service type.

| Responsibility | On-Premises | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Physical infrastructure | Customer | **Microsoft** | **Microsoft** | **Microsoft** |
| Network controls | Customer | Customer | **Microsoft** | **Microsoft** |
| Operating system | Customer | Customer | **Microsoft** | **Microsoft** |
| Applications | Customer | Customer | Customer | **Microsoft** |
| Data & identity | Customer | Customer | Customer | Customer |

## Benefits of Cloud Services

| Benefit | Definition |
|---|---|
| **High Availability** | Systems remain operational even when components fail. Measured by SLAs (99.9%, 99.99%). Azure guarantees uptime via Availability Zones and redundant infrastructure. |
| **Scalability** | Ability to handle increased load. *Vertical scaling* = add more power to existing VMs. *Horizontal scaling* = add more instances. |
| **Elasticity** | Automatically scale resources up when demand increases, and back down when it decreases — never over-provision or under-provision. |
| **Reliability** | Resilience through decentralized, distributed design. Deploy in multiple regions so a single failure doesn't take down everything. |
| **Predictability** | *Performance predictability*: auto-scaling, load balancing. *Cost predictability*: forecast spending with Azure Cost Management and pricing tools. |
| **Security** | Cloud providers offer tools and policies to meet security requirements. You choose your level of control. |
| **Governance** | Audit and policy enforcement built in. Templates ensure resources meet corporate standards. |
| **Manageability** | Manage resources via portal, CLI, APIs, or PowerShell. Auto-scaling, monitoring, and alerting included. |
