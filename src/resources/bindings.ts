// Copyright 2026 SwitchPost Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
