import { connect as connectWB } from "../index";

export async function connect(authToken?: string) {
  const wb = await connectWB(
    ["tcp://unavailable:8081/ws", "tcp://localhost:8081/ws"],
    authToken
  );
  console.log("Connected to", wb.serverAddress);
  return wb;
}

export async function sleep(seconds: number) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}
