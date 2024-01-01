import { connect as connectWB } from "../index";

export async function connect() {
  return await connectWB("ws://localhost:8080/ws", "1234");
}

export async function sleep(seconds: number) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}
