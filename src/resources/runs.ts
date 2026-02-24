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
