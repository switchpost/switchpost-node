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

import type { AuditInfo } from "./shared.js";

/** Full tenant representation (read model). */
export interface Tenant {
	id: string;
	name: string;
	displayName: string;
	audit: AuditInfo;
}

/** Parameters for creating a tenant (admin only). */
export interface CreateTenantParams {
	/** Tenant slug, globally unique. [a-z0-9\-_], max 100 chars. */
	name: string;
	/** Human-readable tenant label, max 200 chars. */
	displayName: string;
}

/** Response from creating a tenant. */
export interface CreateTenantResponse {
	tenant: Tenant;
	apiKey: string;
	principalId: string;
}
