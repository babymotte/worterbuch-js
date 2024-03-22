export type Socket = {
  onopen: (e?: Event) => void;
  onmessage: (msg: string) => void | Promise<void>;
  onerror: (e?: Event | Error) => void;
  onclose: (e?: CloseEvent) => void;
  send: (msg: string) => void;
  close: () => void;
  isClosed: () => boolean;
};

export type CloseEvent = {
  code: number;
  reason: string;
};
