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

import type { CreatedInfo, CursorListParams } from "./shared.js";

/** Run status. */
export type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

/** Attempt status. */
export type AttemptStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

/** Full task run representation (read model). */
export interface TaskRun {
	id: string;
	taskId: string;
	triggerId: string;
	status: RunStatus;
	maxAttempts: number;
	endpointUrl: string;
	priority: number;
	payload?: unknown;
	maxConcurrency?: number;
	rateLimitMaxPerSecond?: number;
	startedAt?: string;
	completedAt?: string;
	cancelledAt?: string;
	cancelledBy?: string;
	created: CreatedInfo;
}

/** Parameters for submitting a new run. */
export interface SubmitRunParams {
	/** JSON payload for the run. Max 1MB. */
	payload?: unknown;
	/** Optional webhook URL to notify on completion. */
	webhookUrl?: string;
}

/** Parameters for listing runs (cursor-based). */
export interface RunListParams extends CursorListParams {
	/** Filter by run status. */
	status?: RunStatus;
}

/** Full task run attempt representation (read model). */
export interface TaskRunAttempt {
	id: string;
	runId: string;
	attemptNumber: number;
	status: AttemptStatus;
	scheduledAt: string;
	createdAt: string;
	createdBy: string;
	startedAt?: string;
	completedAt?: string;
	responseStatusCode?: number;
	errorMessage?: string;
	requestHeaders?: unknown;
	responseHeaders?: unknown;
}

/** Task result metadata. */
export interface TaskResultMeta {
	id: string;
	attemptId: string;
	runId: string;
	statusCode: number;
	blobUrl: string;
	storedAt: string;
	contentType?: string;
	contentLength?: number;
	expiresAt?: string;
	responseHeaders?: unknown;
}
