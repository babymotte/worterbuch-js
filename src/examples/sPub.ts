import { connect } from "./util";

async function main() {
  const wb = await connect();

  wb.onclose = () => console.log("connection closed");

  let pubTid = await wb.sPubInit("hello/world");

  console.log(pubTid);

  for (let i = 0; i < 10; i++) {
    wb.sPub(pubTid, i);
  }

  await new Promise((res) => setTimeout(res, 100));

  wb.close();
}

main();
