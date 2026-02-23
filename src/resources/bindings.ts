import type { CreateBindingParams, PolicyBinding } from "../types/index.js";
import { BaseResource } from "./base.js";

/**
 * Manage policy bindings for principals.
 *
 * @example
 * ```ts
 * const binding = await client.bindings.create("prn_abc", {
 *   role: "admin",
 *   resourceType: "tenant",
 *   resourceId: "tnt_xyz",
 * });
 * ```
 */
export class BindingsResource extends BaseResource {
	/** List all policy bindings for a principal. Returns a simple array (not paginated). */
	async list(principalId: string): Promise<PolicyBinding[]> {
		const resp = await this.request<{ items: PolicyBinding[] }>(
			"GET",
			`/principals/${encodeURIComponent(principalId)}/bindings`,
		);
		return resp.items ?? [];
	}

	/** Create a policy binding for a principal. */
	async create(principalId: string, params: CreateBindingParams): Promise<PolicyBinding> {
		return this.request<PolicyBinding>("POST", `/principals/${encodeURIComponent(principalId)}/bindings`, {
			body: params,
		});
	}

	/** Delete a policy binding. */
	async delete(bindingId: string): Promise<void> {
		await this.request<void>("DELETE", `/bindings/${encodeURIComponent(bindingId)}`);
	}
}
