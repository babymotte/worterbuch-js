import { connect, sleep } from "./util";

async function main() {
  const wb = await connect();
  const clientId = wb.clientId();

  wb.setGraveGoods(["hello/world/#"]);
  wb.setLastWill([{ key: "hello/world/this/should/still/be", value: "here" }]);

  wb.set("hello/world/this/should/be", "gone");

  console.log("graveGoods", await wb.graveGoods());
  console.log("lastWill", await wb.lastWill());
}

main();
