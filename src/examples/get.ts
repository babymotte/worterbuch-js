import { connect } from "./util";

async function main() {
  let wb;
  try {
    wb = await connect();
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  wb.set("hello", "world");

  wb.get("hello").then(console.log);
  wb.get("hello/doesnt/exist").then(console.log).catch(console.error);

  let value = await wb.get("hello");
  console.log(value);

  value = await wb.get("hello/doesnt/exist");
  console.log(value);

  wb.close();
}

main();
