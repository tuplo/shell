/* eslint-disable no-console */
import { spawn } from "node:child_process";
import { type Readable } from "node:stream";
import util from "node:util";

interface IExecArgs {
	input?: string | Buffer | Readable | undefined;
	quiet?: boolean;
	verbose?: boolean;
}

interface IExecReturnValue {
	command: string;
	stdout: string;
	stderr: string;
	exitCode: number | null;
}

function exec(command: string, options?: IExecArgs): Promise<IExecReturnValue> {
	const { input, quiet, verbose } = options || {};

	return new Promise((resolve, reject) => {
		if (verbose) {
			console.log(`$ ${command}`);
		}

		const [program, ...args] = command.split(" ");
		const child = spawn(program, args, { stdio: "pipe", shell: true });

		if (input) {
			child.stdin?.write(input);
			child.stdin?.end();
		}

		if (!quiet) {
			child.stdout?.pipe(process.stdout);
		}

		child.stderr?.pipe(process.stderr);

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (data) => {
			stdout += data;
		});

		child.stderr?.on("data", (data) => {
			stderr += data;
		});

		child.on("error", (error) => {
			reject(error);
		});

		child.on("close", (exitCode) => {
			resolve({ command, stdout: stdout.trim(), stderr, exitCode });
		});
	});
}

type ITemplateExpression =
	| string
	| undefined
	| boolean
	| (string | undefined | boolean | number)[];

function composeCommand(
	templates: TemplateStringsArray,
	...expressions: ITemplateExpression[]
) {
	const str = templates
		.filter(Boolean)
		.map((s) => `${s}%s`)
		.join("");

	const cmd = util
		.format(str, ...expressions.flat().filter(Boolean))
		.replace(/%s$/, "");

	return cmd;
}

interface IShellOptions {
	quiet?: boolean;
	verbose?: boolean;
}

interface IShell {
	(
		templatesOrOptions: TemplateStringsArray,
		...expressions: ITemplateExpression[]
	): Promise<IExecReturnValue>;
	(options?: IShellOptions): IShell;
}

function create$(options?: IShellOptions) {
	function $(
		templatesOrOptions: TemplateStringsArray | IShellOptions,
		...expressions: ITemplateExpression[]
	): Promise<IExecReturnValue> | IShell {
		if (!Array.isArray(templatesOrOptions)) {
			return create$({ ...options, ...templatesOrOptions }) as IShell;
		}

		const templates = templatesOrOptions as TemplateStringsArray;
		const cmd = composeCommand(templates, ...expressions);

		return exec(cmd, options);
	}

	return $ as IShell;
}

export const $ = create$();
