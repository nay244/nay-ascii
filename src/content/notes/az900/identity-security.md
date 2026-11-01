## Microsoft Entra ID (formerly Azure AD)

Microsoft's cloud-based **identity and access management (IAM)** service. Every Azure account uses Entra ID. It authenticates users and authorizes access to Azure resources and other services (Microsoft 365, third-party apps).

- **Microsoft Entra ID** — Cloud-native IAM. Used for authentication, SSO, and application access management.
- **Microsoft Entra Domain Services** — Provides managed domain services (LDAP, Kerberos, NTLM) in the cloud — no need to deploy and manage domain controllers. Ideal for lift-and-shift of legacy apps that require domain join.

## Authentication Methods

| Method | Description |
|---|---|
| **SSO (Single Sign-On)** | Users sign in once and access multiple applications without re-authenticating. Reduces password fatigue. Azure Entra ID acts as the identity provider. |
| **MFA (Multi-Factor Authentication)** | Requires two or more verification factors: something you know (password), something you have (phone), something you are (fingerprint). Significantly reduces identity attack risk. |
| **Passwordless** | Replaces passwords entirely with something you have (Windows Hello, FIDO2 key, Microsoft Authenticator app). Most secure authentication option. |

## Conditional Access

**Microsoft Entra Conditional Access** — Policies that control who can access resources and under what conditions. Evaluate signals like user identity, location, device state, and application risk.

Example: require MFA when accessing from outside the corporate network.

## Azure Role-Based Access Control (RBAC)

RBAC controls *what* users can do with Azure resources. Assign users, groups, or service principals a **role** at a specific **scope** (management group, subscription, resource group, or resource).

- **Owner** — Full access + can delegate access to others.
- **Contributor** — Create and manage resources, but cannot grant roles to others.
- **Reader** — View existing resources only.
- **User Access Administrator** — Manage user access to Azure resources.

> **RBAC vs Resource Locks:** RBAC controls *who can do what*. Resource Locks prevent *accidental changes/deletes* — even an Owner cannot delete a resource with a Delete lock without first removing the lock.

## Security Frameworks & Models

| Framework | Description |
|---|---|
| **Zero Trust** | Never trust, always verify. Assume breach. Explicitly verify every access request (identity, device, location). Limit blast radius with least-privilege access. |
| **Defense in Depth** | Layered security strategy. 7 layers: Physical → Identity → Perimeter → Network → Compute → Application → Data. If one layer is breached, others provide protection. |
| **External Identities** | Azure B2B (invite partners, guests) and B2C (customer-facing apps with social login). Let external users access your resources without managing their credentials. |

## Microsoft Defender for Cloud

A **security posture management** and **threat protection** service. Provides a unified security score, security recommendations, and threat detection for Azure and hybrid workloads. Monitors VMs, containers, databases, and more. Formerly called Azure Security Center.
