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

import { type ClientConfig, type ResolvedConfig, resolveConfig } from "./config.js";
import { AdminResource } from "./resources/admin.js";
import { AttemptsResource } from "./resources/attempts.js";
import { BindingsResource } from "./resources/bindings.js";
import { PrincipalsResource } from "./resources/principals.js";
import { RunsResource } from "./resources/runs.js";
import { SettingsResource } from "./resources/settings.js";
import { TasksResource } from "./resources/tasks.js";
import { TriggersResource } from "./resources/triggers.js";
import { WebhooksResource } from "./resources/webhooks.js";

/**
 * SwitchPost API client.
 *
 * @example
 * ```ts
 * import SwitchPost from "switchpost";
 *
 * const client = new SwitchPost({
 *   baseUrl: "https://switchpost.example.com",
 *   apiKey: "sp_...",
 * });
 * const tasks = await client.tasks.list();
 * ```
 */
export class SwitchPost {
	/** Manage tasks. */
	readonly tasks: TasksResource;

	/** Manage triggers for tasks. */
	readonly triggers: TriggersResource;

	/** Manage task runs. */
	readonly runs: RunsResource;

	/** View task run attempts. */
	readonly attempts: AttemptsResource;

	/** Manage webhooks for runs. */
	readonly webhooks: WebhooksResource;

	/** Manage principals (users and API keys). */
	readonly principals: PrincipalsResource;

	/** Manage policy bindings. */
	readonly bindings: BindingsResource;

	/** Manage tenant settings. */
	readonly settings: SettingsResource;

	/** System administration (admin only). */
	readonly admin: AdminResource;

	private readonly _config: ResolvedConfig;

	constructor(config: ClientConfig) {
		this._config = resolveConfig(config);
		this.tasks = new TasksResource(this._config);
		this.triggers = new TriggersResource(this._config);
		this.runs = new RunsResource(this._config);
		this.attempts = new AttemptsResource(this._config);
		this.webhooks = new WebhooksResource(this._config);
		this.principals = new PrincipalsResource(this._config);
		this.bindings = new BindingsResource(this._config);
		this.settings = new SettingsResource(this._config);
		this.admin = new AdminResource(this._config);
	}
}

export default SwitchPost;
