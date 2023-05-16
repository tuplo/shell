import fs from "node:fs";

export async function waitForFile(filename: string) {
	process.stdout.write(`Waiting for ${filename} `);

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			process.stdout.write(".");

			if (fs.existsSync(filename)) {
				process.stdout.write(" OK\n");
				clearInterval(interval);
				resolve(null);
			}
		}, 1_000);
	});
}
