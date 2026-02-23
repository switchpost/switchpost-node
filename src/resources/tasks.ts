import type { CreateTaskParams, Task, TaskListParams, UpdateTaskParams } from "../types/index.js";
import type { SubmitRunParams, TaskRun } from "../types/run.js";
import { BaseResource, type OffsetPage } from "./base.js";

/**
 * Manage tasks.
 *
 * @example
 * ```ts
 * const task = await client.tasks.create({
 *   name: "send-email",
 *   endpointUrl: "https://example.com/api/send-email",
 * });
 * ```
 */
export class TasksResource extends BaseResource {
	/**
	 * Retrieve a paginated list of tasks.
	 *
	 * Returns an `OffsetPage` that can be awaited for a single page
	 * or iterated with `for await` for auto-pagination.
	 */
	list(params: TaskListParams = {}): OffsetPage<Task> {
		return this._offsetList<Task>("/tasks", params);
	}

	/** Retrieve a single task by ID. */
	async get(taskId: string): Promise<Task> {
		return this.request<Task>("GET", `/tasks/${encodeURIComponent(taskId)}`);
	}

	/** Create a new task. */
	async create(params: CreateTaskParams): Promise<Task> {
		return this.request<Task>("POST", "/tasks", { body: params });
	}

	/** Partially update a task. Only provided fields are changed. */
	async update(taskId: string, params: UpdateTaskParams): Promise<Task> {
		return this.request<Task>("PATCH", `/tasks/${encodeURIComponent(taskId)}`, { body: params });
	}

	/** Permanently delete a task. */
	async delete(taskId: string): Promise<void> {
		await this.request<void>("DELETE", `/tasks/${encodeURIComponent(taskId)}`);
	}

	/** Submit a new run for a task. */
	async submitRun(taskId: string, params: SubmitRunParams = {}): Promise<TaskRun> {
		return this.request<TaskRun>("POST", `/tasks/${encodeURIComponent(taskId)}/runs`, { body: params });
	}
}
