import wbjsinit, {
  encode_client_message,
  decode_server_message,
} from "worterbuch-wasm";
import WebSocket from "isomorphic-ws";

export type Key = string;
export type RequestPattern = string;
export type RequestPatterns = RequestPattern[];
export type Value = any;
export type TransactionID = number;
export type KeyValuePair = { key: Key; value: Value };
export type KeyValuePairs = KeyValuePair[];
export type ProtocolVersion = { major: number; minor: number };
export type ProtocolVersions = ProtocolVersion[];
export type ErrorCode = number;
export type StateCallback = (value: Value) => void;
export type PStateCallback = (values: KeyValuePairs) => void;
export type Ack = { transactionId: TransactionID };
export type State = { transactionId: TransactionID; keyValue: KeyValuePair };
export type PState = {
  transactionId: TransactionID;
  requestPattern: RequestPattern;
  keyValuePairs: KeyValuePairs;
};
export type Err = {
  transactionId: TransactionID;
  errorCode: ErrorCode;
  metaData: any;
};
export type HandshakeRequest = {
  supportedProtocolVersions: ProtocolVersions;
  lastWill: KeyValuePairs;
  graveGoods: RequestPatterns;
};
export type Handshake = {
  protocolVersion: ProtocolVersion;
  separator: string;
  wildcard: string;
  multiWildcard: string;
};
export type AckMsg = { ack: Ack };
export type StateMsg = { state: State };
export type PStateMsg = { pState: PState };
export type ErrMsg = { err: Err };
export type HandshakeMsg = { handshake: Handshake };
export type HandshakeRequestMsg = { handshakeRequest: HandshakeRequest };
export type ServerMessage =
  | AckMsg
  | StateMsg
  | PStateMsg
  | ErrMsg
  | HandshakeMsg;

export type Connection = {
  getValue: (key: Key) => Promise<Value>;
  pGetValues: (requestPattern: RequestPattern) => Promise<KeyValuePairs>;
  get: (key: Key, callback?: StateCallback) => TransactionID;
  pGet: (
    requestPattern: RequestPattern,
    callback?: PStateCallback
  ) => TransactionID;
  set: (key: Key, value: Value) => TransactionID;
  subscribe: (
    key: Key,
    callback?: StateCallback,
    unique?: boolean
  ) => TransactionID;
  pSubscribe: (
    requestPattern: RequestPattern,
    callback?: PStateCallback,
    unique?: boolean
  ) => TransactionID;
  unsubscribe: (transactionId: TransactionID) => TransactionID;
  close: () => void;
  onopen?: (event: Event) => any;
  onclose?: (event: CloseEvent) => any;
  onerror?: (event: Event) => any;
  onmessage?: (msg: ServerMessage) => any;
  onhandshake?: (handshake: Handshake) => any;
};

export async function wbinit() {
  return wbjsinit();
}

