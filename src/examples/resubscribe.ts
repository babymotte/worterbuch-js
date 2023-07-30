import { connect } from "../index";
import { sleep } from "./util";

const wb = connect("ws://localhost:8080/ws").then(async (wb) => {
  wb.pDel("hello/#");

  let sid;

  wb.set("hello", "world");
  await sleep(1);
  sid = wb.subscribe("hello", console.log);
  await sleep(1);
  wb.unsubscribeLs(sid);
  await sleep(1);
  sid = wb.subscribe("hello", console.log);
  await sleep(1);
  wb.unsubscribeLs(sid);
  await sleep(1);
  sid = wb.subscribe("hello", console.log);
  await sleep(1);
  wb.unsubscribeLs(sid);

  wb.close();
});
