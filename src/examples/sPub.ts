import { connect, sleep } from "./util";

async function main() {
  const wb = await connect();

  wb.onclose = () => console.log("connection closed");

  let pubTid = await wb.sPubInit("hello/world");

  for (let i = 0; i < 100; i++) {
    await sleep(0.01);
    wb.sPub(pubTid, i);
  }

  await new Promise((res) => setTimeout(res, 100));

  wb.close();
}

main();
