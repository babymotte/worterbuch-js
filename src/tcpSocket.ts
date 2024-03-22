import net from "net";
import rl from "readline";
import { CloseEvent, Socket } from "./socket";
import { log } from "console";

export function connect(
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

  setTimeout(() => {
    const client = new net.Socket();
    console.log(`Connecting to TCP socket ${host}:${port} …`);
    client.connect(port, host, () => socket.onopen());
    emitLines(client);
    client.on("line", (line) => socket.onmessage(line));
    client.on("close", () => socket.onclose());
    client.on("error", (e) => socket.onerror(e));
    socket.send = (line: string) => client.write(line + "\n");
    socket.close = () => client.destroy();
    socket.isClosed = () => client.destroyed;
  }, 0);

  return socket;
}

function emitLines(stream: net.Socket) {
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
