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
