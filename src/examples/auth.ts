import { connect } from "./util";

async function main() {
  let wb;
  try {
    wb = await connect(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MyIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo0NTE2MjM5MDIyLCJ3b3J0ZXJidWNoUHJpdmlsZWdlcyI6eyJyZWFkIjpbIiMiXSwid3JpdGUiOlsiIyJdLCJkZWxldGUiOlsiIyJdfX0.bzV4019DIltKPQ-lDQQALenJqLZc2xD23CPhibFxIVc"
    );
  } catch (err: any) {
    console.error("Could not connect:", err.message);
    return;
  }

  await wb.set("hello", "world");
  console.log(await wb.get("hello"));
  wb.close();
}

main();
