import { Worterbuch } from "../index";
import { sleep, connect } from "./util";

async function main() {
  const wb = await connect();

  wb.pDelete("hello/#");

  wb.set("hello", "world");

  await subUnsub(wb);
  await subUnsub(wb);
  await subUnsub(wb);
  await subUnsub(wb);
  await subUnsub(wb);

  wb.close();
}

async function subUnsub(wb: Worterbuch) {
  await sleep(1);
  console.log("subscribing");
  let sid = wb.subscribe("hello", console.log);

  await sleep(1);
  console.log("unsubscribing");
  wb.unsubscribe(sid);
}

main();
