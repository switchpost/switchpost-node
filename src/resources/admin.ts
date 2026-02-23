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
