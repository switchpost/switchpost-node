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
	ErrorDetail,
} from "./shared.js";

export type {
	Task,
	CreateTaskParams,
	UpdateTaskParams,
	TaskListParams,
	TaskListResponse,
} from "./task.js";

export type {
	TriggerType,
	Trigger,
	CreateTriggerParams,
	UpdateTriggerParams,
} from "./trigger.js";

export type {
	RunStatus,
	AttemptStatus,
	TaskRun,
	SubmitRunParams,
	RunListParams,
	TaskRunAttempt,
	TaskResultMeta,
} from "./run.js";

export type {
	Webhook,
	CreateWebhookParams,
} from "./webhook.js";

export type {
	PrincipalType,
	Principal,
	CreatePrincipalParams,
	CreatePrincipalResponse,
	PrincipalListParams,
	PrincipalListResponse,
} from "./principal.js";

export type {
	PolicyBinding,
	CreateBindingParams,
} from "./binding.js";

export type {
	TenantSettings,
	SystemSettings,
} from "./settings.js";

export type {
	Tenant,
	CreateTenantParams,
	CreateTenantResponse,
} from "./tenant.js";
