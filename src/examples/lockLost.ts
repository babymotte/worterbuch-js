import { Worterbuch } from "..";
import { connectTo, sleep } from "./util";

async function main() {
  let wb1, wb2;
  try {
    wb1 = await connectTo("tcp://127.0.0.1:9094");
    wb2 = await connectTo("tcp://127.0.0.1:9095");
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  acquireLock(wb1, "1", "wb1");
  acquireLock(wb2, "2", "wb2");

  await sleep(0.1);

  acquireLock(wb1, "2", "wb1");
  acquireLock(wb2, "1", "wb2");
}

function acquireLock(wb: Worterbuch, key: string, name: string) {
  console.log(`${name} acquiring lock on key '${key}' …`);
  wb.acquireLock(key, () => {
    console.error(`${name} lost the lock on key '${key}'`);
    acquireLock(wb, key, name);
  }).then(() => {
    console.info(`${name} acquired the lock on key '${key}'`);
  });
}

main();
