import os from "node:os";

export async function getLocalIp() {
	const { en0 = [] } = os.networkInterfaces();
	const ipv4 = en0.find((en) => en.family === "IPv4");

	return ipv4?.address;
}
