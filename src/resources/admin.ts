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

import type { CreateTenantParams, CreateTenantResponse, SystemSettings } from "../types/index.js";
import { BaseResource } from "./base.js";

/**
 * System administration endpoints (requires admin privileges).
 *
 * @example
 * ```ts
 * const settings = await client.admin.getSettings();
 * console.log(settings.maxTasksPerTenant);
 * ```
 */
export class AdminResource extends BaseResource {
	/** Get system settings (admin only). */
	async getSettings(): Promise<SystemSettings> {
		return this.request<SystemSettings>("GET", "/admin/settings");
	}

	/** Update system settings (admin only). */
	async updateSettings(params: SystemSettings): Promise<SystemSettings> {
		return this.request<SystemSettings>("PUT", "/admin/settings", { body: params });
	}

	/** Create a new tenant (admin only). */
	async createTenant(params: CreateTenantParams): Promise<CreateTenantResponse> {
		return this.request<CreateTenantResponse>("POST", "/admin/tenants", { body: params });
	}
}
