import { connect } from "../index";

const wb = connect("ws://localhost:8080/ws");

wb.onhandshake = async () => {
  wb.set("hello/there", 123);
  wb.set("hello/world", 123);
  wb.set("hello/you", 123);

  wb.ls("hello", ({ children }) => {
    console.log(children);
  });

  const children = await wb.ls("hello");
  console.log(children);

  wb.close();
};
