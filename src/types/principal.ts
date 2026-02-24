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

import type { AuditInfo, ListParams, ListResponse } from "./shared.js";

/** Principal type. */
export type PrincipalType = "api_key" | "user";

/** Full principal representation (read model). */
export interface Principal {
	id: string;
	type: PrincipalType;
	name: string;
	email?: string;
	oauthProvider?: string;
	oauthSubject?: string;
	keyPrefix?: string;
	expiresAt?: string;
	lastSeenAt?: string;
	audit: AuditInfo;
}

/** Parameters for creating a principal. */
export interface CreatePrincipalParams {
	/** Principal type: api_key or user. */
	type: PrincipalType;
	/** Human-readable principal name. */
	name: string;
	/** User email (user type only). */
	email?: string;
	/** OAuth provider (user type only). */
	oauthProvider?: string;
	/** OAuth subject ID (user type only). */
	oauthSubject?: string;
	/** Optional expiration time (API key only). */
	expiresAt?: string;
}

/** Response from creating a principal (includes raw API key for api_key type). */
export interface CreatePrincipalResponse {
	principal: Principal;
	apiKey?: string;
}

/** Parameters for listing principals (offset-based). */
export interface PrincipalListParams extends ListParams {}

/** Paginated list of principals. */
export type PrincipalListResponse = ListResponse<Principal>;
