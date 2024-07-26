import { log } from "console";
import { connect } from "./util";

async function main() {
  let wb;
  try {
    wb = await connect();
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  wb.pSubscribe(`$SYS/clients/${wb.clientId()}/subscriptions/#`, (e) =>
    console.log("subscriptions:", e)
  );

  const cached = wb.cached();

  cached.expire(1000, 3000);

  cached.set("hello", "world");

  console.log(await cached.get("hello"));

  console.log(await cached.get("hello/doesnt/exist"));
  console.log(await cached.get("hello/doesnt/exist"));
  console.log(await cached.get("hello/doesnt/exist"));

  cached.get("hello/doesnt/exist/either").then(console.log);
  cached.get("hello/doesnt/exist/either").then(console.log);
  cached.get("hello/doesnt/exist/either").then(console.log);

  console.log(await cached.get("neither/does/this"));
  cached.get("neither/does/this").then(console.log);
  cached.get("neither/does/this").then(console.log);

  const tid = cached.subscribe("hello/world", console.log);

  cached.set("hello/world", 1);
  cached.set("hello/world", 2);
  cached.set("hello/world", 3);

  cached.unsubscribe(tid);

  cached.set("hello/world", 4);
  cached.set("hello/world", 5);
  cached.set("hello/world", 6);

  console.log(await cached.get("hello/world"));

  const tid1 = cached.subscribe("test", console.log);
  const tid2 = cached.subscribe("test", console.log);
  const tid3 = cached.subscribe("test", console.log);
  const tid4 = cached.subscribe("test", console.log);
  const tid5 = cached.subscribe("test", console.log);

  cached.set("test", "hello");
  cached.delete("test");

  cached.unsubscribe(tid1);
  cached.unsubscribe(tid2);
  cached.unsubscribe(tid3);
  cached.unsubscribe(tid4);
  cached.unsubscribe(tid5);

  console.log(await cached.get("test"));

  cached.subscribe("this/stays/active", console.log);

  setTimeout(wb.close, 10000);
}

main();
