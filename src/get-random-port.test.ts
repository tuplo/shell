import { getRandomPort } from "./get-random-port";

describe("getRandomPort", () => {
	it("finds a free random port", async () => {
		const actual = await getRandomPort();

		expect(actual).toBeGreaterThanOrEqual(1);
		expect(actual).toBeLessThanOrEqual(65_535);
	});
});