export function connect(address: string, json?: boolean) {
  const socket = new WebSocket(address);

  const state = {
    transactionId: 1,
    connected: false,
  };

  const nextTransactionId = () => {
    return state.transactionId++;
  };

  const pendingPromises = new Map();
  const pendings = new Map();
  const subscriptions = new Map();

  const getValue = async (key: Key): Promise<Value> => {
    const transactionId = nextTransactionId();
    const msg = { get: { transactionId, key } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    return new Promise((resolve, reject) => {
      pendingPromises.set(transactionId, { resolve, reject });
    });
  };

  const pGetValues = async (
    requestPattern: RequestPattern
  ): Promise<KeyValuePairs> => {
    const transactionId = nextTransactionId();
    const msg = { pGet: { transactionId, requestPattern } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    return new Promise((resolve, reject) => {
      pendingPromises.set(transactionId, { resolve, reject });
    });
  };

  const get = (key: Key, onmessage?: StateCallback): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { get: { transactionId, key } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      pendings.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const pGet = (
    requestPattern: RequestPattern,
    onmessage?: PStateCallback
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { pGet: { transactionId, requestPattern } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      pendings.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const set = (key: Key, value: Value): TransactionID => {
    const stringValue = json ? JSON.stringify(value) : value;
    const transactionId = nextTransactionId();
    const msg = { set: { transactionId, key, value: stringValue } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    return transactionId;
  };

  const subscribe = (
    key: Key,
    onmessage?: StateCallback,
    unique?: boolean
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { subscribe: { transactionId, key, unique: unique || false } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      subscriptions.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const pSubscribe = (
    requestPattern: RequestPattern,
    onmessage?: PStateCallback,
    unique?: boolean
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = {
      pSubscribe: { transactionId, requestPattern, unique: unique || false },
    };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      subscriptions.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const unsubscribe = (transactionId: TransactionID): TransactionID => {
    const msg = { unsubscribe: { transactionId } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    return transactionId;
  };

  const close = () => socket.close();

  const connection: Connection = {
    getValue,
    pGetValues,
    get,
    pGet,
    set,
    subscribe,
    pSubscribe,
    unsubscribe,
    close,
  };

  socket.onopen = (e: Event) => {
    console.log("Connected to server.");
    state.connected = true;
    if (connection.onopen) {
      connection.onopen(e);
    }
    const handshake = {
      handshakeRequest: {
        supportedProtocolVersions: [{ major: 0, minor: 2 }],
        lastWill: [],
        graveGoods: [],
      },
    };
    const buf = encode_client_message(handshake);
    socket.send(buf);
  };

  socket.onclose = (e: CloseEvent) => {
    state.connected = false;
    if (connection.onclose) {
      connection.onclose(e);
    }
  };

  socket.onerror = (e: Event) => {
    if (connection.onerror) {
      connection.onerror(e);
    }
  };

  const processStateMsg = (msg: StateMsg) => {
    const {
      transactionId,
      keyValue: { value: rawValue },
    } = msg.state;
    const value = json ? parse(rawValue) : rawValue;

    const pendingPromise = pendingPromises.get(transactionId);
    if (pendingPromise) {
      pendingPromises.delete(transactionId);
      pendingPromise.resolve(value);
    }

    const pending = pendings.get(transactionId);
    if (pending) {
      pendings.delete(transactionId);
      pending(value);
    }

    const subscription = subscriptions.get(transactionId);
    if (subscription) {
      subscription(value);
    }
  };

  const processPStateMsg = (msg: PStateMsg) => {
    const { transactionId, keyValuePairs } = msg.pState;

    const processedKeyValuePairs = keyValuePairs.map(({ key, value }) => {
      return { key, value: json ? parse(value) : value };
    });

    const pendingPromise = pendingPromises.get(transactionId);
    if (pendingPromise) {
      pendingPromises.delete(transactionId);
      pendingPromise.resolve(processedKeyValuePairs);
    }

    const pending = pendings.get(transactionId);
    if (pending) {
      pendings.delete(transactionId);
      pending(processedKeyValuePairs);
    }

    const subscription = subscriptions.get(transactionId);
    if (subscription) {
      subscription(processedKeyValuePairs);
    }
  };

  const processErrMsg = (msg: ErrMsg) => {
    const transactionId = msg.err.transactionId;
    const pendingPromise = pendingPromises.get(transactionId);
    if (pendingPromise) {
      pendingPromises.delete(transactionId);
      pendingPromise.reject(msg.err);
    }
  };

  const processHandshakeMsg = (msg: HandshakeMsg) => {
    if (connection.onhandshake) {
      connection.onhandshake(msg.handshake);
    }
  };

  socket.onmessage = async (e: MessageEvent) => {
    const buf = await e.data.arrayBuffer();
    const uint8View = new Uint8Array(buf);
    const msg: ServerMessage = decode_server_message(uint8View);
    if (connection.onmessage) {
      connection.onmessage(msg);
    }
    if ((<StateMsg>msg).state) {
      processStateMsg(<StateMsg>msg);
    } else if ((<PStateMsg>msg).pState) {
      processPStateMsg(<PStateMsg>msg);
    } else if ((<ErrMsg>msg).err) {
      processErrMsg(<ErrMsg>msg);
    } else if ((<HandshakeMsg>msg).handshake) {
      processHandshakeMsg(<HandshakeMsg>msg);
    }
  };

  return connection;
}

function parse(value: string | undefined): undefined {
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.log("Error parsing JSON message", value, ":", e);
      return undefined;
    }
  }

  return undefined;
}
