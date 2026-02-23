import type { CreatedInfo } from "./shared.js";

/** Full policy binding representation (read model). */
export interface PolicyBinding {
	id: string;
	tenantId: string;
	principalId: string;
	role: string;
	resourceType: string;
	resourceId: string;
	created: CreatedInfo;
}

/** Parameters for creating a policy binding. */
export interface CreateBindingParams {
	/** Role to grant. */
	role: string;
	/** Resource type: tenant or task. */
	resourceType: string;
	/** Resource ID to scope the binding to. */
	resourceId: string;
}
