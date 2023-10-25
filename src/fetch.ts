import { request, type RequestOptions } from "node:http";

export function getRequestOptions(url: string, options: RequestOptions = {}) {
	const uri = new URL(url);
	const { host, hostname, pathname, port, protocol } = uri;

	const parsedUrl: Partial<RequestOptions> = {
		host,
		hostname,
		path: pathname,
		port: port ? Number(port) : undefined,
		protocol,
	};

	return { method: "GET", ...parsedUrl, ...options } as RequestOptions;
}

export async function fetch(url: string, options: RequestOptions) {
	const opts = getRequestOptions(url, options);

	return new Promise<void>((resolve, reject) => {
		const req = request(opts, (res) => {
			const { statusCode = 500 } = res;
			if (statusCode < 400 || statusCode > 500) {
				resolve();
			} else {
				reject();
			}
		});

		req.on("error", reject);

		req.destroy();
	});
}
