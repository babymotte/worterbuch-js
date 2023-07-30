export async function sleep(seconds: number) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}
