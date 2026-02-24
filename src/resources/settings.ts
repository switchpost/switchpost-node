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

import type { TenantSettings } from "../types/index.js";
import { BaseResource } from "./base.js";

/**
 * Manage tenant settings.
 *
 * @example
 * ```ts
 * const settings = await client.settings.get();
 * console.log(settings.defaultMaxAttempts);
 * ```
 */
export class SettingsResource extends BaseResource {
	/** Get current tenant settings. */
	async get(): Promise<TenantSettings> {
		return this.request<TenantSettings>("GET", "/settings");
	}

	/** Update tenant settings. Replaces all settings with the provided values. */
	async update(params: TenantSettings): Promise<TenantSettings> {
		return this.request<TenantSettings>("PUT", "/settings", { body: params });
	}
}
