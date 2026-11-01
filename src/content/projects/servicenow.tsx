import { Diagram } from "@/components/Diagram";
import { Flow } from "@/components/Flow";
import { firstFrame } from "@/lib/art/first-frame";
import { Chips, Decisions } from "./parts";

export function ServicenowBody() {
  return (
    <>
      <h3>Overview</h3>
      <p>
        A nine-stage production data pipeline that moves ServiceNow ITSM data (Incidents, Change Requests, Problems, CMDB) into Microsoft Power BI for operational
        reporting on incident volume, SLA compliance and MTTR. The pipeline follows a <strong>medallion architecture</strong> (Bronze → Silver layers) and is fully
        event-driven: each successful extraction automatically triggers transformation and report refresh with no manual intervention.
      </p>
      <figure className="panel" style={{ marginTop: 12 }}>
        <figcaption style={{ color: "var(--faint)" }}>Four tables · one pipeline</figcaption>
        <Diagram piece="project-servicenow" cols={62} rows={19} />
      </figure>

      <h3>Pipeline architecture</h3>
      <Flow
        piece="project-servicenow-stages"
        rows={21}
        caption="Nine stages · event-driven"
        fallback={firstFrame("project-servicenow-stages", 46)}
        steps={[
          { stop: 1, name: "ServiceNow REST API", when: "stage 1", children: <p>Source system: table-level read via a dedicated API service account.</p> },
          { stop: 2, name: "AWS AppFlow", when: "stage 2", children: <p>Managed ETL connector, with daily incremental extraction per table.</p> },
          { stop: 3, name: "Amazon Redshift (Bronze)", when: "stage 3", children: <p>Raw landing zone: timestamped, unmodified source data.</p> },
          { stop: 4, name: "Amazon EventBridge", when: "stage 4", children: <p>Event-driven trigger on AppFlow S3 success events.</p> },
          { stop: 5, name: "Amazon SQS", when: "stage 5", children: <p>Message queue decoupling EventBridge from Jenkins.</p> },
          { stop: 6, name: "Jenkins + Bitbucket", when: "stage 6", children: <p>CI/CD pipeline that polls SQS and executes DBT transformation jobs.</p> },
          { stop: 7, name: "Amazon Redshift (Silver)", when: "stage 7", children: <p>Clean, modeled reporting layer managed by DBT.</p> },
          { stop: 8, name: "Microsoft Power Automate", when: "stage 8", children: <p>HTTP-triggered dataset refresh orchestration.</p> },
          { stop: 9, name: "Microsoft Power BI Service", when: "stage 9", children: <p>Semantic model, dashboards, and row-level security.</p> },
        ]}
      />

      <h3>Data extraction and ingestion</h3>
      <p>
        AWS AppFlow acts as the managed ETL connector between ServiceNow and Redshift, abstracting API authentication, pagination, and incremental load logic. One
        AppFlow flow is created per source table for independent scheduling and targeted reruns. The incremental load strategy uses a watermark field (<code>sys_updated_on</code>) to extract only new or changed records, minimizing API quota consumption.
      </p>
      <p>
        AppFlow stages data in S3 before Redshift ingestion. All records land in the <strong>Bronze schema</strong> (<code>bronze.incident</code>, <code>bronze.change_request</code>, etc.) with ingestion timestamps for lineage tracking and reprocessing support.
      </p>

      <h3>Transformation layer</h3>
      <p>
        Jenkins polls SQS for flow-completion messages. On receipt, it pulls the latest DBT project from Bitbucket and executes the relevant DBT models against the
        Bronze schema. Transformed output is written to the <strong>Silver schema</strong> (<code>silver.servicenow_incidents</code>, etc.): clean, typed, and joined to reference data.
      </p>
      <p>
        DBT enforces data quality at run time using built-in tests (<code>unique</code>, <code>not_null</code>, <code>accepted_values</code>). On a successful DBT run, Jenkins sends an HTTP POST to a Power Automate webhook to trigger the Power BI dataset refresh, then deletes the SQS message.
      </p>

      <h3>Reporting and access control</h3>
      <p>
        Power BI Desktop connects to the Redshift Silver schema via JDBC/ODBC through an on-premises data gateway (hosted on an EC2 instance in the same VPC).
        Reports and semantic models are published to a shared Power BI workspace. <strong>Row-Level Security (RLS)</strong> roles are defined in Power BI Desktop and validated with the &quot;View as role&quot; feature before go-live, ensuring each team sees only their relevant data.
      </p>

      <h3>Key design decisions</h3>
      <Decisions
        items={[
          ["One flow per table", "Independent scheduling and error isolation; failures in one table do not cascade."],
          [
            "SQS as buffer",
            "Decouples EventBridge from Jenkins, guaranteeing delivery even during transient consumer downtime. A Dead Letter Queue captures messages that exceed max receive count.",
          ],
          [
            "Least-privilege IAM",
            "Each stage uses a scoped service role (AppFlow role, DBT IAM user, M365 service account) with only the permissions required for that stage.",
          ],
          [
            "Private networking",
            "Redshift clusters reside in a private subnet. The on-premises data gateway on EC2 allows Power BI Service to reach Silver without public cluster exposure.",
          ],
        ]}
      />

      <h3>Stack</h3>
      <Chips items={["ServiceNow", "AWS AppFlow", "Amazon S3", "Amazon Redshift", "Amazon EventBridge", "Amazon SQS", "Jenkins", "Bitbucket", "DBT", "Power Automate", "Power BI"]} />
    </>
  );
}
