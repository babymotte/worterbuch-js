import { Err } from ".";

export class WbError extends Error {
  cause: Err;

  constructor(err: Err) {
    super(toErrorString(err.metadata));
    this.cause = err;
  }
}

function toErrorString(metadata: any): string {
  try {
    const parsed = JSON.parse(metadata);
    if (typeof parsed === "string") {
      return parsed;
    }
  } catch (_) {
    // ignore
  }

  return typeof metadata === "string" ? metadata : JSON.stringify(metadata);
}
