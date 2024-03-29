import { connect } from "./util";

async function main() {
  const wb = await connect();

  wb.onclose = () => console.log("connection closed");

  wb.set("hello/there", 123);
  wb.set("hello/world", 123);
  wb.set("hello/you", 123);

  wb.ls("hello").then(console.log);
  wb.ls(undefined).then(console.log);

  let children = await wb.ls("hello");
  console.log(children);
  children = await wb.ls();
  console.log(children);

  wb.close();
}

main();
