import type { CreatePrincipalParams, CreatePrincipalResponse, Principal, PrincipalListParams } from "../types/index.js";
import { BaseResource, type OffsetPage } from "./base.js";

/**
 * Manage principals (users and API keys).
 *
 * @example
 * ```ts
 * const { principal, apiKey } = await client.principals.create({
 *   type: "api_key",
 *   name: "CI Pipeline",
 * });
 * ```
 */
export class PrincipalsResource extends BaseResource {
	/**
	 * Retrieve a paginated list of principals.
	 *
	 * Returns an `OffsetPage` that can be awaited for a single page
	 * or iterated with `for await` for auto-pagination.
	 */
	list(params: PrincipalListParams = {}): OffsetPage<Principal> {
		return this._offsetList<Principal>("/principals", params);
	}

	/** Retrieve a single principal by ID. */
	async get(principalId: string): Promise<Principal> {
		return this.request<Principal>("GET", `/principals/${encodeURIComponent(principalId)}`);
	}

	/** Create a new principal. Returns the principal and (for api_key type) the raw API key. */
	async create(params: CreatePrincipalParams): Promise<CreatePrincipalResponse> {
		return this.request<CreatePrincipalResponse>("POST", "/principals", { body: params });
	}

	/** Permanently delete a principal. */
	async delete(principalId: string): Promise<void> {
		await this.request<void>("DELETE", `/principals/${encodeURIComponent(principalId)}`);
	}
}
