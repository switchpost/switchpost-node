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
