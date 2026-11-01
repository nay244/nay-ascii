## Factors That Affect Azure Costs

- **Resource type** — Different resources have different rates (e.g., VM vs. storage account).
- **Consumption** — Pay-as-you-go OR reserved (commit 1 or 3 years for up to ~72% savings).
- **Region** — Prices vary by Azure region due to operational costs.
- **Bandwidth** — Data transferred *into* Azure (ingress) is free. Data *out* of Azure (egress) is charged.
- **Subscriptions** — Different subscription types (free, pay-as-you-go, Enterprise) have different pricing.

## Cost Management Tools

| Tool | Purpose |
|---|---|
| **Azure Pricing Calculator** | Estimate the cost of deploying specific Azure services before you commit. Configure VMs, storage, and more to see pricing projections. |
| **Total Cost of Ownership (TCO) Calculator** | Estimate cost *savings* of migrating from on-premises to Azure. Compares on-premises costs (hardware, power, facilities, IT labor) vs. Azure costs. |
| **Azure Cost Management + Billing** | Monitor, analyze, and optimize actual Azure spending. Set budgets and alerts. View cost breakdown by resource, resource group, or subscription. |
| **Azure Advisor** | Free personalized recommendations for cost, security, reliability, operational excellence, and performance. Identifies idle/underused resources to reduce spend. |

## Tags

**Resource tags** are name-value pairs (metadata) you attach to Azure resources for organization.

Examples: `Environment: Production`, `Department: Finance`, `CostCenter: 12345`

- Enable cost allocation by department or project.
- Filter resources in billing reports.
- Tags are *not* inherited by child resources automatically.
- Azure Policy can enforce tagging standards.

## Azure Policy

Enforce organizational standards and assess compliance at scale. Azure Policy evaluates resources and flags those that don't comply with your rules.

Policies can:
- **Audit** — Report non-compliance without blocking deployment.
- **Deny** — Block non-compliant resources from being created.
- **Deploy if not exist** — Auto-remediate by deploying a required configuration.

Example: "All VMs must be deployed in East US region."

- Policies are inherited from parent scope (management group → subscription → resource group).
- **Policy Initiatives** (formerly Policy Sets): Group multiple policies together to achieve a broader compliance goal (e.g., HIPAA, ISO 27001).

## Resource Locks

Prevent accidental deletion or modification of critical Azure resources.

| Lock Type | Effect |
|---|---|
| **Delete** | Users can read and modify a resource, but cannot delete it. |
| **ReadOnly** | Users can read a resource, but cannot modify or delete it. Similar to a Reader RBAC role. |

> **Important:** Resource locks override RBAC. Even an **Owner** cannot delete a locked resource without first removing the lock. Apply locks at the resource group level to protect all resources within it.

## Microsoft Purview

A unified **data governance** and **compliance** solution. Helps organizations discover, classify, and govern data across on-premises, multi-cloud, and SaaS environments.

- **Data Map** — Automatically discover and classify data assets.
- **Data Catalog** — Business glossary and data lineage.
- **Compliance Manager** — Assess and improve compliance posture against regulations (GDPR, HIPAA).
- **Information Protection** — Apply sensitivity labels and data loss prevention policies.

## Azure Management Interfaces

| Tool | Purpose |
|---|---|
| **Azure Portal** | Web-based GUI at portal.azure.com. Full-featured visual interface for managing all Azure resources. Best for one-off tasks, learning, and visual exploration. |
| **Azure Cloud Shell** | Browser-based shell providing Bash (Azure CLI) or PowerShell from within the Azure Portal. No local installation needed. Authenticated automatically. |
| **Azure CLI** | Cross-platform command-line tool (bash syntax). Use for scripting and automation on Linux/macOS/Windows. |
| **Azure PowerShell** | Module for PowerShell (Windows-native syntax). Use for scripting and automation, especially in Windows-centric environments. |

## Infrastructure as Code (IaC)

Managing and provisioning infrastructure through machine-readable definition files rather than manual configuration. Benefits: repeatability, versioning, consistency, and automation.

| Tool | Description |
|---|---|
| **ARM Templates** | Azure's native IaC format (JSON). Declarative — describe the desired state, and Azure deploys it. Idempotent (deploy multiple times, same result). |
| **Bicep** | A simpler, human-readable language that compiles to ARM templates. Preferred by Microsoft for new ARM-based deployments. |
| **Terraform** | Third-party (HashiCorp) IaC tool that works across multiple cloud providers including Azure. Uses HCL (HashiCorp Configuration Language). |

## Azure Resource Manager (ARM)

The **deployment and management service** for Azure. Every interaction with Azure resources goes through ARM — whether from the Portal, CLI, PowerShell, or REST APIs.

ARM provides: authentication, authorization, grouping, tagging, locking, templates, and activity logging.

## Azure Arc

Extends Azure management to **resources outside of Azure** — including on-premises servers, Kubernetes clusters, and databases running in other clouds (AWS, GCP). Arc lets you apply Azure Policy, RBAC, monitoring, and security to non-Azure resources using the same Azure tools.

> **Azure Arc Use Case:** A company has on-premises servers and wants to manage them with Azure tools (Policy, RBAC, Security Center) without moving to the cloud. **Azure Arc** is the answer.
