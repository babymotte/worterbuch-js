/*
 * Copyright 2024 Michael Bachmann
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import WebSocket from "isomorphic-ws";
import { sha256 } from "js-sha256";

const SUPPORTED_PROTOCOL_VERSIONS = ["0.7"];

export type Key = string;
export type RequestPattern = string;
export type RequestPatterns = RequestPattern[];
export type Value = Object | Array<any> | string | number | boolean;
export type Children = string[];
export type TransactionID = number;
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

export type GetCallback = (item: Value | null) => void;
export type DeleteCallback = GetCallback;
export type PGetCallback = (items: KeyValuePairs) => void;
export type PDeleteCallback = PGetCallback;
export type StateCallback = (event: StateEvent) => void;
export type PStateCallback = (event: PStateEvent) => void;
export type LsCallback = (children: Children) => void;
export type Ack = { transactionId: TransactionID };
export type Welcome = { info: ServerInfo; clientId: string };
export type AuthenticationRequest = { authToken: string };
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
  metadata: any;
};
export type ServerInfo = {
  protocolVersion: string;
  authenticationRequired: boolean;
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
  parent?: string;
};
export type SubscribeLs = {
  transactionId: number;
  parent?: string;
};
export type UnsubscribeLs = {
  transactionId: number;
};
export type AckMsg = { ack: Ack };
export type StateMsg = { state: State };
export type PStateMsg = { pState: PState };
export type ErrMsg = { err: Err };
export type WelcomeMsg = { welcome: Welcome };
export type AuthenticatedMsg = { authenticated: Ack };
export type LsStateMsg = {
  lsState: LsState;
};
export type AuthenticationRequestMsg = {
  authenticationRequest: AuthenticationRequest;
};
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
  | WelcomeMsg
  | AuthenticatedMsg
  | LsStateMsg;
export type ClientMessage =
  | AuthenticationRequestMsg
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

export type Worterbuch = {
  get: (key: Key) => Promise<Value | null>;
  pGet: (requestPattern: RequestPattern) => Promise<KeyValuePairs>;
  delete: (key: Key) => Promise<Value | null>;
  pDelete: (requestPattern: RequestPattern) => Promise<KeyValuePairs>;
  set: (key: Key, value: Value) => TransactionID;
  publish: (key: Key, value: Value) => TransactionID;
  subscribe: (
    key: Key,
    callback?: StateCallback,
    unique?: boolean,
    liveOnly?: boolean,
    onerror?: Rejection
  ) => TransactionID;
  pSubscribe: (
    requestPattern: RequestPattern,
    callback?: PStateCallback,
    unique?: boolean,
    liveOnly?: boolean,
    onerror?: Rejection
  ) => TransactionID;
  unsubscribe: (transactionID: TransactionID) => void;
  ls: (parent?: Key) => Promise<Children>;
  subscribeLs: (
    parent?: Key,
    callback?: LsCallback,
    onerror?: Rejection
  ) => TransactionID;
  unsubscribeLs: (transactionID: TransactionID) => void;
  close: () => void;
  onclose?: (event: CloseEvent) => any;
  onerror?: (event: Err) => any;
  onwserror?: (event: Event) => any;
  onmessage?: (msg: ServerMessage) => any;
  clientId: () => string;
  graveGoods: () => Promise<string[]>;
  lastWill: () => Promise<KeyValuePairs>;
  setGraveGoods: (graveGoods: string[] | undefined) => void;
  setLastWill: (lastWill: KeyValuePairs | undefined) => void;
};

export const ErrorCodes = {
  IllegalWildcard: 0b00000000,
  IllegalMultiWildcard: 0b00000001,
  MultiWildcardAtIllegalPosition: 0b00000010,
  IoError: 0b00000011,
  SerdeError: 0b00000100,
  NoSuchValue: 0b00000101,
  NotSubscribed: 0b00000110,
  ProtocolNegotiationFailed: 0b00000111,
  InvalidServerResponse: 0b00001000,
  ReadOnlyKey: 0b00001001,
  Other: 0b11111111,
};

export type Rejection = (reason?: any) => void;

export function connect(
  address: string,
  authToken?: string
): Promise<Worterbuch> {
  return new Promise((res, rej) => {
    try {
      startWebsocket(res, rej, address, authToken);
    } catch (err) {
      rej(err);
    }
  });
}

function encode_client_message(msg: ClientMessage): string {
  return JSON.stringify(msg);
}

function decode_server_message(msg: string): ServerMessage {
  return JSON.parse(msg);
}

function startWebsocket(
  res: (value: Worterbuch | PromiseLike<Worterbuch>) => void,
  rej: (reason?: any) => void,
  address: string,
  authToken: string | undefined
) {
  let MAX_LAG = 5_000;
  if (
    typeof process === "object" &&
    process.env !== undefined &&
    process.env.WORTERBUCH_KEEPALIVE_TIMEOUT !== undefined
  ) {
    try {
      MAX_LAG = parseInt(process.env.WORTERBUCH_KEEPALIVE_TIMEOUT) * 1_000;
    } catch (e) {
      console.error(
        "Invalid value of WORTERBUCH_KEEPALIVE_TIMEOUT:",
        process.env.WORTERBUCH_KEEPALIVE_TIMEOUT
      );
    }
  }

  let keepalive: NodeJS.Timeout | number;
  let lastMsgReceived: number;
  let lastMsgSent: number;

  let connected = false;
  let closing = false;

  console.log("Connecting to Worterbuch server " + address + " …");

  const socket = new WebSocket(address);

  const close = () => {
    closing = true;
    socket.close();
  };

  const sendMsg = (msg: ClientMessage, socket: any) => {
    const buf = encode_client_message(msg);
    socket.send(buf);
    lastMsgSent = Date.now();
  };

  const authenticate = (clientId: string) => {
    if (authToken) {
      const salted = clientId + authToken;
      const hash = sha256.create();
      hash.update(salted);
      const token = hash.hex();
      const msg = { authenticationRequest: { authToken: token } };
      sendMsg(msg, socket);
    } else {
      connected = false;
      rej(
        new Error(
          "Server requires authentication but no auth token was provided."
        )
      );
      close();
    }
  };

  const state = {
    transactionId: 1,
    connected: false,
  };

  const nextTransactionId = () => {
    return state.transactionId++;
  };

  const pendingGets = new Map<
    TransactionID,
    [GetCallback, Rejection | undefined]
  >();
  const pendingPGets = new Map<
    TransactionID,
    [PGetCallback, Rejection | undefined]
  >();
  const pendingDeletes = new Map<
    TransactionID,
    [DeleteCallback, Rejection | undefined]
  >();
  const pendingPDeletes = new Map<
    TransactionID,
    [PDeleteCallback, Rejection | undefined]
  >();
  const pendingLsStates = new Map<
    TransactionID,
    [LsCallback, Rejection | undefined]
  >();
  const subscriptions = new Map<
    TransactionID,
    [StateCallback, Rejection | undefined]
  >();
  const psubscriptions = new Map<
    TransactionID,
    [PStateCallback, Rejection | undefined]
  >();
  const lssubscriptions = new Map<
    TransactionID,
    [LsCallback, Rejection | undefined]
  >();

  const get = (key: Key): Promise<Value | null> => {
    return new Promise((resolve, reject) => {
      // TODO reject after timeout?
      getAsync(key, resolve, reject);
    });
  };

  const getAsync = (
    key: Key,
    onmessage?: GetCallback,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { get: { transactionId, key } };
    sendMsg(msg, socket);
    if (onmessage) {
      pendingGets.set(transactionId, [onmessage, onerror]);
    }
    return transactionId;
  };

  const pGet = (requestPattern: RequestPattern): Promise<KeyValuePairs> => {
    return new Promise((resolve, reject) => {
      // TODO reject after timeout?
      pGetAsync(requestPattern, resolve, reject);
    });
  };

  const pGetAsync = (
    requestPattern: RequestPattern,
    onmessage?: PGetCallback,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { pGet: { transactionId, requestPattern } };
    sendMsg(msg, socket);
    if (onmessage) {
      pendingPGets.set(transactionId, [onmessage, onerror]);
    }
    return transactionId;
  };

  const del = (key: Key): Promise<Value | null> => {
    return new Promise((resolve, reject) => {
      // TODO reject after timeout?
      deleteAsync(key, resolve, reject);
    });
  };

  const deleteAsync = (
    key: Key,
    onmessage?: DeleteCallback,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { delete: { transactionId, key } };
    sendMsg(msg, socket);
    if (onmessage) {
      pendingDeletes.set(transactionId, [onmessage, onerror]);
    }
    return transactionId;
  };

  const pDelete = (requestPattern: RequestPattern): Promise<KeyValuePairs> => {
    return new Promise((resolve, reject) => {
      // TODO reject after timeout?
      pDeleteAsync(requestPattern, resolve, reject);
    });
  };

  const pDeleteAsync = (
    requestPattern: RequestPattern,
    onmessage?: PDeleteCallback,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { pDelete: { transactionId, requestPattern } };
    sendMsg(msg, socket);
    if (onmessage) {
      pendingPDeletes.set(transactionId, [onmessage, onerror]);
    }
    return transactionId;
  };

  const set = (key: Key, value: Value): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { set: { transactionId, key, value } };
    sendMsg(msg, socket);
    return transactionId;
  };

  const publish = (key: Key, value: Value): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { publish: { transactionId, key, value } };
    sendMsg(msg, socket);
    return transactionId;
  };

  const subscribe = (
    key: Key,
    onmessage?: StateCallback,
    unique?: boolean,
    liveOnly?: boolean,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = {
      subscribe: {
        transactionId,
        key,
        unique: unique || false,
        liveOnly: liveOnly || false,
      },
    };
    sendMsg(msg, socket);
    if (onmessage) {
      subscriptions.set(transactionId, [onmessage, onerror]);
    }

    return transactionId;
  };

  const pSubscribe = (
    requestPattern: RequestPattern,
    onmessage?: PStateCallback,
    unique?: boolean,
    liveOnly?: boolean,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = {
      pSubscribe: {
        transactionId,
        requestPattern,
        unique: unique || false,
        liveOnly: liveOnly || false,
      },
    };
    sendMsg(msg, socket);
    if (onmessage) {
      psubscriptions.set(transactionId, [onmessage, onerror]);
    }

    return transactionId;
  };

  const unsubscribe = (transactionId: TransactionID) => {
    subscriptions.delete(transactionId);
    psubscriptions.delete(transactionId);

    const msg = {
      unsubscribe: { transactionId },
    };
    sendMsg(msg, socket);
  };

  const ls = (parent?: string): Promise<Children> => {
    return new Promise((resolve, reject) => {
      // TODO reject after timeout?
      lsAsync(parent, resolve, reject);
    });
  };

  const lsAsync = (
    parent?: string,
    callback?: LsCallback,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = { ls: { transactionId, parent } };
    sendMsg(msg, socket);
    if (callback) {
      pendingLsStates.set(transactionId, [callback, onerror]);
    }
    return transactionId;
  };

  const subscribeLs = (
    parent?: string,
    onmessage?: LsCallback,
    onerror?: Rejection
  ): TransactionID => {
    const transactionId = nextTransactionId();
    const msg = {
      subscribeLs: { transactionId, parent },
    };
    sendMsg(msg, socket);
    if (onmessage) {
      lssubscriptions.set(transactionId, [onmessage, onerror]);
    }

    return transactionId;
  };

  const unsubscribeLs = (transactionId: TransactionID) => {
    lssubscriptions.delete(transactionId);

    const msg = {
      unsubscribeLs: { transactionId },
    };
    sendMsg(msg, socket);
  };

  const checkKeepalive = () => {
    if (closing) {
      if (socket.readyState === 2 || socket.readyState === 3) {
        console.error("Clean disconnect failed, terminating connection.");
        if (socket.onerror) {
          socket.onerror();
        }
        if (socket.onclose) {
          socket.onclose();
        }
        clearInterval(keepalive);
        return;
      }
      console.log(
        `Waiting for websocket to close (ready state: ${socket.readyState}) …`
      );
      return;
    }
    const lag = lastMsgSent - lastMsgReceived;
    if (lag >= 2000) {
      console.warn(
        `Server has been inactive for ${Math.round(
          (lastMsgSent - lastMsgReceived) / 1000
        )} seconds.`
      );
    }
    if (lag >= MAX_LAG) {
      console.log("Server has been inactive for too long. Disconnecting …");
      close();
    }
  };

  const clientIdHolder = { clientId: "" };
  const clientId = () => clientIdHolder.clientId;

  const graveGoods = async () => {
    const it = await get(`$SYS/clients/${clientId()}/graveGoods`);
    return (it as string[]) || [];
  };

  const lastWill = async () => {
    const it = await get(`$SYS/clients/${clientId()}/lastWill`);
    return (it as KeyValuePairs) || [];
  };

  const setGraveGoods = (graveGoods: string[] | undefined) => {
    if (!graveGoods) {
      del(`$SYS/clients/${clientId()}/graveGoods`);
    } else {
      set(`$SYS/clients/${clientId()}/graveGoods`, graveGoods);
    }
  };

  const setLastWill = (lastWill: KeyValuePairs | undefined) => {
    if (!lastWill) {
      del(`$SYS/clients/${clientId()}/lastWill`);
    } else {
      set(`$SYS/clients/${clientId()}/lastWill`, lastWill);
    }
  };

  const connection: Worterbuch = {
    clientId,
    get,
    pGet,
    delete: del,
    pDelete,
    set,
    publish,
    subscribe,
    pSubscribe,
    unsubscribe,
    ls,
    subscribeLs,
    unsubscribeLs,
    close,
    graveGoods,
    lastWill,
    setGraveGoods,
    setLastWill,
  };

  socket.onopen = (e: Event) => {
    console.log("Connected to server.");
    state.connected = true;
  };

  socket.onclose = (e: CloseEvent) => {
    if (connected) {
      if (closing) {
        console.log("Connection to server closed.");
      } else {
        console.error(
          `Connection to server was closed unexpectedly (code: ${e.code}): ${e.reason}`
        );
      }
    } else {
      rej(
        new Error(
          `Connection to server was closed unexpectedly (code: ${e.code}): ${e.reason}`
        )
      );
    }
    clearInterval(keepalive);
    state.connected = false;
    if (connection.onclose) {
      connection.onclose(e);
    }
  };

  socket.onerror = (e: Event) => {
    if (connection.onwserror) {
      connection.onwserror(e);
    } else {
      console.error("Error in websocket connection.");
    }
    if (!connected) {
      rej(e);
      close();
    }
  };

  const sendKeepalive = () => {
    socket.send(JSON.stringify(""));
    lastMsgSent = Date.now();
  };

  const processStateMsg = (msg: StateMsg) => {
    const { transactionId, keyValue, deleted } = msg.state;

    if (keyValue) {
      const pendingGet = pendingGets.get(transactionId);
      if (pendingGet) {
        pendingGets.delete(transactionId);
        pendingGet[0](keyValue.value);
      }
    }

    if (deleted) {
      const pendingDelete = pendingDeletes.get(transactionId);
      if (pendingDelete) {
        pendingDeletes.delete(transactionId);
        pendingDelete[0](deleted.value);
      }
    }

    const event = keyValue
      ? { value: keyValue.value }
      : deleted
      ? { deleted: deleted.value }
      : undefined;

    if (event) {
      const subscription = subscriptions.get(transactionId);
      if (subscription) {
        subscription[0](event);
      }
    }
  };

  const processLsStateMsg = (msg: LsStateMsg) => {
    const { transactionId, children } = msg.lsState;

    const pending = pendingLsStates.get(transactionId);
    if (pending) {
      pendingLsStates.delete(transactionId);
      pending[0](children);
    }

    const subscription = lssubscriptions.get(transactionId);
    if (subscription) {
      subscription[0](children);
    }
  };

  const processPStateMsg = (msg: PStateMsg) => {
    const transactionId = msg.pState.transactionId;
    const keyValuePairs = msg.pState.keyValuePairs;
    const deleted = msg.pState.deleted;

    if (keyValuePairs) {
      const pendingPGet = pendingPGets.get(transactionId);
      if (pendingPGet) {
        pendingPGets.delete(transactionId);
        pendingPGet[0](keyValuePairs);
      }
    }

    if (deleted) {
      const pendingPDelete = pendingPDeletes.get(transactionId);
      if (pendingPDelete) {
        pendingPDeletes.delete(transactionId);
        pendingPDelete[0](deleted);
      }
    }

    const event = keyValuePairs
      ? { keyValuePairs }
      : deleted
      ? { deleted }
      : undefined;

    if (event) {
      const subscription = psubscriptions.get(transactionId);
      if (subscription) {
        subscription[0](event);
      }
    }
  };

  const processErrMsg = (msg: ErrMsg) => {
    const transactionId = msg.err.transactionId;

    const pendingGet = pendingGets.get(transactionId);
    if (pendingGet) {
      pendingGets.delete(transactionId);
      let [resolve, reject] = pendingGet;
      if (msg.err.errorCode === ErrorCodes.NoSuchValue) {
        resolve(null);
      } else if (reject) {
        reject(msg.err);
      } else {
        console.error(
          `Error in get with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const pendingDelete = pendingDeletes.get(transactionId);
    if (pendingDelete) {
      pendingDeletes.delete(transactionId);
      let [resolve, reject] = pendingDelete;
      if (msg.err.errorCode === ErrorCodes.NoSuchValue) {
        resolve(null);
      } else if (reject) {
        reject(msg.err);
      } else {
        console.error(
          `Error in delete with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const pendingPGet = pendingPGets.get(transactionId);
    if (pendingPGet) {
      pendingPGets.delete(transactionId);
      if (pendingPGet[1]) {
        pendingPGet[1](msg.err);
      } else {
        console.error(
          `Error in pget with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const pendingPDelete = pendingPDeletes.get(transactionId);
    if (pendingPDelete) {
      pendingPDeletes.delete(transactionId);
      if (pendingPDelete[1]) {
        pendingPDelete[1](msg.err);
      } else {
        console.error(
          `Error in pdelete with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const pendingLs = pendingLsStates.get(transactionId);
    if (pendingLs) {
      pendingLsStates.delete(transactionId);
      let [resolve, reject] = pendingLs;
      if (msg.err.errorCode === ErrorCodes.NoSuchValue) {
        resolve([]);
      } else if (reject) {
        reject(msg.err);
      } else {
        console.error(
          `Error in ls with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const subscription = subscriptions.get(transactionId);
    if (subscription) {
      subscriptions.delete(transactionId);
      if (subscription[1]) {
        subscription[1](msg.err);
      } else {
        console.error(
          `Error in subscription with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const psubscription = psubscriptions.get(transactionId);
    if (psubscription) {
      psubscriptions.delete(transactionId);
      if (psubscription[1]) {
        psubscription[1](msg.err);
      } else {
        console.error(
          `Error in psubscription with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    const lssubscription = lssubscriptions.get(transactionId);
    if (lssubscription) {
      lssubscriptions.delete(transactionId);
      if (lssubscription[1]) {
        lssubscription[1](msg.err);
      } else {
        console.error(
          `Error in lssubscription with transaction ID '${transactionId}'`,
          msg.err
        );
      }
    }

    if (connection.onerror) {
      connection.onerror(msg.err);
    } else {
      console.error(
        `Received error code ${msg.err.errorCode} from server:`,
        msg.err.metadata
      );
    }
  };

  const processWelcomeMsg = (msg: WelcomeMsg) => {
    if (
      SUPPORTED_PROTOCOL_VERSIONS.includes(msg.welcome.info.protocolVersion)
    ) {
      clientIdHolder.clientId = msg.welcome.clientId;
      if (keepalive) {
        clearInterval(keepalive);
      }
      keepalive = setInterval(() => {
        checkKeepalive();
        sendKeepalive();
      }, 1000);
      if (msg.welcome.info.authenticationRequired) {
        authenticate(msg.welcome.clientId);
      } else {
        connected = true;
        res(connection);
      }
    } else {
      const err = `Protocol version ${msg.welcome.info.protocolVersion} is not supported by this client!`;
      connected = false;
      rej(new Error(err));
      close();
    }
  };

  const processAuthenticatedMsg = (msg: AuthenticatedMsg) => {
    console.info("Authentication successful.");
    connected = true;
    res(connection);
  };

  socket.onmessage = async (e: MessageEvent) => {
    lastMsgReceived = Date.now();
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
    } else if ((<LsStateMsg>msg).lsState) {
      processLsStateMsg(<LsStateMsg>msg);
    } else if ((<WelcomeMsg>msg).welcome) {
      processWelcomeMsg(<WelcomeMsg>msg);
    } else if ((<AuthenticatedMsg>msg).authenticated) {
      processAuthenticatedMsg(<AuthenticatedMsg>msg);
    }
  };
}
