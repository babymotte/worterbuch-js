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

  console.log("hello", await cached.get("hello"));

  console.log("hello/doesnt/exist", await cached.get("hello/doesnt/exist"));
  console.log("hello/doesnt/exist", await cached.get("hello/doesnt/exist"));
  console.log("hello/doesnt/exist", await cached.get("hello/doesnt/exist"));

  cached
    .get("hello/doesnt/exist/either")
    .then((v) => console.log("hello/doesnt/exist/either", v));
  cached
    .get("hello/doesnt/exist/either")
    .then((v) => console.log("hello/doesnt/exist/either", v));
  cached
    .get("hello/doesnt/exist/either")
    .then((v) => console.log("hello/doesnt/exist/either", v));

  console.log("neither/does/this", await cached.get("neither/does/this"));
  cached
    .get("neither/does/this")
    .then((v) => console.log("neither/does/this", v));
  cached
    .get("neither/does/this")
    .then((v) => console.log("neither/does/this", v));

  const tid = cached.subscribe("hello/world", (v) =>
    console.log("sub hello/world", v)
  );

  cached.set("hello/world", 1);
  cached.set("hello/world", 2);
  cached.set("hello/world", 3);

  cached.unsubscribe(tid);

  cached.set("hello/world", 4);
  cached.set("hello/world", 5);
  cached.set("hello/world", 6);

  console.log("hello/world", await cached.get("hello/world"));

  const tid1 = cached.subscribe("test", (v) => console.log("sub test", v));
  const tid2 = cached.subscribe("test", (v) => console.log("sub test", v));
  const tid3 = cached.subscribe("test", (v) => console.log("sub test", v));
  const tid4 = cached.subscribe("test", (v) => console.log("sub test", v));
  const tid5 = cached.subscribe("test", (v) => console.log("sub test", v));

  cached.set("test", "hello");
  cached.delete("test");

  cached.unsubscribe(tid1);
  cached.unsubscribe(tid2);
  cached.unsubscribe(tid3);
  cached.unsubscribe(tid4);
  cached.unsubscribe(tid5);

  console.log(await cached.get("test"));

  cached.subscribe("this/stays/active", (v) =>
    console.log("sub this/stays/active", v)
  );

  wb.set("uncached", "value");
  cached.subscribe("uncached", (v) => console.log("sub uncached", v));

  setTimeout(wb.close, 10000);
}

main();
