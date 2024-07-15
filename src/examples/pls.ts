import { connect } from "./util";

async function main() {
  const wb = await connect();

  wb.onclose = () => console.log("connection closed");

  console.log(await wb.pLs("$SYS"));
  console.log(await wb.pLs("$SYS/?/?"));

  wb.close();
}

main();
