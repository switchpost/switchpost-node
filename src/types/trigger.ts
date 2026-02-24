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
