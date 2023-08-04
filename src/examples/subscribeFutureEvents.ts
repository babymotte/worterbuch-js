import { connect } from "../index";

async function run() {
  let sid;
  const wb = await connect("ws://localhost:8080/ws");
  wb.onclose = console.log;
  sid = wb.subscribe("hello/world", (msg, live) => {
    if (live) {
      console.log(msg);
    }
  });
}

run();
