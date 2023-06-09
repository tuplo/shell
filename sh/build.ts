import "zx/globals";

async function main() {
	await $`rm -rf dist`;
	await $`tsc --build tsconfig.build.json`;

	const flags = ["--bundle", "--platform=node"];

	await $`esbuild src/cjs/index.cjs --outfile=dist/index.cjs ${flags}`;
	await $`esbuild src/index.ts --format=esm --outfile=dist/index.mjs ${flags}`;
}

main();
