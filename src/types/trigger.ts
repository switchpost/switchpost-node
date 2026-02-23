import type { AuditInfo } from "./shared.js";

/** Trigger type. */
export type TriggerType = "HTTP" | "CRON" | "EVENT" | "QUEUE";

/** Full trigger representation (read model). */
export interface Trigger {
	id: string;
	taskId: string;
	type: TriggerType;
	name: string;
	enabled: boolean;
	schedule?: string;
	timezone?: string;
	sourceTaskId?: string;
	onStatus?: string;
	forwardResult?: boolean;
	defaultPayload?: unknown;
	lastFiredAt?: string;
	nextFireAt?: string;
	payloadMapping?: string;
	queueAdapterType?: string;
	queueAdapterConfig?: unknown;
	audit: AuditInfo;
}

/** Parameters for creating a trigger. */
export interface CreateTriggerParams {
	/** Human-readable trigger label. */
	name: string;
	/** Trigger mechanism: HTTP, CRON, EVENT, or QUEUE. */
	type: TriggerType;
	/** Cron expression (required for CRON type). */
	schedule?: string;
	/** IANA timezone for CRON schedule. */
	timezone?: string;
	/** Source task ID (required for EVENT type). */
	sourceTaskId?: string;
	/** Terminal status filter for EVENT type. */
	onStatus?: string;
	/** Forward source result as payload for EVENT type. */
	forwardResult?: boolean;
	/** Optional default JSON payload. */
	defaultPayload?: unknown;
	/** Whether the trigger is active. Default: true. */
	enabled?: boolean;
}

/** Parameters for updating a trigger. All fields optional. */
export interface UpdateTriggerParams {
	name?: string;
	schedule?: string;
	timezone?: string;
	sourceTaskId?: string;
	onStatus?: string;
	forwardResult?: boolean;
	defaultPayload?: unknown;
	enabled?: boolean;
}
