import type { RunListParams, TaskResultMeta, TaskRun } from "../types/index.js";
import { BaseResource, type CursorPage } from "./base.js";

/**
 * Manage task runs.
 *
 * @example
 * ```ts
 * const run = await client.runs.get("run_abc");
 * console.log(run.status);
 * ```
 */
export class RunsResource extends BaseResource {
	/**
	 * List runs for a task (cursor-paginated).
	 *
	 * Returns a `CursorPage` that can be awaited for a single page
	 * or iterated with `for await` for auto-pagination.
	 */
	list(taskId: string, params: RunListParams = {}): CursorPage<TaskRun> {
		return this._cursorList<TaskRun>(`/tasks/${encodeURIComponent(taskId)}/runs`, params);
	}

	/** Retrieve a single run by ID. */
	async get(runId: string): Promise<TaskRun> {
		return this.request<TaskRun>("GET", `/runs/${encodeURIComponent(runId)}`);
	}

	/** Cancel a running task run. */
	async cancel(runId: string): Promise<TaskRun> {
		return this.request<TaskRun>("POST", `/runs/${encodeURIComponent(runId)}/cancel`);
	}

	/** Retry a failed run. Returns the new run. */
	async retry(runId: string): Promise<TaskRun> {
		return this.request<TaskRun>("POST", `/runs/${encodeURIComponent(runId)}/retry`);
	}

	/** Get result metadata for a completed run. */
	async getResult(runId: string): Promise<TaskResultMeta> {
		return this.request<TaskResultMeta>("GET", `/runs/${encodeURIComponent(runId)}/result`);
	}
}
