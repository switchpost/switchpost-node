import { World, setWorldConstructor } from "@cucumber/cucumber";
import { SwitchPost } from "../../src/client.js";
import type { PolicyBinding } from "../../src/types/binding.js";
import type { Principal } from "../../src/types/principal.js";
import type { TaskResultMeta, TaskRun, TaskRunAttempt } from "../../src/types/run.js";
import type { TenantSettings } from "../../src/types/settings.js";
import type { ListResponse } from "../../src/types/shared.js";
import type { Task } from "../../src/types/task.js";
import type { Trigger } from "../../src/types/trigger.js";
import type { Webhook } from "../../src/types/webhook.js";

export class SwitchPostWorld extends World {
	client!: SwitchPost;

	// --- Current resources ---
	task: Task | null = null;
	taskId = "";

	trigger: Trigger | null = null;
	triggerId = "";

	run: TaskRun | null = null;
	runId = "";

	attempt: TaskRunAttempt | null = null;
	attemptId = "";

	webhook: Webhook | null = null;
	webhookId = "";

	principal: Principal | null = null;
	principalId = "";
	returnedApiKey = "";

	binding: PolicyBinding | null = null;
	bindingId = "";

	settings: TenantSettings | null = null;
	savedSettings: TenantSettings | null = null;

	result: TaskResultMeta | null = null;

	// --- Secondary / alternate resources ---
	secondTask: Task | null = null;
	secondTaskId = "";

	secondRun: TaskRun | null = null;
	secondRunId = "";

	secondPrincipal: Principal | null = null;
	secondPrincipalId = "";

	retriedRun: TaskRun | null = null;

	// For "first created task" in duplicate scenarios
	firstCreatedTaskId = "";

	// Alternate client for auth tests
	alternateClient: SwitchPost | null = null;

	// --- List responses ---
	taskList: ListResponse<Task> | null = null;
	triggerList: Trigger[] | null = null;
	runList: { items: TaskRun[]; hasMore: boolean; nextCursor?: string; prevCursor?: string } | null = null;
	attemptList: { items: TaskRunAttempt[]; hasMore: boolean; nextCursor?: string; prevCursor?: string } | null = null;
	webhookList: Webhook[] | null = null;
	bindingList: PolicyBinding[] | null = null;
	principalList: ListResponse<Principal> | null = null;

	// Cursor pagination state
	nextCursor = "";

	// --- Error tracking ---
	lastError: any = null;
	lastStatusCode = 0;
	errorResponse: Record<string, any> = {};

	// --- Cleanup lists ---
	createdTasks: string[] = [];
	createdTriggers: Array<{ taskId: string; triggerId: string }> = [];
	createdRuns: string[] = [];
	createdWebhooks: Array<{ runId: string; webhookId: string }> = [];
	createdPrincipals: string[] = [];
	createdBindings: string[] = [];

	// --- Pending create params (for retry policy / rate limit chaining) ---
	pendingTaskParams: Record<string, any> | null = null;

	constructor(options: any) {
		super(options);
		// Let the SDK read SWITCHPOST_API_URL, SWITCHPOST_API_KEY, and
		// SWITCHPOST_ACCESS_TOKEN from environment variables automatically.
		// Only override baseUrl if the env var is not set.
		const baseUrl = process.env.SWITCHPOST_API_URL || "http://localhost:8080";
		this.client = new SwitchPost({ baseUrl });
	}
}

setWorldConstructor(SwitchPostWorld);
