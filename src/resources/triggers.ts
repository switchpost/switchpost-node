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

import type { CreateTriggerParams, Trigger, UpdateTriggerParams } from "../types/index.js";
import { BaseResource } from "./base.js";

/**
 * Manage triggers for tasks.
 *
 * @example
 * ```ts
 * const trigger = await client.triggers.create("task_abc", {
 *   name: "Weekday mornings",
 *   type: "CRON",
 *   schedule: "0 9 * * 1-5",
 * });
 * ```
 */
export class TriggersResource extends BaseResource {
	/** List all triggers for a task. Returns a simple array (not paginated). */
	async list(taskId: string): Promise<Trigger[]> {
		const resp = await this.request<{ items: Trigger[] }>("GET", `/tasks/${encodeURIComponent(taskId)}/triggers`);
		return resp.items ?? [];
	}

	/** Retrieve a single trigger by ID. */
	async get(taskId: string, triggerId: string): Promise<Trigger> {
		return this.request<Trigger>(
			"GET",
			`/tasks/${encodeURIComponent(taskId)}/triggers/${encodeURIComponent(triggerId)}`,
		);
	}

	/** Create a new trigger for a task. */
	async create(taskId: string, params: CreateTriggerParams): Promise<Trigger> {
		return this.request<Trigger>("POST", `/tasks/${encodeURIComponent(taskId)}/triggers`, { body: params });
	}

	/** Partially update a trigger. */
	async update(taskId: string, triggerId: string, params: UpdateTriggerParams): Promise<Trigger> {
		return this.request<Trigger>(
			"PATCH",
			`/tasks/${encodeURIComponent(taskId)}/triggers/${encodeURIComponent(triggerId)}`,
			{ body: params },
		);
	}

	/** Delete a trigger. */
	async delete(taskId: string, triggerId: string): Promise<void> {
		await this.request<void>(
			"DELETE",
			`/tasks/${encodeURIComponent(taskId)}/triggers/${encodeURIComponent(triggerId)}`,
		);
	}
}
