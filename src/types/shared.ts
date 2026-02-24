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

/** Audit info with created/updated timestamps and actors. */
export interface AuditInfo {
	createdAt: string;
	createdBy: string;
	updatedAt: string;
	updatedBy: string;
}

/** Created-only audit info (no update tracking). */
export interface CreatedInfo {
	createdAt: string;
	createdBy: string;
}

/** Offset pagination metadata returned in list responses. */
export interface Pagination {
	offset: number;
	limit: number;
	total: number;
}

/** Standard offset-based list response envelope. */
export interface ListResponse<T> {
	items: T[];
	total: number;
	offset: number;
	limit: number;
}

/** Parameters common to all offset-based list endpoints. */
export interface ListParams {
	/** Number of items to skip. */
	offset?: number;
	/** Maximum items per page (1-200, default 50). */
	limit?: number;
}

/** Cursor-based list response envelope. */
export interface CursorListResponse<T> {
	items: T[];
	hasMore: boolean;
	nextCursor?: string;
	prevCursor?: string;
}

/** Parameters for cursor-based list endpoints. */
export interface CursorListParams {
	/** Maximum items per page (1-200, default 50). */
	limit?: number;
	/** Opaque cursor for the next page. */
	after?: string;
	/** Opaque cursor for the previous page. */
	before?: string;
	/** Allow additional query parameters from subtypes. */
	[key: string]: string | number | undefined;
}

/** Rate limit configuration. */
export interface RateLimit {
	maxPerSecond: number;
}

/** Retry policy (exponential backoff). */
export interface RetryPolicy {
	maxAttempts: number;
	initialDelayMs: number;
	multiplier: number;
	maxDelayMs: number;
}

/** Error detail from validation failures. */
export interface ErrorDetail {
	location: string | null;
	message: string;
	value: unknown;
}
