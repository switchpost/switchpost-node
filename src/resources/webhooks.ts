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

import type { CreateWebhookParams, Webhook } from "../types/index.js";
import { BaseResource } from "./base.js";

/**
 * Manage webhooks for runs.
 *
 * @example
 * ```ts
 * const webhook = await client.webhooks.create("run_abc", {
 *   url: "https://example.com/webhook",
 * });
 * ```
 */
export class WebhooksResource extends BaseResource {
	/** List all webhooks for a run. Returns a simple array (not paginated). */
	async list(runId: string): Promise<Webhook[]> {
		const resp = await this.request<{ items: Webhook[] }>("GET", `/runs/${encodeURIComponent(runId)}/webhooks`);
		return resp.items ?? [];
	}

	/** Register a webhook for a run. */
	async create(runId: string, params: CreateWebhookParams): Promise<Webhook> {
		return this.request<Webhook>("POST", `/runs/${encodeURIComponent(runId)}/webhooks`, { body: params });
	}

	/** Delete a webhook. */
	async delete(runId: string, webhookId: string): Promise<void> {
		await this.request<void>("DELETE", `/runs/${encodeURIComponent(runId)}/webhooks/${encodeURIComponent(webhookId)}`);
	}
}
