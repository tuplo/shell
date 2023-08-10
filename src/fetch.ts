import { request, type RequestOptions } from "node:http";
import { parse } from "node:url";

export async function fetch(url: string, options: RequestOptions) {
	const parsed = parse(url);
	const opts: RequestOptions = {
		method: "GET",
		...parsed,
		...options,
	};

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

		req.end();
	});
}
