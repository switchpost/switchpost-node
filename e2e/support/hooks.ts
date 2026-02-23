import { After } from "@cucumber/cucumber";
import type { SwitchPostWorld } from "./world.js";

/**
 * After each scenario, clean up any resources that were created.
 * We delete in reverse-dependency order: bindings, webhooks, triggers,
 * runs (can't delete), principals, tasks.
 */
After(async function (this: SwitchPostWorld) {
	// Delete bindings
	for (const bindingId of this.createdBindings) {
		try {
			await this.client.bindings.delete(bindingId);
		} catch {
			// ignore cleanup errors
		}
	}
	this.createdBindings = [];

	// Delete webhooks
	for (const { runId, webhookId } of this.createdWebhooks) {
		try {
			await this.client.webhooks.delete(runId, webhookId);
		} catch {
			// ignore cleanup errors
		}
	}
	this.createdWebhooks = [];

	// Delete triggers
	for (const { taskId, triggerId } of this.createdTriggers) {
		try {
			await this.client.triggers.delete(taskId, triggerId);
		} catch {
			// ignore cleanup errors
		}
	}
	this.createdTriggers = [];

	// Delete principals
	for (const principalId of this.createdPrincipals) {
		try {
			await this.client.principals.delete(principalId);
		} catch {
			// ignore cleanup errors
		}
	}
	this.createdPrincipals = [];

	// Delete tasks
	for (const taskId of this.createdTasks) {
		try {
			await this.client.tasks.delete(taskId);
		} catch {
			// ignore cleanup errors
		}
	}
	this.createdTasks = [];
});
