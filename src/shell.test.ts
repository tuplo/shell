import { $ } from "./shell";

describe("$", () => {
	it("calls a command", async () => {
		const actual = await $`echo hello`;

		expect(actual.stdout).toBe("hello");
	});

	it("calls a command with flags", async () => {
		const flags = ["var1", "var2"];

		const actual = await $`echo ${flags}`;
		expect(actual.stdout).toBe("var1 var2");
		expect(actual.command).toBe("echo var1 var2");
	});

	it("handles flags with undefined variables", async () => {
		const flags = ["var1", undefined, "var2"];

		const actual = await $`echo ${flags}`;
		expect(actual.stdout).toBe("var1 var2");
		expect(actual.command).toBe("echo var1 var2");
	});

	it("handles environment variables in commands", async () => {
		const actual = await $`echo $PWD`;

		expect(actual.stdout).toBe(process.cwd());
	});

	it("handles variables in commands", async () => {
		const var1 = "foobar";
		const actual = await $`echo ${var1}`;

		expect(actual.stdout).toBe("foobar");
	});

	it("handles flags with variables in commands", async () => {
		const var1 = "v1";
		const var2 = "v2";
		const actual = await $`echo var1=${var1} var2=${var2}`;

		expect(actual.stdout).toBe("var1=v1 var2=v2");
	});

	it("handles paths with variables", async () => {
		const var1 = "v1";
		const actual = await $`echo ${var1}/foobar`;

		expect(actual.stdout).toBe("v1/foobar");
	});

	it("handles pipes", async () => {
		const actual = await $`echo s1 s2 s3 | cat | xargs | awk '{ print $2 }'`;

		expect(actual.stdout).toBe("s2");
	});

	it("accepts options", async () => {
		const actual = await $({ quiet: true })`echo hello`;
		expect(actual.stdout).toBe("hello");
	});
});
