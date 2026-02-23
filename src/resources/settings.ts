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
