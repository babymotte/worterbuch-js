import { connect } from "../index";
import { sleep } from "./util";

const wb = connect("ws://localhost:8080/ws").then(async (wb) => {
  wb.pDelete("hello/#");

  let sid = wb.subscribeLs("hello", console.log);

  await sleep(1);
  wb.set("hello/there", 123);
  await sleep(1);
  wb.set("hello/world", 123);
  await sleep(1);
  wb.set("hello/you", 123);
  await sleep(1);
  wb.pDelete("hello/#");
  await sleep(1);
  wb.unsubscribeLs(sid);
  wb.set("hello/you", 123);
  await sleep(1);

  wb.close();
});
