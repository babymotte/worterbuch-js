import { connect } from "../index";

connect("ws://localhost:8080/ws").then(async (wb) => {
  wb.onclose = () => console.log("connection closed");

  wb.set("hello/there", 123);
  wb.set("hello/world", 123);
  wb.set("hello/you", 123);

  wb.lsAsync("hello", console.log);
  wb.lsAsync(undefined, console.log);

  let children = await wb.ls("hello");
  console.log(children);
  children = await wb.ls();
  console.log(children);

  wb.close();
});
