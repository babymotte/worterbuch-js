import { ValueObject, Worterbuch } from "..";
import { connect } from "./util";

interface MyValue extends ValueObject {
  hello: string;
}

async function main() {
  let wb: Worterbuch;
  try {
    wb = await connect();
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  // interface compatible
  const something: MyValue = {
    hello: "world",
  };
  await wb.set<MyValue>("hello", something);
  let it = await wb.get<MyValue>("hello");
  console.log(it);

  // synchronous with await and error handling:
  try {
    await wb.set("hello", "world");
    console.log("Synchronous set successful.");
  } catch (e: any) {
    console.error("Synchronous set failed:", e);
  }

  try {
    await wb.set("$SYS/private/cannot/set", "hello");
    console.log("Synchronous set successful.");
  } catch (e: any) {
    console.error("Synchronous set failed:", e);
  }

  // async with await and error handling:
  wb.set("hello", "world")
    .then(() => console.log("Asynchronous set successful."))
    .catch((e) => console.error("Synchronous set failed:", e));

  wb.set("$SYS/private/cannot/set", "hello")
    .then(() => console.log("Synchronous set successful."))
    .catch((e) => console.error("Synchronous set failed:", e));

  // async with no error handling:
  wb.set("hello", "world");
  // this should crash the program
  wb.set("$SYS/private/cannot/set", "hello");

  wb.close();
}

main();
