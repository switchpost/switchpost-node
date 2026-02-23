import type { ResolvedConfig } from "../config.js";
import { ConnectionError, type ErrorDetail, buildApiError } from "../errors.js";
import type { CursorListParams, CursorListResponse, ListParams, ListResponse } from "../types/shared.js";

// ─── Case Transformation ───────────────────────────────────────────

function camelToSnakeKey(key: string): string {
	return key.replace(/[A-Z]/g, (ch, index) => (index > 0 ? "_" : "") + ch.toLowerCase());
}

function snakeToCamelKey(key: string): string {
	return key.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

function transformKeys(value: unknown, mapper: (key: string) => string): unknown {
	if (value === null || value === undefined || typeof value !== "object") {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map((item) => transformKeys(item, mapper));
	}
	const result: Record<string, unknown> = {};
	for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
		result[mapper(key)] = transformKeys(val, mapper);
	}
	return result;
}

/** Transform an outbound request body from camelCase to snake_case. */
export function toWireFormat<T>(body: T): unknown {
	return transformKeys(body, camelToSnakeKey);
}

/** Transform an inbound response body from snake_case to camelCase. */
export function fromWireFormat<T>(body: unknown): T {
	return transformKeys(body, snakeToCamelKey) as T;
}

// ─── OffsetPage (dual Promise + AsyncIterable) ─────────────────────

/**
 * A page of offset-paginated results that acts as both a `PromiseLike<ListResponse<T>>`
 * and an `AsyncIterable<T>` for auto-pagination.
 *
 * @example
 * ```ts
 * // As a promise (single page):
 * const page = await client.tasks.list({ limit: 10 });
 * console.log(page.items);
 *
 * // As an async iterator (auto-paginate):
 * for await (const task of client.tasks.list()) {
 *   console.log(task.name);
 * }
 * ```
 */
export class OffsetPage<T> implements AsyncIterable<T>, PromiseLike<ListResponse<T>> {
	private readonly _fetchPage: (params: ListParams) => Promise<ListResponse<T>>;
	private readonly _params: ListParams;
	private _result: ListResponse<T> | null = null;

	constructor(fetchPage: (params: ListParams) => Promise<ListResponse<T>>, params: ListParams) {
		this._fetchPage = fetchPage;
		this._params = { ...params };
	}

