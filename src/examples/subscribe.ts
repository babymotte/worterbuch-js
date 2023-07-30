import { connect } from "../index";

async function run() {
  const wb = await connect("ws://localhost:8080/ws");
  wb.onclose = console.log;
  wb.onmessage = console.log;
  wb.subscribe("hello/world", console.log);
}

run();
