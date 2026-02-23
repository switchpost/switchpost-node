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
