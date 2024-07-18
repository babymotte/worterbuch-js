import { connect as connectWB } from "../index";

export async function connect(authToken?: string) {
  return await connectWB("tcp://localhost:8081/ws", authToken);
}

export async function sleep(seconds: number) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}
