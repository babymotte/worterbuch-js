import { connect } from "../index";

const wb = connect("ws://localhost:8080/ws");

wb.onhandshake = async () => {
  wb.pDel("hello/#");

  let sid = wb.subscribeLs("hello", console.log);

  await new Promise((r) => setTimeout(r, 1000));
  wb.set("hello/there", 123);
  await new Promise((r) => setTimeout(r, 1000));
  wb.set("hello/world", 123);
  await new Promise((r) => setTimeout(r, 1000));
  wb.set("hello/you", 123);
  await new Promise((r) => setTimeout(r, 1000));
  wb.pDel("hello/#");
  await new Promise((r) => setTimeout(r, 1000));
  wb.unsubscribeLs(sid);
  wb.set("hello/you", 123);
  await new Promise((r) => setTimeout(r, 1000));

  wb.close();
};
