import type { AuditInfo } from "./shared.js";

/** Full tenant representation (read model). */
export interface Tenant {
	id: string;
	name: string;
	displayName: string;
	audit: AuditInfo;
}

/** Parameters for creating a tenant (admin only). */
export interface CreateTenantParams {
	/** Tenant slug, globally unique. [a-z0-9\-_], max 100 chars. */
	name: string;
	/** Human-readable tenant label, max 200 chars. */
	displayName: string;
}

/** Response from creating a tenant. */
export interface CreateTenantResponse {
	tenant: Tenant;
	apiKey: string;
	principalId: string;
}
