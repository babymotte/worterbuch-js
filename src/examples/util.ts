import { connect as connectWB } from "../index";

export async function connect() {
  return await connectWB("tcp://localhost:8081/ws", "1234");
}

export async function sleep(seconds: number) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}
