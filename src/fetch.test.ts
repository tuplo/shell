import { getRequestOptions } from "./fetch";

describe("fetch", () => {
	it("should return a RequestOptions object", () => {
		const url = "http://localhost:8080/foobar";
		const actual = getRequestOptions(url);

		const expected = {
			host: "localhost:8080",
			hostname: "localhost",
			method: "GET",
			path: "/foobar",
			port: 8080,
			protocol: "http:",
		};
		expect(actual).toStrictEqual(expected);
	});
});
