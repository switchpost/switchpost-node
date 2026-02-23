import type { AuditInfo, ListParams, ListResponse } from "./shared.js";

/** Principal type. */
export type PrincipalType = "api_key" | "user";

/** Full principal representation (read model). */
export interface Principal {
	id: string;
	type: PrincipalType;
	name: string;
	email?: string;
	oauthProvider?: string;
	oauthSubject?: string;
	keyPrefix?: string;
	expiresAt?: string;
	lastSeenAt?: string;
	audit: AuditInfo;
}

/** Parameters for creating a principal. */
export interface CreatePrincipalParams {
	/** Principal type: api_key or user. */
	type: PrincipalType;
	/** Human-readable principal name. */
	name: string;
	/** User email (user type only). */
	email?: string;
	/** OAuth provider (user type only). */
	oauthProvider?: string;
	/** OAuth subject ID (user type only). */
	oauthSubject?: string;
	/** Optional expiration time (API key only). */
	expiresAt?: string;
}

/** Response from creating a principal (includes raw API key for api_key type). */
export interface CreatePrincipalResponse {
	principal: Principal;
	apiKey?: string;
}

/** Parameters for listing principals (offset-based). */
export interface PrincipalListParams extends ListParams {}

/** Paginated list of principals. */
export type PrincipalListResponse = ListResponse<Principal>;
