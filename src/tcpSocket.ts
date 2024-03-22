import { Stream } from "stream";
import { CloseEvent, Socket } from "./socket";

function connectReal(
  proto: string,
  host: string,
  port: number,
  path: string
): Socket {
  const socket = {
    onopen: (e?: Event) => {},
    onmessage: (msg: string) => {},
    onerror: (e?: Event | Error) => {},
    onclose: (e?: CloseEvent) => {},
    send: (msg: string) => {},
    close: () => {},
    isClosed: () => false,
  };

  const net = typeof process !== "undefined" ? "net" : "net-browserify-stub";

  import(net).then((net) => {
    const client = new net.Socket();
    console.log(`Connecting to TCP socket ${host}:${port} …`);
    client.connect(port, host, () => socket.onopen());
    emitLines(client);
    client.on("line", (line: string) => socket.onmessage(line));
    client.on("close", () => socket.onclose());
    client.on("error", (e: Error) => socket.onerror(e));
    socket.send = (line: string) => client.write(line + "\n");
    socket.close = () => client.destroy();
    socket.isClosed = () => client.destroyed;
  });

  return socket;
}

function emitLines(stream: Stream) {
  let backlog = "";
  stream.on("data", (data: Buffer) => {
    backlog += data;
    var n = backlog.indexOf("\n");
    while (n >= 0) {
      stream.emit("line", backlog.substring(0, n));
      backlog = backlog.substring(n + 1);
      n = backlog.indexOf("\n");
    }
  });
  stream.on("end", () => {
    if (backlog) {
      stream.emit("line", backlog);
    }
  });
}

function connectDummy(
  proto: string,
  host: string,
  port: number,
  path: string
): Socket {
  return {
    onopen: (e?: Event) => {},
    onmessage: (msg: string) => {},
    onerror: (e?: Event | Error) => {},
    onclose: (e?: CloseEvent) => {},
    send: (msg: string) => {},
    close: () => {},
    isClosed: () => false,
  };
}

const connect = typeof process === "object" ? connectReal : connectDummy;

export default connect;
