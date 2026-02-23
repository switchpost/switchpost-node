# SwitchPost Node SDK

Official TypeScript/Node.js client for the SwitchPost API.

## Package

- **Name**: `switchpost`
- **Runtime**: Node.js 18+, also works in Bun/Deno
- **Build**: TypeScript with `tsup` for bundling (ESM + CJS dual output)
- **Package manager**: npm
- **Dependencies**: none (uses native `fetch`)
- **Dev deps**: `vitest`, `tsup`, `typescript`, `@biomejs/biome`, `@types/node`

## Project Structure

```text
src/
  index.ts              # Public barrel -- re-exports client (named + default), errors, types, Page
  client.ts             # SwitchPost class (main entry point, both named and default export)
  config.ts             # ClientConfig interface, ResolvedConfig, resolveConfig()
  errors.ts             # Error hierarchy + buildApiError() factory
  version.ts            # SDK_VERSION and API_VERSION constants
  types/
    index.ts            # Barrel re-export of all types
    shared.ts           # AuditInfo, CreatedInfo, Pagination, ListResponse<T>, ListParams,
                        # CursorListResponse<T>, CursorListParams, RateLimit, RetryPolicy, ErrorDetail
    task.ts             # Task, CreateTaskParams, UpdateTaskParams, TaskListParams
    trigger.ts          # Trigger, TriggerType, CreateTriggerParams, UpdateTriggerParams
    run.ts              # TaskRun, TaskRunAttempt, TaskResultMeta, SubmitRunParams, RunListParams
    webhook.ts          # Webhook, CreateWebhookParams
    principal.ts        # Principal, CreatePrincipalParams, CreatePrincipalResponse
    binding.ts          # PolicyBinding, CreateBindingParams
    settings.ts         # TenantSettings, SystemSettings
    tenant.ts           # Tenant, CreateTenantParams, CreateTenantResponse
  resources/
    index.ts            # Barrel re-export
    base.ts             # BaseResource (HTTP core), OffsetPage<T>, CursorPage<T>,
                        # toWireFormat/fromWireFormat (snake_case <-> camelCase)
    tasks.ts            # TasksResource -- list, get, create, update, delete, submitRun
    triggers.ts         # TriggersResource -- list, get, create, update, delete
    runs.ts             # RunsResource -- list, get, cancel, retry, getResult
    attempts.ts         # AttemptsResource -- list, get
    webhooks.ts         # WebhooksResource -- list, create, delete
    principals.ts       # PrincipalsResource -- list, get, create, delete
    bindings.ts         # BindingsResource -- list, create, delete
    settings.ts         # SettingsResource -- get, update
    admin.ts            # AdminResource -- getSettings, updateSettings, createTenant
tests/
  setup.ts              # Global vitest setup
  helpers.ts            # mockFetch, recordingFetch, sequentialFetch, wire-format factories
  client.test.ts        # Config, auth, error hierarchy tests
  tasks.test.ts         # Tasks CRUD + pagination tests
  principals.test.ts    # Principals CRUD tests
```

## Commands

```bash
npm run build           # Build with tsup (ESM + CJS + .d.ts + .d.cts)
npm run test            # Run tests with vitest
npm run test:watch      # Run tests in watch mode
npm run lint            # Lint with biome check
npm run format          # Format with biome format --write
npm run typecheck       # tsc --noEmit
```

## API Conventions (from OpenAPI spec)

- **Base URL**: self-hosted, no default (required in ClientConfig or SWITCHPOST_API_URL env)
- **Auth**: `X-API-Key` header (apiKey) OR `Authorization: Bearer` (accessToken). At least one required.
- **Versioning**: `SwitchPost-Version` header, pinned to `API_VERSION` by default, overridable
- **User-Agent**: `switchpost-node/{sdkVersion}`
- **Offset list responses**: `{"items": [...], "total": N, "offset": N, "limit": N}`
- **Cursor list responses**: `{"items": [...], "has_more": bool, "next_cursor": "...", "prev_cursor": "..."}`
- **Simple list responses**: `{"items": [...]}` (triggers, webhooks, bindings)
- **Error envelope**: RFC 7807 `{"type": "...", "title": "...", "detail": "...", "status": N, "errors": [...]}`
- **ID format**: Prefixed IDs -- `tsk_` tasks, `trg_` triggers, `run_` runs, `att_` attempts,
  `prn_` principals, `bnd_` bindings, `tnt_` tenants, `whk_` webhooks

## Key Patterns

### Client initialization

```typescript
import SwitchPost from 'switchpost';

const client = new SwitchPost({
  baseUrl: 'https://switchpost.example.com',
  apiKey: 'sp_...',
});
```

