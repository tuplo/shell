/* eslint-disable no-console */
import type { RequestOptions } from "node:http";
import https from "node:https";

import { fetch } from "./fetch";
import { sleep } from "./sleep";

interface IWaitForUrlArgs {
  protocol: string;
  hostname?: string;
  port: number;
  pathname: string;
  auth: string;
  url: string;
}

export async function waitForUrl(
  args: Partial<IWaitForUrlArgs>
): Promise<void> {
  const {
    protocol = "http",
    hostname = "127.0.0.1",
    port,
    pathname,
    auth,
  } = args;
  const url = new URL(args?.url || [protocol, hostname].join("://"));
  if (port) {
    url.port = port.toString();
  }

  if (pathname) {
    url.pathname = pathname;
  }

  const requestOptions: RequestOptions = { headers: {} };

  if (auth) {
    const bearer = Buffer.from(auth).toString("base64");
    requestOptions.headers = {
      ...requestOptions.headers,
      Authorization: `Basic ${bearer}`,
    };
  }

  if (protocol === "https") {
    requestOptions.agent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  console.log(`Waiting for ${url.href}...`);

  try {
    await fetch(url.href, requestOptions);
    return undefined;
  } catch (e) {
    await sleep(2_000);
    return waitForUrl(args);
  }
}
