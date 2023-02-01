import React from "react";
import ReactDOM from "react-dom/client";
import { connect } from "worterbuch-js";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function App() {
  const [helloWorld, setHelloWorld] = React.useState("");

  React.useEffect(() => {
    const wb = connect("ws://localhost:8080/ws");
    wb.onwserror = console.log;
    wb.onerror = console.log;
    wb.onhandshake = () => {
      wb.subscribe("hello/world", setHelloWorld);
    };
  }, []);

  return <>{helloWorld}</>;
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
