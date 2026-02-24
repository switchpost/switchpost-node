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

export { SwitchPost } from "./client.js";
export { default } from "./client.js";

export { API_VERSION, SDK_VERSION } from "./version.js";

// Errors
export {
	SwitchPostError,
	APIError,
	BadRequestError,
	AuthenticationError,
	PermissionDeniedError,
	NotFoundError,
	ConflictError,
	UnprocessableEntityError,
	RateLimitError,
	InternalServerError,
	ConnectionError,
} from "./errors.js";
export type { ErrorDetail } from "./errors.js";

// Types
export type {
	AuditInfo,
	CreatedInfo,
	Pagination,
	ListResponse,
	ListParams,
	CursorListResponse,
	CursorListParams,
	RateLimit,
	RetryPolicy,
	Task,
	CreateTaskParams,
	UpdateTaskParams,
	TaskListParams,
	TaskListResponse,
	TriggerType,
	Trigger,
	CreateTriggerParams,
	UpdateTriggerParams,
	RunStatus,
	AttemptStatus,
	TaskRun,
	SubmitRunParams,
	RunListParams,
	TaskRunAttempt,
	TaskResultMeta,
	Webhook,
	CreateWebhookParams,
	PrincipalType,
	Principal,
	CreatePrincipalParams,
	CreatePrincipalResponse,
	PrincipalListParams,
	PrincipalListResponse,
	PolicyBinding,
	CreateBindingParams,
	TenantSettings,
	SystemSettings,
	Tenant,
	CreateTenantParams,
	CreateTenantResponse,
} from "./types/index.js";

// Config
export type { ClientConfig } from "./config.js";

// Resources (for advanced usage / typing)
export { OffsetPage, CursorPage } from "./resources/base.js";