Config accepts `apiKey`, `accessToken`, `baseUrl`, `timeout`, `version`, and a custom `fetch`
implementation. Falls back to `SWITCHPOST_API_KEY`, `SWITCHPOST_ACCESS_TOKEN`, and
`SWITCHPOST_API_URL` env vars.

### Resource access (Stripe/Anthropic style)

```typescript
// Tasks -- full CRUD + submitRun
const tasks = await client.tasks.list({ limit: 10 });
const task  = await client.tasks.get('tsk_abc');
const task  = await client.tasks.create({ name: 'send-email', endpointUrl: 'https://...' });
const task  = await client.tasks.update('tsk_abc', { timeoutMs: 60000 });
await client.tasks.delete('tsk_abc');
const run   = await client.tasks.submitRun('tsk_abc', { payload: { key: 'value' } });

// Triggers -- CRUD scoped to task
const triggers = await client.triggers.list('tsk_abc');
const trigger  = await client.triggers.create('tsk_abc', { name: 'Every 5m', type: 'CRON', schedule: '*/5 * * * *' });

// Runs -- list (by task), get, cancel, retry, getResult
for await (const run of client.runs.list('tsk_abc')) { ... }
await client.runs.cancel('run_abc');

// Principals -- list, get, create, delete
const { principal, apiKey } = await client.principals.create({ type: 'api_key', name: 'CI' });
```

### Pagination

Two pagination styles:

**Offset-based** (tasks, principals): `list()` returns an `OffsetPage<T>` -- both a
`PromiseLike<ListResponse<T>>` and an `AsyncIterable<T>`:

```typescript
for await (const task of client.tasks.list()) { console.log(task.name); }
```

**Cursor-based** (runs, attempts): `list()` returns a `CursorPage<T>` -- both a
`PromiseLike<CursorListResponse<T>>` and an `AsyncIterable<T>`:

```typescript
for await (const run of client.runs.list('tsk_abc')) { console.log(run.status); }
```

### Error handling

```typescript
import { NotFoundError } from 'switchpost';

try {
  await client.tasks.get('tsk_nonexistent');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(err.message);     // Human-readable detail
    console.log(err.statusCode);  // 404
    console.log(err.title);       // "Not Found"
    console.log(err.errorType);   // URI reference
    console.log(err.details);     // ErrorDetail[] | null
  }
}
```

### Error hierarchy

```
SwitchPostError (base)
+-- APIError (any HTTP error from the API)
|   +-- BadRequestError (400)
|   +-- AuthenticationError (401)
|   +-- PermissionDeniedError (403)
|   +-- NotFoundError (404)
|   +-- ConflictError (409)
|   +-- UnprocessableEntityError (422)
|   +-- RateLimitError (429)
|   +-- InternalServerError (500)
+-- ConnectionError (network-level: timeout, DNS, connection refused)
```

### Case transformation

Wire format (snake_case) is transformed to/from SDK types (camelCase)
at the HTTP boundary in `BaseResource.request()`:

- **Outbound** (request body): `toWireFormat()` -- camelCase -> snake_case
- **Inbound** (response body): `fromWireFormat()` -- snake_case -> camelCase
- **Query params** are NOT transformed (already lowercase single words)

## Architecture Notes

- **Injectable `fetch`**: `ClientConfig.fetch` allows injecting a custom
  fetch for testing without global mocks.
- **Timeout**: Uses `AbortSignal.timeout()` (Node 18+).
- **No external mocking library**: Tests construct `Response` objects directly.
- **Resource classes extend `BaseResource`**: Subclasses inherit the
  constructor from `BaseResource(config)` -- no explicit constructor needed.
- **`biome.json`**: `noThenProperty` rule is disabled because `OffsetPage<T>`
  and `CursorPage<T>` intentionally implement `PromiseLike.then()`.

## Style

- TypeScript strict mode, ES2022 target, bundler moduleResolution
- ESM-first (`"type": "module"`) with CJS compatibility via tsup
- Native `fetch` -- zero runtime dependencies
- All methods return typed responses (no `any`)
- Biome for linting and formatting (tabs, 120 line width)
- Vitest for testing
- TSDoc on all public methods and types

## Testing

- Test helpers in `tests/helpers.ts` provide wire-format factories
  (`wireTask()`, `wirePrincipal()`, `wireTaskRun()`, `wireTrigger()`,
  `wireBinding()`, `wireWebhook()`, `wireError()`, `wireOffsetList()`,
  `wireCursorList()`) that return snake_case objects matching the API wire format
- `mockFetch()` for simple response tests
- `recordingFetch()` when you need to assert on the sent request
- `sequentialFetch()` for pagination tests
- `testConfig(fetchFn)` to build config -- never construct `ResolvedConfig` directly

## Reference

- OpenAPI spec: `openapi.json` in repo root
- The spec is the source of truth for all types, endpoints, and error shapes
