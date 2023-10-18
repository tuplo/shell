import { type RequestOptions } from "node:http";
import https from "node:https";

import { fetch } from "./fetch";

interface IWaitForUrlArgs {
	auth: string;
	hostname?: string;
	intervalInMs?: number;
	pathname: string;
	port: number;
	protocol: string;
	url: string;
	verbose?: boolean;
}

export async function waitForUrl(
	args: Partial<IWaitForUrlArgs>
): Promise<void> {
	const {
		auth,
		hostname = "127.0.0.1",
		intervalInMs = 2_000,
		pathname,
		port,
		protocol = "http",
		verbose,
	} = args;
	const url = new URL(args?.url || [protocol, hostname].join("://"));
	if (port) {
		url.port = port.toString();
	}

	if (pathname) {
		url.pathname = pathname;
	}

	const requestOptions: RequestOptions = { headers: {} };

	if (auth) {
		const bearer = Buffer.from(auth).toString("base64");
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Basic ${bearer}`,
		};
	}

	if (protocol === "https") {
		requestOptions.agent = new https.Agent({
			rejectUnauthorized: false,
		});
	}

	if (verbose) {
		process.stdout.write(`Waiting for ${url.href} `);
	}

	return new Promise((resolve) => {
		const interval = setInterval(async () => {
			try {
				await fetch(url.href, requestOptions);
				clearInterval(interval);
				if (verbose) {
					process.stdout.write(" OK\n");
				}

				resolve();
			} catch (e) {
				if (verbose) {
					process.stdout.write(".");
				}
			}
		}, intervalInMs);
	});
}
