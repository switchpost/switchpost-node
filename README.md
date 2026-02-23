# SwitchPost Node.js SDK

Official TypeScript/Node.js client for the [SwitchPost](https://github.com/switchpost/switchpost) task scheduling API.

## Installation

```bash
npm install switchpost
```

## Quick Start

```typescript
import SwitchPost from "switchpost";

const client = new SwitchPost({
  baseUrl: "https://switchpost.example.com",
  apiKey: "sp_...",
});

// Create a task
const task = await client.tasks.create({
  name: "send-email",
  endpointUrl: "https://api.example.com/send-email",
});

// Submit a run
const run = await client.tasks.submitRun(task.id, {
  payload: { to: "user@example.com", subject: "Hello" },
});

// Check run status
const status = await client.runs.get(run.id);
console.log(status.status); // "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"
```

## Configuration

SwitchPost is self-hosted, so a base URL is always required.

```typescript
const client = new SwitchPost({
  // Required: base URL of your SwitchPost instance
  baseUrl: "https://switchpost.example.com",

  // Authentication (at least one required):
  apiKey: "sp_...",        // X-API-Key header
  accessToken: "jwt...",   // Authorization: Bearer header

  // Optional:
  timeout: 60_000,         // Request timeout in ms (default: 60s)
  version: "2026-01-01",   // API version header override
  fetch: customFetch,      // Custom fetch implementation
});
```

### Environment Variables

| Variable | Description |
|---|---|
| `SWITCHPOST_API_URL` | Base URL (fallback for `baseUrl`) |
| `SWITCHPOST_API_KEY` | API key (fallback for `apiKey`) |
| `SWITCHPOST_ACCESS_TOKEN` | Bearer token (fallback for `accessToken`) |

## Resources

### Tasks

```typescript
// List tasks (auto-paginating)
for await (const task of client.tasks.list()) {
  console.log(task.name);
}

// Single page
const page = await client.tasks.list({ limit: 10, offset: 0 });
console.log(page.items);   // Task[]
console.log(page.total);   // number

// Get a task
const task = await client.tasks.get("tsk_abc");

// Create a task
const task = await client.tasks.create({
  name: "process-webhook",
  endpointUrl: "https://api.example.com/process",
  timeoutMs: 30000,
  retryPolicy: { maxAttempts: 3, initialDelayMs: 1000, multiplier: 2, maxDelayMs: 60000 },
  successCodes: [200, 201],
});

// Update a task
const task = await client.tasks.update("tsk_abc", { timeoutMs: 60000 });

// Delete a task
await client.tasks.delete("tsk_abc");

// Submit a run
const run = await client.tasks.submitRun("tsk_abc", {
  payload: { key: "value" },
  webhookUrl: "https://example.com/webhook",
});
```

### Triggers

```typescript
// List triggers for a task
const triggers = await client.triggers.list("tsk_abc");

// Get a trigger
const trigger = await client.triggers.get("tsk_abc", "trg_xyz");

// Create a cron trigger
const trigger = await client.triggers.create("tsk_abc", {
  name: "Every 5 minutes",
  type: "CRON",
  schedule: "*/5 * * * *",
  timezone: "America/New_York",
});

// Create an event trigger
const trigger = await client.triggers.create("tsk_abc", {
  name: "On completion",
  type: "EVENT",
  sourceTaskId: "tsk_other",
  onStatus: "COMPLETED",
  forwardResult: true,
});

// Update a trigger
const trigger = await client.triggers.update("tsk_abc", "trg_xyz", { enabled: false });

// Delete a trigger
await client.triggers.delete("tsk_abc", "trg_xyz");
```

### Runs

```typescript
// List runs for a task (cursor-paginated, auto-paginating)
for await (const run of client.runs.list("tsk_abc")) {
  console.log(run.id, run.status);
}

// Filter by status
const page = await client.runs.list("tsk_abc", { status: "FAILED", limit: 10 });

// Get a run
const run = await client.runs.get("run_abc");

// Cancel a run
const run = await client.runs.cancel("run_abc");

// Retry a failed run
const newRun = await client.runs.retry("run_abc");

// Get result metadata
const result = await client.runs.getResult("run_abc");
console.log(result.statusCode, result.blobUrl);
```

### Attempts

```typescript
// List attempts for a run (cursor-paginated)
for await (const attempt of client.attempts.list("run_abc")) {
  console.log(attempt.attemptNumber, attempt.status);
}

// Get a specific attempt
const attempt = await client.attempts.get("run_abc", "att_xyz");
```

### Webhooks

```typescript
// List webhooks for a run
const webhooks = await client.webhooks.list("run_abc");

// Register a webhook
const webhook = await client.webhooks.create("run_abc", {
  url: "https://example.com/webhook",
  secret: "hmac_secret",
});

// Delete a webhook
await client.webhooks.delete("run_abc", "whk_xyz");
```

### Principals

```typescript
// List principals (auto-paginating)
for await (const principal of client.principals.list()) {
  console.log(principal.name, principal.type);
}

// Get a principal
const principal = await client.principals.get("prn_abc");

// Create an API key principal
const { principal, apiKey } = await client.principals.create({
  type: "api_key",
  name: "CI Pipeline",
});
console.log(apiKey); // Raw key, only shown once

// Create a user principal
const { principal } = await client.principals.create({
  type: "user",
  name: "Jane Doe",
  email: "jane@example.com",
  oauthProvider: "github",
  oauthSubject: "12345",
});

// Delete a principal
await client.principals.delete("prn_abc");
```

### Policy Bindings

```typescript
// List bindings for a principal
const bindings = await client.bindings.list("prn_abc");

// Create a binding
const binding = await client.bindings.create("prn_abc", {
  role: "admin",
  resourceType: "tenant",
  resourceId: "tnt_xyz",
});

// Delete a binding
await client.bindings.delete("bnd_abc");
```

### Settings

```typescript
// Get tenant settings
const settings = await client.settings.get();

// Update tenant settings
const settings = await client.settings.update({
  defaultMaxAttempts: 5,
  defaultInitialDelayMs: 2000,
  webhookAllowedDomains: ["example.com"],
  oauthAutoProvisioning: true,
  apiRateLimitPerMinute: 1000,
  apiRateLimitBurstSize: 100,
  maxBatchSize: 50,
  defaultPriority: 0,
});
```

### Admin

```typescript
// Get system settings (admin only)
const settings = await client.admin.getSettings();

// Update system settings (admin only)
const settings = await client.admin.updateSettings({
  maxTasksPerTenant: 1000,
  maxConcurrentRunsPerTenant: 500,
  defaultWorkerConcurrency: 10,
  runArchivalBatchSize: 1000,
});

// Create a tenant (admin only)
const { tenant, apiKey, principalId } = await client.admin.createTenant({
  name: "acme-corp",
  displayName: "Acme Corporation",
});
```

## Pagination

### Offset-based (tasks, principals)

```typescript
// Auto-paginate with async iterator
for await (const task of client.tasks.list()) {
  console.log(task.name);
}

// Single page
const page = await client.tasks.list({ limit: 10, offset: 0 });
console.log(page.items);  // Task[]
console.log(page.total);  // number
console.log(page.offset);
console.log(page.limit);
```

### Cursor-based (runs, attempts)

```typescript
// Auto-paginate with async iterator
for await (const run of client.runs.list("tsk_abc")) {
  console.log(run.status);
}

// Single page
const page = await client.runs.list("tsk_abc", { limit: 10 });
console.log(page.items);      // TaskRun[]
console.log(page.hasMore);    // boolean
console.log(page.nextCursor); // string | undefined
```

## Error Handling

```typescript
import { NotFoundError, AuthenticationError, SwitchPostError } from "switchpost";

try {
  await client.tasks.get("tsk_nonexistent");
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(err.statusCode);  // 404
    console.log(err.title);       // "Not Found"
    console.log(err.message);     // Detailed error message
    console.log(err.details);     // ErrorDetail[] | null
  }
}
```

### Error Classes

| Class | Status | Description |
|---|---|---|
| `SwitchPostError` | -- | Base error class |
| `APIError` | any | Generic API error |
| `BadRequestError` | 400 | Invalid request |
| `AuthenticationError` | 401 | Missing or invalid credentials |
| `PermissionDeniedError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflict |
| `UnprocessableEntityError` | 422 | Validation failure |
| `RateLimitError` | 429 | Rate limit exceeded |
| `InternalServerError` | 500 | Server error |
| `ConnectionError` | -- | Network-level error (timeout, DNS) |

## TypeScript

All types are exported for use in your application:

```typescript
import type {
  Task,
  CreateTaskParams,
  Trigger,
  TriggerType,
  TaskRun,
  RunStatus,
  Principal,
  PolicyBinding,
  TenantSettings,
  AuditInfo,
  RetryPolicy,
  RateLimit,
} from "switchpost";
```

## Requirements

- Node.js 18+ (uses native `fetch` and `AbortSignal.timeout`)
- Also works in Bun, Deno, and other runtimes with native `fetch`

## License

Apache 2.0
