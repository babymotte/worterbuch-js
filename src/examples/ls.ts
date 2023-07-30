import { connect } from "../index";

const wb = connect("ws://localhost:8080/ws");

wb.onopen = async () => {
  wb.set("hello/there", 123);
  wb.set("hello/world", 123);
  wb.set("hello/you", 123);

  const value = await wb.ls("hello");
  console.log(value);

  wb.close();
};
