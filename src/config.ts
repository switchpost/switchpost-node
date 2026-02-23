import { API_VERSION, SDK_VERSION } from "./version.js";

/** Configuration options for the SwitchPost client. */
export interface ClientConfig {
	/**
	 * API key for `Authorization: ApiKey` header authentication.
	 * Falls back to the `SWITCHPOST_API_KEY` environment variable.
	 */
	apiKey?: string;

	/**
	 * Bearer token for `Authorization: Bearer` header authentication.
	 * Falls back to the `SWITCHPOST_ACCESS_TOKEN` environment variable.
	 */
	accessToken?: string;

	/**
	 * Base URL of the SwitchPost API (required).
	 * SwitchPost is self-hosted, so there is no default.
	 * Falls back to the `SWITCHPOST_API_URL` environment variable.
	 */
	baseUrl?: string;

	/** Request timeout in milliseconds. Defaults to 60_000 (60 s). */
	timeout?: number;

	/**
	 * API version date (`YYYY-MM-DD`).
	 * Sent via the `SwitchPost-Version` header on every request.
	 * Defaults to the version this SDK was built against (`API_VERSION`).
	 */
	version?: string;

	/** Custom `fetch` implementation. Defaults to the global `fetch`. */
	fetch?: typeof globalThis.fetch;
}

/** Internal resolved configuration (all values guaranteed). */
export interface ResolvedConfig {
	apiKey: string | null;
	accessToken: string | null;
	baseUrl: string;
	timeout: number;
	version: string;
	fetch: typeof globalThis.fetch;
	sdkVersion: string;
}

/**
 * Resolve user-supplied config with env var fallbacks.
 * Throws if no base URL or no authentication credentials are available.
 */
export function resolveConfig(config: ClientConfig): ResolvedConfig {
	const env = typeof process !== "undefined" ? process.env : undefined;

	const apiKey = config.apiKey ?? env?.SWITCHPOST_API_KEY ?? null;
	const accessToken = config.accessToken ?? env?.SWITCHPOST_ACCESS_TOKEN ?? null;

	if (!apiKey && !accessToken) {
		throw new Error(
			"No authentication provided. Pass `apiKey` or `accessToken` to the SwitchPost constructor, " +
				"or set the SWITCHPOST_API_KEY or SWITCHPOST_ACCESS_TOKEN environment variable.",
		);
	}

	const baseUrl = config.baseUrl ?? env?.SWITCHPOST_API_URL;
	if (!baseUrl) {
		throw new Error(
			"No base URL provided. Pass `baseUrl` to the SwitchPost constructor " +
				"or set the SWITCHPOST_API_URL environment variable.",
		);
	}

	return {
		apiKey,
		accessToken,
		baseUrl: baseUrl.replace(/\/+$/, ""),
		timeout: config.timeout ?? 60_000,
		version: config.version ?? API_VERSION,
		fetch: config.fetch ?? globalThis.fetch,
		sdkVersion: SDK_VERSION,
	};
}
