import { mockClient } from "./mock";
import { realClient } from "./real";
import type { CrefazClient } from "./types";

export function getCrefazClient(): CrefazClient {
  return process.env.CREFAZ_MODE === "real" ? realClient : mockClient;
}

export * from "./types";
