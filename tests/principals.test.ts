import { describe, expect, it } from "vitest";
import { AuthenticationError, NotFoundError } from "../src/errors.js";
import { PrincipalsResource } from "../src/resources/principals.js";
import {
	mockFetch,
	recordingFetch,
	sequentialFetch,
	testConfig,
	wireError,
	wireOffsetList,
	wirePrincipal,
} from "./helpers.js";

describe("PrincipalsResource", () => {
	describe("list", () => {
		it("returns a page of principals with camelCase fields", async () => {
			const body = wireOffsetList([wirePrincipal()]);
			const resource = new PrincipalsResource(testConfig(mockFetch(200, body)));

			const result = await resource.list();
			expect(result.items).toHaveLength(1);
			expect(result.items[0].id).toBe("prn_7mN3pR9xK2wLvY8cJH4fQ");
			expect(result.items[0].type).toBe("api_key");
			expect(result.items[0].name).toBe("CI Pipeline");
			expect(result.items[0].keyPrefix).toBe("sp_");
			expect(result.items[0].audit.createdAt).toBe("2025-01-15T10:00:00Z");
		});

		it("auto-paginates with for await", async () => {
			const page1 = wireOffsetList([wirePrincipal({ name: "Key 1" }), wirePrincipal({ name: "Key 2" })], {
				limit: 2,
				total: 3,
			});
			const page2 = wireOffsetList([wirePrincipal({ name: "Key 3" })], { offset: 2, limit: 2, total: 3 });
			const { fetch } = sequentialFetch([
				{ status: 200, body: page1 },
				{ status: 200, body: page2 },
			]);
			const resource = new PrincipalsResource(testConfig(fetch));

			const names: string[] = [];
			for await (const principal of resource.list({ limit: 2 })) {
				names.push(principal.name);
			}
			expect(names).toEqual(["Key 1", "Key 2", "Key 3"]);
		});
	});

	describe("get", () => {
		it("returns a single principal", async () => {
			const resource = new PrincipalsResource(testConfig(mockFetch(200, wirePrincipal())));

			const principal = await resource.get("prn_7mN3pR9xK2wLvY8cJH4fQ");
			expect(principal.id).toBe("prn_7mN3pR9xK2wLvY8cJH4fQ");
			expect(principal.name).toBe("CI Pipeline");
		});

		it("sends correct URL and method", async () => {
			const { fetch, calls } = recordingFetch(200, wirePrincipal());
			const resource = new PrincipalsResource(testConfig(fetch));

			await resource.get("prn_7mN3pR9xK2wLvY8cJH4fQ");

			expect(calls).toHaveLength(1);
			expect(calls[0].init.method).toBe("GET");
			expect(calls[0].url).toContain("/principals/prn_7mN3pR9xK2wLvY8cJH4fQ");
		});

		it("throws NotFoundError on 404", async () => {
			const body = wireError(404, "Not Found", "Principal not found");
			const resource = new PrincipalsResource(testConfig(mockFetch(404, body)));

			await expect(resource.get("prn_nonexistent")).rejects.toThrow(NotFoundError);
		});
	});

	describe("create", () => {
		it("sends POST with snake_case body and returns response", async () => {
			const responseBody = {
				principal: wirePrincipal(),
				api_key: "sp_live_secretkey123",
			};
			const { fetch, calls } = recordingFetch(201, responseBody);
			const resource = new PrincipalsResource(testConfig(fetch));

			const result = await resource.create({
				type: "api_key",
				name: "CI Pipeline",
			});

			expect(result.principal.name).toBe("CI Pipeline");
			expect(result.apiKey).toBe("sp_live_secretkey123");
			expect(calls).toHaveLength(1);
			expect(calls[0].init.method).toBe("POST");
			expect(calls[0].url).toContain("/principals");
		});
	});

	describe("delete", () => {
		it("sends DELETE and returns void", async () => {
			const { fetch, calls } = recordingFetch(204);
			const resource = new PrincipalsResource(testConfig(fetch));

			const result = await resource.delete("prn_7mN3pR9xK2wLvY8cJH4fQ");

			expect(result).toBeUndefined();
			expect(calls[0].init.method).toBe("DELETE");
			expect(calls[0].url).toContain("/principals/prn_7mN3pR9xK2wLvY8cJH4fQ");
		});
	});

	describe("error handling", () => {
		it("throws AuthenticationError on 401", async () => {
			const body = wireError(401, "Unauthorized", "Invalid API key");
			const resource = new PrincipalsResource(testConfig(mockFetch(401, body)));

			const err = await resource.list().then(
				() => null,
				(e) => e,
			);

			expect(err).toBeInstanceOf(AuthenticationError);
			expect(err.statusCode).toBe(401);
			expect(err.message).toBe("Invalid API key");
		});
	});
});
