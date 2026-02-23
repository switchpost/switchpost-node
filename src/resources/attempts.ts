import type { CursorListParams, TaskRunAttempt } from "../types/index.js";
import { BaseResource, type CursorPage } from "./base.js";

/**
 * View task run attempts.
 *
 * @example
 * ```ts
 * for await (const attempt of client.attempts.list("run_abc")) {
 *   console.log(attempt.attemptNumber, attempt.status);
 * }
 * ```
 */
export class AttemptsResource extends BaseResource {
	/**
	 * List attempts for a run (cursor-paginated).
	 *
	 * Returns a `CursorPage` that can be awaited for a single page
	 * or iterated with `for await` for auto-pagination.
	 */
	list(runId: string, params: CursorListParams = {}): CursorPage<TaskRunAttempt> {
		return this._cursorList<TaskRunAttempt>(`/runs/${encodeURIComponent(runId)}/attempts`, params);
	}

	/** Retrieve a single attempt by ID. */
	async get(runId: string, attemptId: string): Promise<TaskRunAttempt> {
		return this.request<TaskRunAttempt>(
			"GET",
			`/runs/${encodeURIComponent(runId)}/attempts/${encodeURIComponent(attemptId)}`,
		);
	}
}
