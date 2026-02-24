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

import type { CreatedInfo } from "./shared.js";

/** Full webhook representation (read model). */
export interface Webhook {
	id: string;
	runId: string;
	url: string;
	secretRef?: string;
	created: CreatedInfo;
}

/** Parameters for creating a webhook. */
export interface CreateWebhookParams {
	/** HTTPS endpoint URL for webhook delivery, max 2048 chars. */
	url: string;
	/** Optional HMAC secret for webhook payload signing. */
	secret?: string;
}
