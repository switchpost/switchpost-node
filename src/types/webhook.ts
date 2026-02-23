import type { CreatedInfo } from "./shared.js";

/** Full webhook representation (read model). */
export interface Webhook {
	id: string;
	runId: string;
	url: string;
	secretRef?: string;
	created: CreatedInfo;
}

/** Parameters for creating a webhook. */
export interface CreateWebhookParams {
	/** HTTPS endpoint URL for webhook delivery, max 2048 chars. */
	url: string;
	/** Optional HMAC secret for webhook payload signing. */
	secret?: string;
}
