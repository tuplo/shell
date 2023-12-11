import { Socket } from "node:net";

type IWaitForSocketArgs = {
	host: string;
	intervalInMs?: number;
	password?: string;
	port: number;
	verbose?: boolean;
	user?: string;
};

async function connect(args: IWaitForSocketArgs): Promise<void> {
	const { host, password, port, user } = args;
	const config = {
		host,
		port,
		username: user,
		password,
	};

	return new Promise((resolve, reject) => {
		const conn = new Socket();

		conn.on("ready", () => {
			conn.end();
			resolve();
		});

		conn.on("error", (e) => {
			reject(e);
		});

		conn.connect(config);
	});
}

export async function waitForSocket(args: IWaitForSocketArgs): Promise<void> {
	const { host, intervalInMs = 2_000, port, verbose } = args;
	if (verbose) {
		process.stdout.write(`Waiting for ${host}:${port} `);
	}

	return new Promise((resolve) => {
		const interval = setInterval(async () => {
			try {
				await connect(args);
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
