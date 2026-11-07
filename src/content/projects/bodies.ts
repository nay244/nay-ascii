import type { ComponentType } from "react";
import { AzureBody } from "./azure.tsx";
import { HypervBody } from "./hyperv.tsx";
import { RolunaBody } from "./roluna.tsx";
import { ServicenowBody } from "./servicenow.tsx";
import { TechconceptsBody } from "./techconcepts.tsx";

// Each project's write-up, by slug. They are Server Components, so the diagrams' first frames stay out of the client bundles.
export const PROJECT_BODIES: Record<string, ComponentType> = {
  techconcepts: TechconceptsBody,
  azure: AzureBody,
  servicenow: ServicenowBody,
  hyperv: HypervBody,
  roluna: RolunaBody,
};
