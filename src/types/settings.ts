/** Tenant-level settings. */
export interface TenantSettings {
	defaultMaxAttempts: number;
	defaultInitialDelayMs: number;
	webhookAllowedDomains: string[] | null;
	oauthAutoProvisioning: boolean;
	apiRateLimitPerMinute: number;
	apiRateLimitBurstSize: number;
	maxBatchSize: number;
	defaultPriority: number;
	defaultResultTtlSeconds?: number;
}

/** System-level settings (admin only). */
export interface SystemSettings {
	maxTasksPerTenant: number;
	maxConcurrentRunsPerTenant: number;
	defaultWorkerConcurrency: number;
	runArchivalBatchSize: number;
	runArchivalAfterDays?: number;
}
