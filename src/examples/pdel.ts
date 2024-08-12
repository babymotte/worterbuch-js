import { connect } from "./util";

async function main() {
  let wb;
  try {
    wb = await connect();
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  wb.set("hello/world", "124");
  wb.set("hello/world/2", "987");
  wb.set("hello/world/world", "nein nein nein");
  wb.set("hello/world/nein/doch", "ooh");

  console.log(await wb.pDelete("hello/#"));

  wb.set("hello/world", "124");
  wb.set("hello/world/2", "987");
  wb.set("hello/world/world", "nein nein nein");
  wb.set("hello/world/nein/doch", "ooh");

  console.log(await wb.pDelete("hello/#", true));

  wb.close();
}

main();
