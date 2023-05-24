import fs from "node:fs";

interface IWaitFileSizeArgs {
	filePath: string;
	fileSize: number;
}

export async function waitForFileSize(args: IWaitFileSizeArgs) {
	const { filePath, fileSize } = args;
	process.stdout.write(`Waiting for ${filePath} with size ${fileSize}B `);

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			process.stdout.write(".");

			const stat = fs.statSync(filePath);
			if (stat?.size === fileSize) {
				process.stdout.write(" OK\n");
				clearInterval(interval);
				resolve(null);
			}
		}, 1_000);
	});
}
