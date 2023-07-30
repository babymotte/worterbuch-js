import { connect } from "../index";

const wb = connect("ws://localhost:8080/ws");

wb.onopen = async () => {
  wb.set("hello", "world");

  const value = await wb.getValue("hello");
  console.log(value);

  wb.close();
};
