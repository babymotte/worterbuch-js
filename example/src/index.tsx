import React from "react";
import ReactDOM from "react-dom/client";
import { connect } from "worterbuch-js";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function App() {
  const [set, setSet] = React.useState<string | undefined>("");
  const [deleted, setDeleted] = React.useState<string | undefined>("");

  React.useEffect(() => {
    const wb = connect("ws://localhost:8080/ws");
    wb.onwserror = console.log;
    wb.onerror = console.log;
    wb.onhandshake = () => {
      wb.subscribe("hello/world", (e) => {
        if (e.value) {
          setSet(e.value);
          setDeleted(undefined);
        }
        if (e.deleted) {
          setSet(undefined);
          setDeleted(e.deleted);
          console.log(e.deleted);
        }
      });
    };
    setInterval(() => wb.set("hello/world", "Hello, there!"), 2000);
    setTimeout(() => setInterval(() => wb.pDel("hello/#"), 2000), 1000);
  }, []);

  return (
    <>
      <p>Set: {set}</p>
      <p>Deleted: {deleted}</p>
    </>
  );
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
