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

import type { AuditInfo, ListParams, ListResponse, RateLimit, RetryPolicy } from "./shared.js";

/** Full task representation (read model). */
export interface Task {
	id: string;
	name: string;
	endpointUrl: string;
	timeoutMs: number;
	retryPolicy: RetryPolicy;
	successCodes: number[] | null;
	permanentFailureCodes: number[] | null;
	storeResponse: boolean;
	maxConcurrency?: number;
	rateLimit?: RateLimit;
	resultTtlSeconds?: number;
	audit: AuditInfo;
}

/** Parameters for creating a task. */
export interface CreateTaskParams {
	/** Task slug, unique per tenant. [a-z0-9\-_], max 100 chars. */
	name: string;
	/** HTTPS endpoint URL to call, max 2048 chars. */
	endpointUrl: string;
	/** Per-attempt timeout in ms (1-30000000). Default: 30000. */
	timeoutMs?: number;
	/** Exponential backoff configuration. */
	retryPolicy?: RetryPolicy;
	/** HTTP status codes indicating success (1-20 elements). */
	successCodes?: number[] | null;
	/** HTTP status codes that should not be retried (0-20 elements). */
	permanentFailureCodes?: number[] | null;
	/** Whether to persist response bodies. Default: true. */
	storeResponse?: boolean;
	/** Maximum concurrent runs (1-10000). */
	maxConcurrency?: number;
	/** Throughput constraint. */
	rateLimit?: RateLimit;
	/** Duration before stored results expire (60-31536000). */
	resultTtlSeconds?: number;
}

/** Parameters for updating a task. All fields optional. */
export interface UpdateTaskParams {
	endpointUrl?: string;
	timeoutMs?: number;
	retryPolicy?: RetryPolicy;
	successCodes?: number[];
	permanentFailureCodes?: number[];
	storeResponse?: boolean;
	maxConcurrency?: number;
	rateLimit?: RateLimit;
	resultTtlSeconds?: number;
}

/** Parameters for listing tasks (offset-based). */
export interface TaskListParams extends ListParams {}

/** Paginated list of tasks. */
export type TaskListResponse = ListResponse<Task>;
