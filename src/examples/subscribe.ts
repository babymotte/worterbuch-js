import { connect } from "./util";

async function main() {
  const wb = await connect();
  wb.subscribe("hello/world", console.log);
}

main();
