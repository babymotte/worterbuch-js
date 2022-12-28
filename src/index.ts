import wbjsinit, {
  encode_client_message,
  decode_server_message,
} from "worterbuch-wasm";
import WebSocket from "isomorphic-ws";
import { v4 as uuidv4 } from "uuid";

export type Key = string;
export type RequestPattern = string;
export type RequestPatterns = RequestPattern[];
export type Value = any;
export type TransactionID = number;
export type SubscriptionID = string;
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
  ) => SubscriptionID;
  pSubscribe: (
    requestPattern: RequestPattern,
    callback?: PStateCallback,
    unique?: boolean
  ) => SubscriptionID;
  unsubscribe: (subscriptionID: SubscriptionID) => void;
  close: () => void;
  onopen?: (event: Event) => any;
  onclose?: (event: CloseEvent) => any;
  onerror?: (event: Event) => any;
  onmessage?: (msg: ServerMessage) => any;
  onhandshake?: (handshake: Handshake) => any;
  preSubscribe: (
    pattern: RequestPattern,
    onsubscribed?: (progress: [number, number]) => void
  ) => void;
  separator: string;
  wildcard: string;
  multiWildcard: string;
};

export async function wbinit() {
  return wbjsinit();
}

export function connect(address: string, json?: boolean) {
  console.log("Connecting to Worterbuch server " + address + " …");
  if (json) {
    console.log("Using JSON serde.");
  } else {
    console.log("Not using JSON serde.");
  }
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
  const subscriptionTransactionIDs = new Map<Key, TransactionID>();
  const psubscriptionTransactionIDs = new Map<RequestPattern, TransactionID>();
  const subscriptionIDs = new Map<SubscriptionID, TransactionID>();
  const subscriptions = new Map<
    TransactionID,
    Map<SubscriptionID, StateCallback>
  >();
  const psubscriptions = new Map<
    TransactionID,
    Map<SubscriptionID, PStateCallback>
  >();
  const cache = new Map<Key, Value>();

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
  ): SubscriptionID => {
    const subscriptionID = uuidv4();
    const existingTransactionID = subscriptionTransactionIDs.get(key);
    if (existingTransactionID) {
      subscriptionIDs.set(subscriptionID, existingTransactionID);
      if (onmessage) {
        const listeners = subscriptions.get(existingTransactionID);
        listeners?.set(subscriptionID, onmessage);
        const cached = cache.get(key);
        if (cached) {
          onmessage(cached);
        }
      }
    } else {
      const transactionId = nextTransactionId();
      subscriptionTransactionIDs.set(key, transactionId);
      subscriptionIDs.set(subscriptionID, transactionId);
      const msg = {
        subscribe: { transactionId, key, unique: unique || false },
      };
      const buf = encode_client_message(msg);
      socket.send(buf);
      if (onmessage) {
        const listeners = new Map();
        listeners.set(subscriptionID, onmessage);
        subscriptions.set(transactionId, listeners);
      }
    }

    return subscriptionID;
  };

  const pSubscribe = (
    requestPattern: RequestPattern,
    onmessage?: PStateCallback,
    unique?: boolean
  ): SubscriptionID => {
    const subscriptionID = uuidv4();
    const existingTransactionID =
      psubscriptionTransactionIDs.get(requestPattern);
    if (existingTransactionID) {
      subscriptionIDs.set(subscriptionID, existingTransactionID);
      if (onmessage) {
        const listeners = subscriptions.get(existingTransactionID);
        listeners?.set(subscriptionID, onmessage);
        const cached: KeyValuePairs = [];
        cache.forEach((value, key) => {
          if (matches(key, requestPattern, connection)) {
            cached.push({ key, value });
          }
        });
        onmessage(cached);
      }
    } else {
      const transactionId = nextTransactionId();
      psubscriptionTransactionIDs.set(requestPattern, transactionId);
      subscriptionIDs.set(subscriptionID, transactionId);
      const msg = {
        pSubscribe: { transactionId, requestPattern, unique: unique || false },
      };
      const buf = encode_client_message(msg);
      socket.send(buf);
      if (onmessage) {
        const listeners = new Map();
        listeners.set(subscriptionID, onmessage);
        subscriptions.set(transactionId, listeners);
      }
    }

    return subscriptionID;
  };

  const unsubscribe = (subscriptionID: SubscriptionID) => {
    const transactionID = subscriptionIDs.get(subscriptionID);
    if (!transactionID) {
      return;
    }
    subscriptionIDs.delete(subscriptionID);

    const listeners = subscriptions.get(transactionID);
    if (listeners) {
      listeners.delete(subscriptionID);
    }

    const plisteners = psubscriptions.get(transactionID);
    if (plisteners) {
      plisteners.delete(subscriptionID);
    }
  };

  const preSubscribe = (
    pattern: RequestPattern,
    onsubscribed?: (progress: [number, number]) => void
  ) => {
    pGet(pattern, (values: KeyValuePairs) => {
      const pending = new Set();
      const total = values.length;
      values.forEach(({ key, value }) => {
        pending.add(key);
        subscribe(key, (val) => {
          if (onsubscribed && pending.delete(key)) {
            const done = total - pending.size;
            onsubscribed([done, total]);
          }
        });
      });
    });
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
    preSubscribe,
    close,
    separator: "/",
    wildcard: "?",
    multiWildcard: "#",
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
    console.log("Connection to server closed.");
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
      keyValue: { key, value: rawValue },
    } = msg.state;
    const value = json ? parse(rawValue) : rawValue;

    cache.set(key, value);

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
      subscription.forEach((onState) => onState(value));
    }
  };

  const processPStateMsg = (msg: PStateMsg) => {
    const { transactionId, keyValuePairs } = msg.pState;

    const processedKeyValuePairs = keyValuePairs.map(({ key, value }) => {
      return { key, value: json ? parse(value) : value };
    });

    processedKeyValuePairs.forEach(({ key, value }) => cache.set(key, value));

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
      subscription.forEach((onPState) => onPState(processedKeyValuePairs));
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
      connection.separator = msg.handshake.separator;
      connection.wildcard = msg.handshake.wildcard;
      connection.multiWildcard = msg.handshake.multiWildcard;
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
      return undefined;
    }
  }

  return undefined;
}

function matches(key: string, pattern: string, connection: Connection) {
  const keySplit = key.split(connection.separator);
  const patternSplit = pattern.split(connection.separator);

  if (patternSplit.length > keySplit.length) {
    return false;
  }

  if (
    keySplit.length > patternSplit.length &&
    patternSplit[patternSplit.length - 1] !== connection.multiWildcard
  ) {
    return false;
  }

  for (let i = 0; i < patternSplit.length; i++) {
    if (patternSplit[i] === connection.wildcard) {
      continue;
    }
    if (patternSplit[i] === connection.multiWildcard) {
      return i === patternSplit.length - 1;
    }
    if (patternSplit[i] !== keySplit[i]) {
      return false;
    }
  }

  return true;
}
