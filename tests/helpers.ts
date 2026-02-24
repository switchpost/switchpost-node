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

import type { ResolvedConfig } from "../src/config.js";
import { API_VERSION, SDK_VERSION } from "../src/version.js";

/** Build a mock `fetch` that returns a canned response. */
export function mockFetch(status: number, body?: unknown): typeof globalThis.fetch {
	return async (): Promise<Response> => {
		return new Response(body !== undefined ? JSON.stringify(body) : null, {
			status,
			headers: { "Content-Type": "application/json" },
		});
	};
}

/** Create a mock fetch that records calls and returns canned responses. */
export function recordingFetch(
	status: number,
	body?: unknown,
): { fetch: typeof globalThis.fetch; calls: { url: string; init: RequestInit }[] } {
	const calls: { url: string; init: RequestInit }[] = [];
	const fetchFn: typeof globalThis.fetch = async (input, init?) => {
		calls.push({ url: String(input), init: init ?? {} });
		return new Response(body !== undefined ? JSON.stringify(body) : null, {
			status,
			headers: { "Content-Type": "application/json" },
		});
	};
	return { fetch: fetchFn, calls };
}

/**
 * Create a mock fetch that returns different responses for sequential calls.
 * Useful for testing pagination across multiple pages.
 */
export function sequentialFetch(responses: { status: number; body?: unknown }[]): {
	fetch: typeof globalThis.fetch;
	calls: { url: string; init: RequestInit }[];
} {
	const calls: { url: string; init: RequestInit }[] = [];
	let callIndex = 0;
	const fetchFn: typeof globalThis.fetch = async (input, init?) => {
		calls.push({ url: String(input), init: init ?? {} });
		const resp = responses[callIndex] ?? responses[responses.length - 1];
		callIndex++;
		return new Response(resp.body !== undefined ? JSON.stringify(resp.body) : null, {
			status: resp.status,
			headers: { "Content-Type": "application/json" },
		});
	};
	return { fetch: fetchFn, calls };
}

/** Build a ResolvedConfig with the given mock fetch. */
export function testConfig(fetchFn: typeof globalThis.fetch): ResolvedConfig {
	return {
		apiKey: "sp_test_abc123",
		accessToken: null,
		baseUrl: "https://switchpost.example.com",
		timeout: 5_000,
		version: API_VERSION,
		fetch: fetchFn,
		sdkVersion: SDK_VERSION,
	};
}

/** Wire-format task (snake_case, as returned by the API). */
export function wireTask(overrides?: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "tsk_4K7fR9pLm2nQwXvY8cJH3",
		name: "send-email",
		endpoint_url: "https://example.com/api/send-email",
		timeout_ms: 30000,
		retry_policy: {
			max_attempts: 3,
			initial_delay_ms: 1000,
			multiplier: 2.0,
			max_delay_ms: 60000,
		},
		success_codes: [200, 201],
		permanent_failure_codes: [400, 422],
		store_response: true,
		max_concurrency: 10,
		rate_limit: { max_per_second: 100 },
		result_ttl_seconds: 86400,
		audit: {
			created_at: "2025-01-15T10:00:00Z",
			created_by: "prn_abc",
			updated_at: "2025-01-15T10:00:00Z",
			updated_by: "prn_abc",
		},
		...overrides,
	};
}

/** Wire-format principal (snake_case, as returned by the API). */
export function wirePrincipal(overrides?: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "prn_7mN3pR9xK2wLvY8cJH4fQ",
		type: "api_key",
		name: "CI Pipeline",
		key_prefix: "sp_",
		audit: {
			created_at: "2025-01-15T10:00:00Z",
			created_by: "prn_abc",
			updated_at: "2025-01-15T10:00:00Z",
			updated_by: "prn_abc",
		},
		...overrides,
	};
}

/** Wire-format task run (snake_case, as returned by the API). */
export function wireTaskRun(overrides?: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "run_9xL5wKnY8cJH2fX3rQ4s",
		task_id: "tsk_4K7fR9pLm2nQwXvY8cJH3",
		trigger_id: "trg_abc",
		status: "PENDING",
		max_attempts: 3,
		endpoint_url: "https://example.com/api/send-email",
		priority: 0,
		created: {
			created_at: "2025-01-15T10:00:00Z",
			created_by: "prn_abc",
		},
		...overrides,
	};
}

/** Wire-format trigger (snake_case, as returned by the API). */
export function wireTrigger(overrides?: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "trg_8xN4qR2mK7wLpY9cJH5fT",
		task_id: "tsk_4K7fR9pLm2nQwXvY8cJH3",
		type: "CRON",
		name: "Every 5 minutes",
		enabled: true,
		schedule: "*/5 * * * *",
		timezone: "UTC",
		audit: {
			created_at: "2025-01-15T10:00:00Z",
			created_by: "prn_abc",
			updated_at: "2025-01-15T10:00:00Z",
			updated_by: "prn_abc",
		},
		...overrides,
	};
}

/** Wire-format policy binding (snake_case, as returned by the API). */
export function wireBinding(overrides?: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "bnd_3kM9pR7xN2wLqY4cJH6fV",
		tenant_id: "tnt_abc",
		principal_id: "prn_7mN3pR9xK2wLvY8cJH4fQ",
		role: "admin",
		resource_type: "tenant",
		resource_id: "tnt_abc",
		created: {
			created_at: "2025-01-15T10:00:00Z",
			created_by: "prn_abc",
		},
		...overrides,
	};
}

/** Wire-format webhook (snake_case, as returned by the API). */
export function wireWebhook(overrides?: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "whk_5nP2qR8xK4wLmY7cJH9fW",
		run_id: "run_9xL5wKnY8cJH2fX3rQ4s",
		url: "https://example.com/webhook",
		created: {
			created_at: "2025-01-15T10:00:00Z",
			created_by: "prn_abc",
		},
		...overrides,
	};
}

/** Wire-format RFC 7807 error response (snake_case). */
export function wireError(status: number, title: string, detail: string, errors?: unknown[]): Record<string, unknown> {
	return {
		type: "about:blank",
		title,
		detail,
		status,
		errors: errors ?? null,
	};
}

/** Wire-format offset list response wrapper. */
export function wireOffsetList(
	items: unknown[],
	opts?: { offset?: number; limit?: number; total?: number },
): Record<string, unknown> {
	return {
		items,
		total: opts?.total ?? items.length,
		offset: opts?.offset ?? 0,
		limit: opts?.limit ?? 50,
	};
}

/** Wire-format cursor list response wrapper. */
export function wireCursorList(
	items: unknown[],
	opts?: { hasMore?: boolean; nextCursor?: string; prevCursor?: string },
): Record<string, unknown> {
	return {
		items,
		has_more: opts?.hasMore ?? false,
		next_cursor: opts?.nextCursor,
		prev_cursor: opts?.prevCursor,
	};
}
