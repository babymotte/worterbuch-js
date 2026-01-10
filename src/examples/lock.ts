import { connect } from "./util";

async function main() {
  let wb1, wb2;
  try {
    wb1 = await connect();
    wb2 = await connect();
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  console.log("wb1 acquiring lock ...");
  wb1.locked("test/key", async () => {
    console.log("wb1 acquired lock");
    await new Promise((r) => setTimeout(r, 3000));
    setTimeout(() => wb1.close(), 1000);
    console.log("wb1 releasing lock");
  });

  setTimeout(() => {
    console.log("wb2 acquiring lock ...");
    wb2.locked("test/key", async () => {
      console.log("wb2 acquired lock");
      await new Promise((r) => setTimeout(r, 3000));
      setTimeout(() => wb2.close(), 1000);
      console.log("wb2 releasing lock");
    });
  }, 500);
}

main();