	/** Implement `PromiseLike` so `await page` works. */
	then<TResult1 = ListResponse<T>, TResult2 = never>(
		onfulfilled?: ((value: ListResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return this._getResult().then(onfulfilled, onrejected);
	}

	/** Implement `AsyncIterable` for `for await...of` auto-pagination. */
	async *[Symbol.asyncIterator](): AsyncIterator<T> {
		let offset = this._params.offset ?? 0;
		const limit = this._params.limit ?? 50;

		while (true) {
			const page = await this._fetchPage({ ...this._params, offset, limit });

			for (const item of page.items) {
				yield item;
			}

			if (page.items.length < limit) {
				break;
			}

			if (offset + page.items.length >= page.total) {
				break;
			}

			offset += page.items.length;
		}
	}

	private async _getResult(): Promise<ListResponse<T>> {
		if (!this._result) {
			this._result = await this._fetchPage(this._params);
		}
		return this._result;
	}
}

// ─── CursorPage (dual Promise + AsyncIterable) ─────────────────────

/**
 * A page of cursor-paginated results that acts as both a `PromiseLike<CursorListResponse<T>>`
 * and an `AsyncIterable<T>` for auto-pagination.
 *
 * @example
 * ```ts
 * // As a promise (single page):
 * const page = await client.runs.list("task_abc", { limit: 10 });
 * console.log(page.items);
 *
 * // As an async iterator (auto-paginate):
 * for await (const run of client.runs.list("task_abc")) {
 *   console.log(run.status);
 * }
 * ```
 */
export class CursorPage<T> implements AsyncIterable<T>, PromiseLike<CursorListResponse<T>> {
	private readonly _fetchPage: (params: CursorListParams) => Promise<CursorListResponse<T>>;
	private readonly _params: CursorListParams;
	private _result: CursorListResponse<T> | null = null;

	constructor(fetchPage: (params: CursorListParams) => Promise<CursorListResponse<T>>, params: CursorListParams) {
		this._fetchPage = fetchPage;
		this._params = { ...params };
	}

	/** Implement `PromiseLike` so `await page` works. */
	then<TResult1 = CursorListResponse<T>, TResult2 = never>(
		onfulfilled?: ((value: CursorListResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return this._getResult().then(onfulfilled, onrejected);
	}

	/** Implement `AsyncIterable` for `for await...of` auto-pagination. */
	async *[Symbol.asyncIterator](): AsyncIterator<T> {
		let cursor: string | undefined = this._params.after;

		while (true) {
			const page = await this._fetchPage({ ...this._params, after: cursor });

			for (const item of page.items) {
				yield item;
			}

			if (!page.hasMore || !page.nextCursor) {
				break;
			}

			cursor = page.nextCursor;
		}
	}

	private async _getResult(): Promise<CursorListResponse<T>> {
		if (!this._result) {
			this._result = await this._fetchPage(this._params);
		}
		return this._result;
	}
}

// ─── BaseResource ──────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
	body?: unknown;
	query?: Record<string, string | number | undefined>;
}

/**
 * Base class for all API resources.
 * Handles fetch, headers, case transformation, error mapping, and timeout.
 */
export abstract class BaseResource {
	protected readonly config: ResolvedConfig;

	constructor(config: ResolvedConfig) {
		this.config = config;
	}

	private _headers(): Record<string, string> {
		const headers: Record<string, string> = {
			"SwitchPost-Version": this.config.version,
			"User-Agent": `switchpost-node/${this.config.sdkVersion}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		};

		if (this.config.apiKey) {
			headers.Authorization = `ApiKey ${this.config.apiKey}`;
		} else if (this.config.accessToken) {
			headers.Authorization = `Bearer ${this.config.accessToken}`;
		}

		return headers;
	}

	protected async request<T>(method: HttpMethod, path: string, options?: RequestOptions): Promise<T> {
		const url = new URL(`${this.config.baseUrl}${path}`);

		if (options?.query) {
			for (const [key, value] of Object.entries(options.query)) {
				if (value !== undefined) {
					url.searchParams.set(key, String(value));
				}
			}
		}

		const fetchFn = this.config.fetch;
		let response: Response;

		try {
			response = await fetchFn(url.toString(), {
				method,
				headers: this._headers(),
				body: options?.body !== undefined ? JSON.stringify(toWireFormat(options.body)) : undefined,
				signal: AbortSignal.timeout(this.config.timeout),
			});
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				throw new ConnectionError(`Request timed out after ${this.config.timeout}ms`, { cause: err });
			}
			throw new ConnectionError(err instanceof Error ? err.message : "Network request failed", {
				cause: err instanceof Error ? err : undefined,
			});
		}

		// 204 No Content (delete)
		if (response.status === 204) {
			return undefined as T;
		}

		let rawBody: unknown;
		try {
			rawBody = await response.json();
		} catch {
			throw new ConnectionError(`Failed to parse response body (status ${response.status})`);
		}

		if (!response.ok) {
			// SwitchPost uses RFC 7807 problem+json error format
			const body = fromWireFormat<{
				type?: string;
				title?: string;
				detail?: string;
				status?: number;
				errors?: ErrorDetail[] | null;
			}>(rawBody);
			throw buildApiError(
				response.status,
				body?.type ?? "about:blank",
				body?.title ?? `HTTP ${response.status}`,
				body?.detail ?? `HTTP ${response.status}`,
				body?.errors ?? null,
			);
		}

		return fromWireFormat<T>(rawBody);
	}

	protected _offsetList<T>(path: string, params: ListParams = {}): OffsetPage<T> {
		const fetchPage = async (p: ListParams): Promise<ListResponse<T>> => {
			return this.request<ListResponse<T>>("GET", path, {
				query: {
					offset: p.offset,
					limit: p.limit,
				},
			});
		};

		return new OffsetPage<T>(fetchPage, params);
	}

	protected _cursorList<T>(
		path: string,
		params: CursorListParams & Record<string, string | number | undefined> = {},
	): CursorPage<T> {
		const fetchPage = async (p: CursorListParams): Promise<CursorListResponse<T>> => {
			const { limit, after, before, ...rest } = p as CursorListParams & Record<string, string | number | undefined>;
			return this.request<CursorListResponse<T>>("GET", path, {
				query: {
					limit,
					after,
					before,
					...rest,
				},
			});
		};

		return new CursorPage<T>(fetchPage, params);
	}
}
