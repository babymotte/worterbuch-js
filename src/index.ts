import WebSocket from "isomorphic-ws";
import { v4 as uuidv4 } from "uuid";

export type Key = string;
export type RequestPattern = string;
export type RequestPatterns = RequestPattern[];
export type Value = any;
export type Children = string[];
export type TransactionID = number;
export type SubscriptionID = string;
export type KeyValuePair = { key: Key; value: Value };
export type KeyValuePairs = KeyValuePair[];
export type ProtocolVersion = { major: number; minor: number };
export type ProtocolVersions = ProtocolVersion[];
export type ErrorCode = number;
export type StateEvent = { value?: Value; deleted?: Value };
export type PStateEvent = {
  keyValuePairs?: KeyValuePairs;
  deleted?: KeyValuePairs;
};
export type LsEvent = {
  children: Children;
};
export type StateCallback = (event: StateEvent) => void;
export type PStateCallback = (event: PStateEvent) => void;
export type LsCallback = (event: LsEvent) => void;
export type Ack = { transactionId: TransactionID };
export type State = {
  transactionId: TransactionID;
  keyValue: KeyValuePair | undefined;
  deleted: KeyValuePair | undefined;
};
export type PState = {
  transactionId: TransactionID;
  requestPattern: RequestPattern;
  keyValuePairs: KeyValuePairs | undefined;
  deleted: KeyValuePairs | undefined;
};
export type LsState = { transactionId: TransactionID; children: Children };
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
export type Get = { transactionId: number; key: string };
export type PGet = { transactionId: number; requestPattern: string };
export type Del = { transactionId: number; key: string };
export type PDel = { transactionId: number; requestPattern: string };
export type Subscribe = {
  transactionId: number;
  key: string;
  unique?: boolean;
};
export type PSubscribe = {
  transactionId: number;
  requestPattern: string;
  unique?: boolean;
};
export type Unsubscribe = {
  transactionId: number;
};
export type Ls = {
  transactionId: number;
  parent: string;
};
export type SubscribeLs = {
  transactionId: number;
  parent: string;
};
export type UnsubscribeLs = {
  transactionId: number;
};
export type AckMsg = { ack: Ack };
export type StateMsg = { state: State };
export type PStateMsg = { pState: PState };
export type ErrMsg = { err: Err };
export type HandshakeMsg = { handshake: Handshake };
export type LsStateMsg = {
  lsState: LsState;
};
export type HandshakeRequestMsg = { handshakeRequest: HandshakeRequest };
export type SetMsg = {
  set: { transactionId: number; key: string; value: Value };
};
export type PubMsg = {
  publish: { transactionId: number; key: string; value: Value };
};
export type GetMsg = {
  get: Get;
};
export type PGetMsg = {
  pGet: PGet;
};
export type DelMsg = {
  delete: Del;
};
export type PDelMsg = {
  pDelete: PDel;
};
export type SubMsg = {
  subscribe: Subscribe;
};
export type PSubMsg = {
  pSubscribe: PSubscribe;
};
export type UnsubMsg = {
  unsubscribe: Unsubscribe;
};
export type LsMsg = {
  ls: Ls;
};
export type SubscribeLsMsg = {
  subscribeLs: SubscribeLs;
};
export type UnsubscribeLsMsg = {
  unsubscribeLs: UnsubscribeLs;
};
export type ServerMessage =
  | AckMsg
  | StateMsg
  | PStateMsg
  | ErrMsg
  | HandshakeMsg
  | LsStateMsg;
export type ClientMessage =
  | HandshakeRequestMsg
  | SetMsg
  | PubMsg
  | GetMsg
  | PGetMsg
  | DelMsg
  | PDelMsg
  | SubMsg
  | PSubMsg
  | UnsubMsg
  | LsMsg
  | SubscribeLsMsg
  | UnsubscribeLsMsg;

export type Connection = {
  getValue: (key: Key) => Promise<Value>;
  pGetValues: (requestPattern: RequestPattern) => Promise<KeyValuePairs>;
  get: (key: Key, callback?: StateCallback) => TransactionID;
  pGet: (
    requestPattern: RequestPattern,
    callback?: PStateCallback
  ) => TransactionID;
  del: (key: Key, callback?: StateCallback) => TransactionID;
  pDel: (
    requestPattern: RequestPattern,
    callback?: PStateCallback
  ) => TransactionID;
  set: (key: Key, value: Value) => TransactionID;
  publish: (key: Key, value: Value) => TransactionID;
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
  ls: (parent: string, callback?: LsCallback) => void;
  subscribeLs: (parent: string, callback?: LsCallback) => SubscriptionID;
  unsubscribeLs: (subscriptionID: SubscriptionID) => void;
  close: () => void;
  onopen?: (event: Event) => any;
  onclose?: (event: CloseEvent) => any;
  onerror?: (event: Err) => any;
  onwserror?: (event: Event) => any;
  onmessage?: (msg: ServerMessage) => any;
  onhandshake?: (handshake: Handshake) => any;
  separator: string;
  wildcard: string;
  multiWildcard: string;
};

