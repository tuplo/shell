import { spawn } from "node:child_process";
import type { Readable } from "node:stream";
import { format } from "node:util";

type IExecArgs = {
	input?: Buffer | Readable | string | undefined;
	quiet?: boolean;
	verbose?: boolean;
};

type IExecReturnValue = {
	command: string;
	exitCode: null | number;
	stderr: string;
	stdout: string;
};

function exec(command: string, options?: IExecArgs): Promise<IExecReturnValue> {
	const { input, quiet, verbose } = options || {};

	return new Promise((resolve, reject) => {
		if (verbose) {
			console.log(`$ ${command}`);
		}

		const [program, ...args] = command.split(" ");
		const child = spawn(program, args, { shell: true, stdio: "pipe" });

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
			resolve({ command, exitCode, stderr, stdout: stdout.trim() });
		});
	});
}

type ITemplateExpression =
	| (boolean | number | string | undefined)[]
	| boolean
	| string
	| undefined;

function composeCommand(
	templates: TemplateStringsArray,
	...expressions: ITemplateExpression[]
) {
	const str = templates
		.filter(Boolean)
		.map((s) => `${s}%s`)
		.join("");

	const cmd = format(str, ...expressions.flat().filter(Boolean)).replace(
		/%s$/,
		""
	);

	return cmd;
}

type IShellOptions = {
	quiet?: boolean;
	verbose?: boolean;
};

type IShell = {
	(
		templatesOrOptions: TemplateStringsArray,
		...expressions: ITemplateExpression[]
	): Promise<IExecReturnValue>;
	(options?: IShellOptions): IShell;
};

function create$(options?: IShellOptions) {
	function $(
		templatesOrOptions: IShellOptions | TemplateStringsArray,
		...expressions: ITemplateExpression[]
	): IShell | Promise<IExecReturnValue> {
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
