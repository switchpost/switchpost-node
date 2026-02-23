import { describe, expect, it } from "vitest";
import { NotFoundError } from "../src/errors.js";
import { TasksResource } from "../src/resources/tasks.js";
import {
	mockFetch,
	recordingFetch,
	sequentialFetch,
	testConfig,
	wireError,
	wireOffsetList,
	wireTask,
	wireTaskRun,
} from "./helpers.js";

describe("TasksResource", () => {
	describe("list", () => {
		it("returns a page of tasks with camelCase fields", async () => {
			const body = wireOffsetList([wireTask()]);
			const resource = new TasksResource(testConfig(mockFetch(200, body)));

			const result = await resource.list();
			expect(result.items).toHaveLength(1);
			expect(result.items[0].id).toBe("tsk_4K7fR9pLm2nQwXvY8cJH3");
			expect(result.items[0].name).toBe("send-email");
			expect(result.items[0].endpointUrl).toBe("https://example.com/api/send-email");
			expect(result.items[0].timeoutMs).toBe(30000);
			expect(result.items[0].retryPolicy.maxAttempts).toBe(3);
			expect(result.items[0].retryPolicy.initialDelayMs).toBe(1000);
			expect(result.items[0].successCodes).toEqual([200, 201]);
			expect(result.items[0].permanentFailureCodes).toEqual([400, 422]);
			expect(result.items[0].storeResponse).toBe(true);
			expect(result.items[0].audit.createdAt).toBe("2025-01-15T10:00:00Z");
		});

		it("transforms pagination from snake_case", async () => {
			const body = wireOffsetList([wireTask()], { total: 42 });
			const resource = new TasksResource(testConfig(mockFetch(200, body)));

			const result = await resource.list();
			expect(result.total).toBe(42);
			expect(result.offset).toBe(0);
			expect(result.limit).toBe(50);
		});

		it("passes query parameters", async () => {
			const body = wireOffsetList([]);
			const { fetch, calls } = recordingFetch(200, body);
			const resource = new TasksResource(testConfig(fetch));

			await resource.list({ limit: 10, offset: 5 });

			expect(calls).toHaveLength(1);
			const url = new URL(calls[0].url);
			expect(url.searchParams.get("limit")).toBe("10");
			expect(url.searchParams.get("offset")).toBe("5");
		});

		it("auto-paginates with for await", async () => {
			const page1 = wireOffsetList([wireTask({ name: "task-1" }), wireTask({ name: "task-2" })], {
				limit: 2,
				total: 3,
			});
			const page2 = wireOffsetList([wireTask({ name: "task-3" })], { offset: 2, limit: 2, total: 3 });
			const { fetch } = sequentialFetch([
				{ status: 200, body: page1 },
				{ status: 200, body: page2 },
			]);
			const resource = new TasksResource(testConfig(fetch));

			const names: string[] = [];
			for await (const task of resource.list({ limit: 2 })) {
				names.push(task.name);
			}
			expect(names).toEqual(["task-1", "task-2", "task-3"]);
		});
	});

	describe("get", () => {
		it("returns a single task", async () => {
			const resource = new TasksResource(testConfig(mockFetch(200, wireTask())));

			const task = await resource.get("tsk_4K7fR9pLm2nQwXvY8cJH3");
			expect(task.id).toBe("tsk_4K7fR9pLm2nQwXvY8cJH3");
			expect(task.name).toBe("send-email");
			expect(task.endpointUrl).toBe("https://example.com/api/send-email");
		});

		it("sends correct URL and method", async () => {
			const { fetch, calls } = recordingFetch(200, wireTask());
			const resource = new TasksResource(testConfig(fetch));

			await resource.get("tsk_4K7fR9pLm2nQwXvY8cJH3");

			expect(calls).toHaveLength(1);
			expect(calls[0].init.method).toBe("GET");
			expect(calls[0].url).toContain("/tasks/tsk_4K7fR9pLm2nQwXvY8cJH3");
		});

		it("throws NotFoundError on 404", async () => {
			const body = wireError(404, "Not Found", "Task not found");
			const resource = new TasksResource(testConfig(mockFetch(404, body)));

			await expect(resource.get("tsk_nonexistent")).rejects.toThrow(NotFoundError);
		});
	});

	describe("create", () => {
		it("sends POST with snake_case body and returns camelCase response", async () => {
			const { fetch, calls } = recordingFetch(201, wireTask({ name: "new-task" }));
			const resource = new TasksResource(testConfig(fetch));

			const task = await resource.create({
				name: "new-task",
				endpointUrl: "https://example.com/api/new",
			});

			expect(task.name).toBe("new-task");
			expect(calls).toHaveLength(1);
			expect(calls[0].init.method).toBe("POST");
			expect(calls[0].url).toContain("/tasks");

			const sentBody = JSON.parse(calls[0].init.body as string);
			expect(sentBody.name).toBe("new-task");
			expect(sentBody.endpoint_url).toBe("https://example.com/api/new");
		});
	});

	describe("update", () => {
		it("sends PATCH with partial body", async () => {
			const { fetch, calls } = recordingFetch(200, wireTask({ timeout_ms: 60000 }));
			const resource = new TasksResource(testConfig(fetch));

			const task = await resource.update("tsk_4K7fR9pLm2nQwXvY8cJH3", { timeoutMs: 60000 });

			expect(task.timeoutMs).toBe(60000);
			expect(calls[0].init.method).toBe("PATCH");
			expect(calls[0].url).toContain("/tasks/tsk_4K7fR9pLm2nQwXvY8cJH3");

			const sentBody = JSON.parse(calls[0].init.body as string);
			expect(sentBody.timeout_ms).toBe(60000);
		});
	});

	describe("delete", () => {
		it("sends DELETE and returns void", async () => {
			const { fetch, calls } = recordingFetch(204);
			const resource = new TasksResource(testConfig(fetch));

			const result = await resource.delete("tsk_4K7fR9pLm2nQwXvY8cJH3");

			expect(result).toBeUndefined();
			expect(calls[0].init.method).toBe("DELETE");
			expect(calls[0].url).toContain("/tasks/tsk_4K7fR9pLm2nQwXvY8cJH3");
		});
	});

	describe("submitRun", () => {
		it("sends POST to /tasks/{id}/runs", async () => {
			const { fetch, calls } = recordingFetch(202, wireTaskRun());
			const resource = new TasksResource(testConfig(fetch));

			const run = await resource.submitRun("tsk_4K7fR9pLm2nQwXvY8cJH3", {
				payload: { email: "user@example.com" },
			});

			expect(run.id).toBe("run_9xL5wKnY8cJH2fX3rQ4s");
			expect(run.status).toBe("PENDING");
			expect(calls[0].init.method).toBe("POST");
			expect(calls[0].url).toContain("/tasks/tsk_4K7fR9pLm2nQwXvY8cJH3/runs");

			const sentBody = JSON.parse(calls[0].init.body as string);
			expect(sentBody.payload).toEqual({ email: "user@example.com" });
		});
	});

	describe("headers", () => {
		it("sends Authorization: ApiKey, version, user-agent, and content-type headers", async () => {
			const { fetch, calls } = recordingFetch(200, wireTask());
			const resource = new TasksResource(testConfig(fetch));

			await resource.get("tsk_test");

			const headers = calls[0].init.headers as Record<string, string>;
			expect(headers.Authorization).toBe("ApiKey sp_test_abc123");
			expect(headers["SwitchPost-Version"]).toBeDefined();
			expect(headers["User-Agent"]).toMatch(/^switchpost-node\//);
			expect(headers["Content-Type"]).toBe("application/json");
			expect(headers.Accept).toBe("application/json");
		});
	});
});
