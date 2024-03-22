import { CloseEvent, Socket } from "./socket";
import WebSocket from "isomorphic-ws";

export default function connect(
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

  setTimeout((ws) => {
    const addr = `${proto}://${host}:${port}/${path}`;
    console.log("Connecting to WebSocket", addr, "…");
    const client = new WebSocket(addr);
    client.onopen = (e: Event) => socket.onopen(e);
    client.onmessage = (msg: MessageEvent) => {
      socket.onmessage(msg.data);
    };
    client.onerror = (e: Event) => socket.onerror(e);
    client.onclose = (e: CloseEvent) => socket.onclose(e);
    socket.send = (line: string) => client.send(line);
    socket.close = () => client.close();
    socket.isClosed = () => client.readyState === 3;
  }, 0);

  return socket;
}
