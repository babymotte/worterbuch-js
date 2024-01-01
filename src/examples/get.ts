import { connect } from "./util";

async function main() {
  const wb = await connect();

  wb.set("hello", "world");

  wb.getAsync("hello", console.log);
  wb.getAsync("hello/doesnt/exist", console.log, console.error);

  let value = await wb.get("hello");
  console.log(value);

  value = await wb.get("hello/doesnt/exist");
  console.log(value);

  wb.close();
}

main();
