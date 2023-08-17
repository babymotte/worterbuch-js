import { Worterbuch, connect } from "../index";
import { sleep } from "./util";

const wb = connect("ws://localhost:8080/ws").then(async (wb) => {
  wb.pDelete("hello/#");

  wb.set("hello", "world");

  await subUnsub(wb);
  await subUnsub(wb);
  await subUnsub(wb);
  await subUnsub(wb);
  await subUnsub(wb);

  wb.close();
});

async function subUnsub(wb: Worterbuch) {
  await sleep(1);
  console.log("subscribing");
  let sid = wb.subscribe("hello", console.log);

  await sleep(1);
  console.log("unsubscribing");
  wb.unsubscribe(sid);
}
