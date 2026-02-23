Update the SDK to match the current `openapi.json` in the repo root.

$ARGUMENTS

## Process

### 1. Diff the spec

Compare the current `openapi.json` against the existing SDK source to identify what changed. Categorize changes as:

- **New endpoints** — require new resource methods (and possibly new Resource classes)
- **Removed endpoints** — remove corresponding resource methods
- **New/changed schemas** — require type updates
- **New/changed path parameters** — update resource method signatures
- **New/changed query parameters** — update list param types
- **New/changed request bodies** — update create/update param types
- **New/changed response bodies** — update return types and test factories
- **New error status codes** — add new error subclasses
- **API version change** — update `API_VERSION` in `src/version.ts`

Read every file in `src/types/`, `src/resources/`, and `src/errors.ts` to understand the current state before making changes.

### 2. Update version

If the spec has a new version date, update `API_VERSION` in `src/version.ts`. Do NOT change `SDK_VERSION` — that's updated at publish time.

### 3. Update types

Files in `src/types/` mirror the OpenAPI schemas. For each changed or new schema:

- **`src/types/shared.ts`** — `AuditInfo`, `Pagination`, `ListResponse<T>`, `ListParams`, `CursorListResponse<T>`, `CursorListParams`. Shared across all entities.
- **`src/types/<entity>.ts`** — One file per entity. Contains the read model interface, create/update param interfaces, list params, and list response type alias.
- **`src/types/index.ts`** — Barrel re-export. Must export every public type.

Rules:
- All wire-format `snake_case` fields become `camelCase` in SDK types (e.g. `endpoint_url` → `endpointUrl`)
- Use literal union types for enums (e.g. `"api_key" | "user"`, NOT a TypeScript `enum`)
- Nullable fields use `T | null`, never `undefined` or `Optional`
- Create param types: required fields are non-optional, everything else is `?`
- Update param types: all fields are `T | null | undefined` (can set, clear, or omit)
- Read models: all fields are required (the API always returns them)

### 4. Update resources

Files in `src/resources/` implement the HTTP methods. For each changed or new endpoint:

- **`src/resources/<entity>.ts`** — One class per entity group, extending `BaseResource`.
  - `list()` → uses `this._offsetList<T>(path, params)` or `this._cursorList<T>(path, params)` — returns `OffsetPage<T>` or `CursorPage<T>`
  - `get(id)` → uses `this.request<T>("GET", path)`
  - `create(params)` → uses `this.request<T>("POST", path, { body: params })`
  - `update(id, params)` → uses `this.request<T>("PATCH", path, { body: params })`
  - `delete(id)` → uses `this.request<void>("DELETE", path)` — 204 No Content
- **`src/resources/index.ts`** — Barrel re-export. Must export every Resource class.

Rules:
- Path parameters use `encodeURIComponent(id)` — e.g. `` `/tasks/${encodeURIComponent(id)}` ``
- Resource classes extend `BaseResource` and do NOT define their own constructor
- TSDoc on every public method
- If a new entity is added, create a new Resource class file AND wire it into `src/client.ts`

### 5. Update client and barrel (if new resources)

If new Resource classes were added:

- **`src/client.ts`** — Add a `readonly <name>: <Resource>` property, instantiate in constructor
- **`src/index.ts`** — Re-export new types and any new public classes

### 6. Update error classes (if new error types)

If the spec introduces new HTTP error status codes:

- **`src/errors.ts`** — Add a new `<Name>Error extends APIError` subclass and add a `case` to `buildApiError()`
- **`src/index.ts`** — Re-export the new error class

### 7. Update tests

- **`tests/helpers.ts`** — Update wire-format factories to include any new fields. Add new factories for new entity types.
- **`tests/<entity>.test.ts`** — Add/update tests for new resource methods, fields, error types.
- For new entities, create a new test file following the existing pattern.

Test rules:
- Use `mockFetch()` for simple response tests
- Use `recordingFetch()` when asserting on the sent request
- Use `sequentialFetch()` for pagination tests
- Use `testConfig(fetchFn)` to build config
- Wire-format factories return `snake_case` objects (as the real API would)

### 8. Update README

Update `README.md` to reflect any changes to the public API. Do NOT rewrite sections that are unaffected.

### 9. Verify

Run all checks and fix any issues:

```bash
npm run typecheck   # Zero errors
npm run lint        # Zero warnings
npm run test        # All tests pass
npm run build       # Produces dist/ with .js, .cjs, .d.ts, .d.cts
```

### 10. Summary

After all changes are complete, provide a summary of what changed.