export function connect(
  address: string,
  lastWill?: KeyValuePairs,
  graveGoods?: Key[]
) {
  console.log("Connecting to Worterbuch server " + address + " …");

  const socket = new WebSocket(address);

  const state = {
    transactionId: 1,
    connected: false,
  };

  const nextTransactionId = () => {
    return state.transactionId++;
  };

  const pendingStatePromises = new Map<
    number,
    {
      resolve: (value: Value | undefined) => void;
      reject: (reason?: any) => void;
    }
  >();
  const pendingLsPromises = new Map<
    number,
    {
      resolve: (children: Children) => void;
      reject: (reason?: any) => void;
    }
  >();
  const pendingPStatePromises = new Map<
    number,
    {
      resolve: (value: Value | undefined) => void;
      reject: (reason?: any) => void;
    }
  >();
  const pendingStates = new Map<number, StateCallback>();
  const pendingPStates = new Map<number, PStateCallback>();
  const pendingLsStates = new Map<number, LsCallback>();
  const subscriptionTransactionIDs = new Map<Key, TransactionID>();
  const psubscriptionTransactionIDs = new Map<RequestPattern, TransactionID>();
  const lssubscriptionTransactionIDs = new Map<RequestPattern, TransactionID>();
  const subscriptionIDs = new Map<SubscriptionID, TransactionID>();
  const subscriptions = new Map<
    TransactionID,
    Map<SubscriptionID, StateCallback>
  >();
  const psubscriptions = new Map<
    TransactionID,
    Map<SubscriptionID, PStateCallback>
  >();
  const lssubscriptions = new Map<
    TransactionID,
    Map<SubscriptionID, LsCallback>
  >();
  const cache = new Map<Key, Value>();

  const getValue = async (key: Key): Promise<Value> => {
    const transactionId = nextTransactionId();
    const msg = { get: { transactionId, key } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    return new Promise((resolve, reject) => {
      pendingStatePromises.set(transactionId, { resolve, reject });
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
      pendingPStatePromises.set(transactionId, { resolve, reject });
    });
  };

  const get = (key: Key, onmessage?: StateCallback): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { get: { transactionId, key } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      pendingStates.set(transactionId, onmessage);
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
      pendingPStates.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const del = (key: Key, onmessage?: StateCallback): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { delete: { transactionId, key } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      pendingStates.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const pDel = (
    requestPattern: RequestPattern,
    onmessage?: PStateCallback
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { pDelete: { transactionId, requestPattern } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (onmessage) {
      pendingPStates.set(transactionId, onmessage);
    }
    return transactionId;
  };

  const set = (key: Key, value: Value): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { set: { transactionId, key, value } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    return transactionId;
  };

  const publish = (key: Key, value: Value): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { publish: { transactionId, key, value } };
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
          onmessage({ value: cached });
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
        const listeners = psubscriptions.get(existingTransactionID);
        listeners?.set(subscriptionID, onmessage);
        const cached: KeyValuePairs = [];
        cache.forEach((value, key) => {
          if (matches(key, requestPattern, connection)) {
            cached.push({ key, value });
          }
        });
        onmessage({ keyValuePairs: cached });
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
        psubscriptions.set(transactionId, listeners);
      }
    }

    return subscriptionID;
  };

  const unsubscribe = (subscriptionID: SubscriptionID) => {
    const transactionId = subscriptionIDs.get(subscriptionID);
    if (!transactionId) {
      return;
    }
    subscriptionIDs.delete(subscriptionID);

    const listeners = subscriptions.get(transactionId);
    if (listeners) {
      listeners.delete(subscriptionID);
    }

    const plisteners = psubscriptions.get(transactionId);
    if (plisteners) {
      plisteners.delete(subscriptionID);
    }

    const msg = {
      unsubscribe: { transactionId },
    };
    const buf = encode_client_message(msg);
    socket.send(buf);
  };

  const ls = (parent: string, callback?: LsCallback): Promise<Children> => {
    const transactionId = nextTransactionId();
    const msg = { ls: { transactionId, parent } };
    const buf = encode_client_message(msg);
    socket.send(buf);
    if (callback) {
      pendingLsStates.set(transactionId, callback);
    }
    return new Promise((resolve, reject) => {
      pendingLsPromises.set(transactionId, { resolve, reject });
    });
  };

  const subscribeLs = (
    parent: string,
    onmessage?: LsCallback
  ): SubscriptionID => {
    const subscriptionID = uuidv4();
    const existingTransactionID = lssubscriptionTransactionIDs.get(parent);
    if (existingTransactionID) {
      subscriptionIDs.set(subscriptionID, existingTransactionID);
      if (onmessage) {
        const listeners = lssubscriptions.get(existingTransactionID);
        listeners?.set(subscriptionID, onmessage);
      }
    } else {
      const transactionId = nextTransactionId();
      lssubscriptionTransactionIDs.set(parent, transactionId);
      subscriptionIDs.set(subscriptionID, transactionId);
      const msg = {
        subscribeLs: { transactionId, parent },
      };
      const buf = encode_client_message(msg);
      socket.send(buf);
      if (onmessage) {
        const listeners = new Map();
        listeners.set(subscriptionID, onmessage);
        lssubscriptions.set(transactionId, listeners);
      }
    }

    return subscriptionID;
  };

  const unsubscribeLs = (subscriptionID: SubscriptionID) => {
    const transactionId = subscriptionIDs.get(subscriptionID);
    if (!transactionId) {
      return;
    }
    subscriptionIDs.delete(subscriptionID);

    const listeners = lssubscriptions.get(transactionId);
    if (listeners) {
      listeners.delete(subscriptionID);
    }

    const msg = {
      unsubscribeLs: { transactionId },
    };
    const buf = encode_client_message(msg);
    socket.send(buf);
  };

  const close = () => socket.close();

  const connection: Connection = {
    getValue,
    pGetValues,
    get,
    pGet,
    del,
    pDel,
    set,
    publish,
    subscribe,
    pSubscribe,
    unsubscribe,
    ls,
    subscribeLs,
    unsubscribeLs,
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
        supportedProtocolVersions: [{ major: 0, minor: 6 }],
        lastWill: lastWill || [],
        graveGoods: graveGoods || [],
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
    if (connection.onwserror) {
      connection.onwserror(e);
    }
  };

  const processStateMsg = (msg: StateMsg) => {
    const { transactionId, keyValue, deleted } = msg.state;

    if (keyValue) {
      cache.set(keyValue.key, keyValue.value);
    }

    if (deleted) {
      cache.delete(deleted.key);
    }

    const pendingPromise = pendingStatePromises.get(transactionId);
    if (pendingPromise) {
      pendingStatePromises.delete(transactionId);
      pendingPromise.resolve(keyValue?.value);
    }

    const event = keyValue
      ? { value: keyValue.value }
      : deleted
      ? { deleted: deleted.value }
      : undefined;

    if (event) {
      const pending = pendingStates.get(transactionId);
      if (pending) {
        pendingStates.delete(transactionId);
        pending(event);
      }

      const subscription = subscriptions.get(transactionId);
      if (subscription) {
        subscription.forEach((onState) => onState(event));
      }
    }
  };

  const processLsStateMsg = (msg: LsStateMsg) => {
    const { transactionId, children } = msg.lsState;

    const pendingPromise = pendingLsPromises.get(transactionId);
    if (pendingPromise) {
      pendingLsPromises.delete(transactionId);
      pendingPromise.resolve(children);
    }

    const event = { children };

    if (event) {
      const pending = pendingLsStates.get(transactionId);
      if (pending) {
        pendingLsStates.delete(transactionId);
        pending(event);
      }

      const subscription = lssubscriptions.get(transactionId);
      if (subscription) {
        subscription.forEach((onState) => onState(event));
      }
    }
  };

  const processPStateMsg = (msg: PStateMsg) => {
    const transactionId = msg.pState.transactionId;
    const keyValuePairs = msg.pState.keyValuePairs;
    const deleted = msg.pState.deleted;

    if (keyValuePairs) {
      keyValuePairs.forEach(({ key, value }) => cache.set(key, value));
    }

    if (deleted) {
      deleted.forEach(({ key }) => cache.delete(key));
    }

    const pendingPromise = pendingPStatePromises.get(transactionId);
    if (pendingPromise) {
      pendingPStatePromises.delete(transactionId);
      pendingPromise.resolve(keyValuePairs);
    }

    const event = keyValuePairs
      ? { keyValuePairs }
      : deleted
      ? { deleted }
      : undefined;

    if (event) {
      const pending = pendingPStates.get(transactionId);
      if (pending) {
        pendingPStates.delete(transactionId);
        pending(event);
      }

      const subscription = psubscriptions.get(transactionId);
      if (subscription) {
        subscription.forEach((onPState) => onPState(event));
      }
    }
  };

  const processErrMsg = (msg: ErrMsg) => {
    const transactionId = msg.err.transactionId;
    const pendingStatePromise = pendingStatePromises.get(transactionId);
    if (pendingStatePromise) {
      pendingStatePromises.delete(transactionId);
      pendingStatePromise.reject(msg.err);
    }
    const pendingPStatePromise = pendingPStatePromises.get(transactionId);
    if (pendingPStatePromise) {
      pendingPStatePromises.delete(transactionId);
      pendingPStatePromise.reject(msg.err);
    }
    if (connection.onerror) {
      connection.onerror(msg.err);
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
    const msg: ServerMessage = decode_server_message(e.data);

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
    } else if ((<LsStateMsg>msg).lsState) {
      processLsStateMsg(<LsStateMsg>msg);
    }
  };

  return connection;
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

function encode_client_message(msg: ClientMessage): string {
  return JSON.stringify(msg);
}

function decode_server_message(msg: string): ServerMessage {
  return JSON.parse(msg);
}
