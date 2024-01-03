import { connect } from "./util";

async function main() {
  try {
    const wb = await connect();
    wb.subscribe("hello/world", console.log);
  } catch (err: any) {
    console.error(err);
  }
}

main();
