import nodeFetch, { RequestInfo, RequestInit } from "node-fetch";
import { hastebinMirror } from "./constants";
import { jsonObject } from "./types";

/**
 * Helper function to fetch remote content.
 * Will automatically detect content-type and return Image Buffer, Json Object or Plain Text
 * @param {string} url The url to fetch
 * @param {object} [options] Request Options
 * @param {number} [timeout=5] Request timeout, in seconds.
 */
export async function fetch(url: RequestInfo, options?: RequestInit, timeout = 5) {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject(`Request took too long (${timeout}s)`), timeout * 1000);

		nodeFetch(url, options)
			.then(async res => {
				if (res.status > 299 || res.status < 200) reject(`${res.status}: ${res.statusText}`);

				const contentType = res.headers.get("content-type") || "application/json";

				if (contentType.includes("image")) {
					res.buffer().then(resolve).catch(reject);
				} else if (contentType.includes("json")) {
					res.json().then(resolve).catch(reject);
				} else {
					res.text().then(resolve).catch(reject);
				}
			})
			.catch(reject);
	});
}

/**
 * @see fetch
 */
export async function post(url: RequestInfo, options: RequestInit, timeout = 5) {
	return fetch(
		url,
		{
			...options,
			method: "post"
		},
		timeout
	);
}

/**
 * Helper function to post JSON data
 * Will automatically detect content-type and return Image Buffer, Json Object or Plain Text
 * @param {string} url The url to fetch
 * @param {object} json The JSON data
 * @param {object} [options] Request Options
 * @param {number} [timeout=5] Request timeout, in seconds.
 */
export async function postJson(url: RequestInfo, json: jsonObject, options: RequestInit, timeout = 5): Promise<jsonObject> {
	return fetch(
		url,
		{
			...options,
			method: "post",
			body: JSON.stringify(json),
			headers: { ...options.headers, "content-type": "application/json", accept: "application/json" }
		},
		timeout
	) as Promise<jsonObject>;
}

export async function haste(content: string) {
	const { key } = (await post(`${hastebinMirror}/documents`, {
		body: content,
		headers: { "content-type": "text/plain" }
	})) as jsonObject<string>;
	return `${hastebinMirror}/${key}`;
}
