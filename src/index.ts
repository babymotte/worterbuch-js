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

import { CloseEvent, Socket } from "./socket";
import { WbError } from "./error";

const SUPPORTED_PROTOCOL_VERSIONS = ["0.10"];
const URL_REGEX = /^(.+):\/\/(.+?)(?::([0-9]+))?(?:\/(.+))?$/;

export { WbError } from "./error";

export type Key = string;
export type RequestPattern = string;
export type RequestPatterns = RequestPattern[];
export type Value =
  | { [key: string]: Value }
  | Array<Value>
  | string
  | number
  | boolean
  | null;
export type Children = string[];
export type TransactionID = number;
export type KeyValuePair<T extends Value> = { key: Key; value: T };
export type KeyValuePairs<T extends Value> = KeyValuePair<T>[];
export type ProtocolVersion = { major: number; minor: number };
export type ProtocolVersions = ProtocolVersion[];
export type ErrorCode = number;
export type StateEvent<T extends Value> = { value?: T; deleted?: T };
export type PStateEvent<T extends Value> = {
  keyValuePairs?: KeyValuePairs<T>;
  deleted?: KeyValuePairs<T>;
};
export type LsEvent = {
  children: Children;
};

export type ErrorCallback = (err: Error) => void;
export type GetCallback<T extends Value> = (item: T | undefined) => void;
export type DeleteCallback<T extends Value> = GetCallback<T>;
export type PGetCallback<T extends Value> = (items: KeyValuePairs<T>) => void;
export type PDeleteCallback<T extends Value> = PGetCallback<T>;
export type StateCallback<T extends Value> = (event: StateEvent<T>) => void;
export type CachedStateCallback<T extends Value> = (
  value: T | undefined
) => void;
export type PStateCallback<T extends Value> = (event: PStateEvent<T>) => void;
export type LsCallback = (children: Children) => void;
export type AckCallback = () => void;
export type TidCallback = (tid: TransactionID) => void;
export type Ack = { transactionId: TransactionID };
export type Welcome = { info: ServerInfo; clientId: string };
export type AuthorizationRequest = { authToken: string };
export type State<T extends Value> = {
  transactionId: TransactionID;
  value: T | undefined;
  deleted: T | undefined;
};
export type PState<T extends Value> = {
  transactionId: TransactionID;
  requestPattern: RequestPattern;
  keyValuePairs: KeyValuePairs<T> | undefined;
  deleted: KeyValuePairs<T> | undefined;
};
export type LsState = { transactionId: TransactionID; children: Children };
export type Err = {
  transactionId: TransactionID;
  errorCode: ErrorCode;
  metadata: any;
};
export type ServerInfo = {
  protocolVersion: string;
  authorizationRequired: boolean;
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
export type PLs = {
  transactionId: number;
  parentPattern?: string;
};
export type SubscribeLs = {
  transactionId: number;
  parent?: string;
};
export type UnsubscribeLs = {
  transactionId: number;
};
export type AckMsg = { ack: Ack };
export type StateMsg<T extends Value> = { state: State<T> };
export type PStateMsg<T extends Value> = { pState: PState<T> };
export type ErrMsg = { err: Err };
export type WelcomeMsg = { welcome: Welcome };
export type AuthorizedMsg = { authorized: Ack };
export type LsStateMsg = {
  lsState: LsState;
};
export type AuthorizationRequestMsg = {
  authorizationRequest: AuthorizationRequest;
};
export type SetMsg<T extends Value> = {
  set: { transactionId: number; key: string; value: T };
};
export type SPubInitMsg = {
  sPubInit: { transactionId: number; key: string };
};
export type SPubMsg<T extends Value> = {
  sPub: { transactionId: number; value: T };
};
export type PubMsg<T extends Value> = {
  publish: { transactionId: number; key: string; value: T };
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
export type PLsMsg = {
  pLs: PLs;
};
export type SubscribeLsMsg = {
  subscribeLs: SubscribeLs;
};
export type UnsubscribeLsMsg = {
  unsubscribeLs: UnsubscribeLs;
};
export type ServerMessage<T extends Value> =
  | AckMsg
  | StateMsg<T>
  | PStateMsg<T>
  | ErrMsg
  | WelcomeMsg
  | AuthorizedMsg
  | LsStateMsg;
export type ClientMessage<T extends Value> =
  | AuthorizationRequestMsg
  | SetMsg<T>
  | SPubInitMsg
  | SPubMsg<T>
  | PubMsg<T>
  | GetMsg
  | PGetMsg
  | DelMsg
  | PDelMsg
  | SubMsg
  | PSubMsg
  | UnsubMsg
  | LsMsg
  | PLsMsg
  | SubscribeLsMsg
  | UnsubscribeLsMsg;

export type Worterbuch = {
  get: <T extends Value>(key: Key) => Promise<T | undefined>;
  pGet: <T extends Value>(
    requestPattern: RequestPattern
  ) => Promise<KeyValuePairs<T>>;
  delete: <T extends Value>(key: Key) => Promise<T | undefined>;
  pDelete: <T extends Value>(
    requestPattern: RequestPattern,
    quiet?: boolean
  ) => Promise<KeyValuePairs<T>>;
  set: <T extends Value>(key: Key, value: T) => Promise<void>;
  sPubInit: (key: Key) => Promise<TransactionID>;
  sPub: <T extends Value>(transactionId: TransactionID, value: T) => void;
  publish: <T extends Value>(key: Key, value: T) => Promise<void>;
  subscribe: <T extends Value>(
    key: Key,
    callback: StateCallback<T>,
    unique?: boolean,
    liveOnly?: boolean,
    onerror?: Rejection
  ) => TransactionID;
  pSubscribe: <T extends Value>(
    requestPattern: RequestPattern,
    callback: PStateCallback<T>,
    unique?: boolean,
    liveOnly?: boolean,
    onerror?: Rejection
  ) => TransactionID;
  unsubscribe: (transactionID: TransactionID) => void;
  ls: (parent?: Key) => Promise<Children>;
  pLs: (parent?: RequestPattern) => Promise<Children>;
  subscribeLs: (
    parent: Key | undefined,
    callback: LsCallback,
    onerror?: Rejection
  ) => TransactionID;
  unsubscribeLs: (transactionID: TransactionID) => void;
  close: () => void;
  onclose?: (event?: CloseEvent) => any;
  onerror?: (event: Err) => any;
  onconnectionerror?: (event?: Event | Error) => any;
  onmessage?: <T extends Value>(msg: ServerMessage<T>) => any;
  clientId: () => string;
  graveGoods: () => Promise<string[]>;
  lastWill: <T extends Value>() => Promise<KeyValuePairs<T>>;
  clientName: () => Promise<string | undefined>;
  setGraveGoods: (graveGoods: string[] | undefined) => void;
  setLastWill: <T extends Value>(
    lastWill: KeyValuePairs<T> | undefined
  ) => void;
  setClientName: (clientName: string) => void;
  cached: () => WbCache;
};

export type WbCache = {
  get: <T extends Value>(key: Key) => Promise<T | undefined>;
  set: <T extends Value>(key: Key, value: T) => Promise<void>;
  delete: <T extends Value>(key: Key) => Promise<T | undefined>;
  subscribe: <T extends Value>(
    key: Key,
    callback: CachedStateCallback<T>
  ) => TransactionID;
  unsubscribe: (transactionID: TransactionID) => void;
  expire: (maxAge: number, interval?: number) => void;
};

export enum ErrorCodes {
  IllegalWildcard = 0b00000000,
  IllegalMultiWildcard = 0b00000001,
  MultiWildcardAtIllegalPosition = 0b00000010,
  IoError = 0b00000011,
  SerdeError = 0b00000100,
  NoSuchValue = 0b00000101,
  NotSubscribed = 0b00000110,
  ProtocolNegotiationFailed = 0b00000111,
  InvalidServerResponse = 0b00001000,
  ReadOnlyKey = 0b00001001,
  Other = 0b11111111,
}

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

function encode_client_message<T extends Value>(msg: ClientMessage<T>): string {
  return JSON.stringify(msg);
}

function decode_server_message<T extends Value>(msg: string): ServerMessage<T> {
  return JSON.parse(msg);
}

function startWebsocket(
  res: (value: Worterbuch | PromiseLike<Worterbuch>) => void,
  rej: (reason?: any) => void,
  address: string,
  authToken: string | undefined
) {
  let connected = false;
  let closing = false;

  const result = URL_REGEX.exec(address);
  if (!result) {
    throw new Error("Invalid URL: " + address);
  }

  const proto = result[1];
  const host = result[2];
  const port = parseInt(result[3]) || defaultPort(proto);
  const path = result[4] || "";

  const client =
    proto === "tcp" ? import("./tcpSocket") : import("./webSocket");
  client.then((c) => {
    const connect = c.default;
    const socket = connect(proto, host, port, path);

    const sendMsg = <T extends Value>(
      msg: ClientMessage<T>,
      socket: Socket
    ) => {
      const buf = encode_client_message(msg);
      socket.send(buf);
    };

    const requestAuthorization = (clientId: string) => {
      if (authToken) {
        const msg = { authorizationRequest: { authToken } };
        sendMsg(msg, socket);
      } else {
        connected = false;
        rej(
          new Error(
            "Server requires authorization but no auth token was provided."
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
      [GetCallback<Value>, Rejection]
    >();
    const pendingPGets = new Map<
      TransactionID,
      [PGetCallback<Value>, Rejection]
    >();
    const pendingDeletes = new Map<
      TransactionID,
      [DeleteCallback<Value>, Rejection]
    >();
    const pendingPDeletes = new Map<
      TransactionID,
      [PDeleteCallback<Value>, Rejection]
    >();
    const pendingLsStates = new Map<TransactionID, [LsCallback, Rejection]>();
    const pendingSets = new Map<TransactionID, [AckCallback, Rejection]>();
    const pendingSpubInits = new Map<TransactionID, [TidCallback, Rejection]>();
    const pendingPublishes = new Map<TransactionID, [AckCallback, Rejection]>();
    const subscriptions = new Map<
      TransactionID,
      [StateCallback<Value>, Rejection | undefined]
    >();
    const psubscriptions = new Map<
      TransactionID,
      [PStateCallback<Value>, Rejection | undefined]
    >();
    const lssubscriptions = new Map<
      TransactionID,
      [LsCallback, Rejection | undefined]
    >();

    const get = <T extends Value>(key: Key): Promise<T | undefined> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        getAsync<T>(key, resolve, reject);
      });
    };

    const getAsync = <T extends Value>(
      key: Key,
      onmessage: GetCallback<T>,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { get: { transactionId, key } };
      sendMsg(msg, socket);
      pendingGets.set(transactionId, [
        onmessage as GetCallback<Value>,
        onerror,
      ]);
      return transactionId;
    };

    const pGet = <T extends Value>(
      requestPattern: RequestPattern
    ): Promise<KeyValuePairs<T>> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        pGetAsync(requestPattern, resolve, reject);
      });
    };

    const pGetAsync = <T extends Value>(
      requestPattern: RequestPattern,
      onmessage: PGetCallback<T>,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { pGet: { transactionId, requestPattern } };
      sendMsg(msg, socket);
      pendingPGets.set(transactionId, [
        onmessage as PGetCallback<Value>,
        onerror,
      ]);
      return transactionId;
    };

    const del = <T extends Value>(key: Key): Promise<T | undefined> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        deleteAsync<T>(key, resolve, reject);
      });
    };

    const deleteAsync = <T extends Value>(
      key: Key,
      onmessage: DeleteCallback<T>,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { delete: { transactionId, key } };
      sendMsg(msg, socket);
      pendingDeletes.set(transactionId, [
        onmessage as DeleteCallback<Value>,
        onerror,
      ]);
      return transactionId;
    };

    const pDelete = <T extends Value>(
      requestPattern: RequestPattern,
      quiet?: boolean
    ): Promise<KeyValuePairs<T>> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        pDeleteAsync(requestPattern, quiet || false, resolve, reject);
      });
    };

    const pDeleteAsync = <T extends Value>(
      requestPattern: RequestPattern,
      quiet: boolean,
      onmessage: PDeleteCallback<T>,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { pDelete: { transactionId, requestPattern, quiet } };
      pendingPDeletes.set(transactionId, [
        onmessage as PDeleteCallback<Value>,
        onerror,
      ]);
      sendMsg(msg, socket);
      return transactionId;
    };

    const set = <T extends Value>(key: Key, value: T): Promise<void> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        setAsync(key, value, resolve, reject);
      });
    };

    const setAsync = <T extends Value>(
      key: Key,
      value: T,
      onack: AckCallback,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { set: { transactionId, key, value } };
      sendMsg(msg, socket);
      pendingSets.set(transactionId, [onack, onerror]);
      return transactionId;
    };

    const sPubInit = (key: Key): Promise<TransactionID> => {
      const transactionId = nextTransactionId();
      const msg = { sPubInit: { transactionId, key } };
      sendMsg(msg, socket);
      return new Promise((onack, onerror) => {
        pendingSpubInits.set(transactionId, [onack, onerror]);
      });
    };

    const sPub = <T extends Value>(transactionId: TransactionID, value: T) => {
      const msg = { sPub: { transactionId, value } };
      sendMsg(msg, socket);
    };

    const publish = <T extends Value>(key: Key, value: T): Promise<void> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        publishAsync(key, value, resolve, reject);
      });
    };

    const publishAsync = <T extends Value>(
      key: Key,
      value: T,
      onack: AckCallback,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { publish: { transactionId, key, value } };
      sendMsg(msg, socket);
      pendingPublishes.set(transactionId, [onack, onerror]);
      return transactionId;
    };

    const subscribe = <T extends Value>(
      key: Key,
      onmessage: StateCallback<T>,
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
      subscriptions.set(transactionId, [
        onmessage as StateCallback<Value>,
        onerror,
      ]);
      return transactionId;
    };

    const pSubscribe = <T extends Value>(
      requestPattern: RequestPattern,
      onmessage: PStateCallback<T>,
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
      psubscriptions.set(transactionId, [
        onmessage as PStateCallback<Value>,
        onerror,
      ]);

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

    const ls = (parent?: Key): Promise<Children> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        lsAsync(parent, resolve, reject);
      });
    };

    const lsAsync = (
      parent: Key | undefined,
      callback: LsCallback,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { ls: { transactionId, parent } };
      sendMsg(msg, socket);
      pendingLsStates.set(transactionId, [callback, onerror]);
      return transactionId;
    };

    const pLs = (parentPattern?: RequestPattern): Promise<Children> => {
      return new Promise((resolve, reject) => {
        // TODO reject after timeout?
        pLsAsync(parentPattern, resolve, reject);
      });
    };

    const pLsAsync = (
      parentPattern: RequestPattern | undefined,
      callback: LsCallback,
      onerror: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = { pLs: { transactionId, parentPattern } };
      sendMsg(msg, socket);
      pendingLsStates.set(transactionId, [callback, onerror]);
      return transactionId;
    };

    const subscribeLs = (
      parent: string | undefined,
      onmessage: LsCallback,
      onerror?: Rejection
    ): TransactionID => {
      const transactionId = nextTransactionId();
      const msg = {
        subscribeLs: { transactionId, parent },
      };
      sendMsg(msg, socket);
      lssubscriptions.set(transactionId, [onmessage, onerror]);

      return transactionId;
    };

    const unsubscribeLs = (transactionId: TransactionID) => {
      lssubscriptions.delete(transactionId);

      const msg = {
        unsubscribeLs: { transactionId },
      };
      sendMsg(msg, socket);
    };

    const clientIdHolder = { clientId: "" };
    const clientId = () => clientIdHolder.clientId;

    const graveGoods = async () => {
      const it = await get(`$SYS/clients/${clientId()}/graveGoods`);
      return (it as string[]) || [];
    };

    const clientName = async () => {
      const it = await get(`$SYS/clients/${clientId()}/clientName`);
      return it as string;
    };

    const lastWill = async <T extends Value>() => {
      const it = await get(`$SYS/clients/${clientId()}/lastWill`);
      return (it as KeyValuePairs<T>) || [];
    };

    const setGraveGoods = (graveGoods: string[] | undefined) => {
      if (!graveGoods) {
        del(`$SYS/clients/${clientId()}/graveGoods`);
      } else {
        set(`$SYS/clients/${clientId()}/graveGoods`, graveGoods);
      }
    };

    const setLastWill = <T extends Value>(
      lastWill: KeyValuePairs<T> | undefined
    ) => {
      if (!lastWill) {
        del(`$SYS/clients/${clientId()}/lastWill`);
      } else {
        set(`$SYS/clients/${clientId()}/lastWill`, lastWill);
      }
    };

    const setClientName = (clientName: string) => {
      set(`$SYS/clients/${clientId()}/clientName`, clientName);
    };

    const cache = new Map<Key, { value: Value | undefined }>();
    const cachedSubscriptions = new Map<
      string,
      Map<TransactionID, CachedStateCallback<Value>>
    >();
    const subscriptionKeys = new Map<TransactionID, Key>();
    const subscriptionTids = new Map<Key, TransactionID>();
    const expirationCandidates = new Map<string, number>();

    const expireCache = (maxAge: number) => {
      console.debug("Expiring cache …");
      const now = Date.now();
      new Map(expirationCandidates).forEach((timestamp, key) => {
        const age = now - timestamp;
        if (age > maxAge) {
          console.debug(key, "is older than maxAge (", age, ">", maxAge, ")");
          const subs = cachedSubscriptions.get(key);
          if (noActiveSubs(subs)) {
            console.debug(
              key,
              "has no active subscriptions, removing it from cache"
            );
            cachedSubscriptions.delete(key);
            const tid = subscriptionTids.get(key);
            subscriptionTids.delete(key);
            if (tid != null) {
              console.debug("unsubscribing", tid);
              unsubscribe(tid);
            }
            cache.delete(key);
            expirationCandidates.delete(key);
          } else {
            console.debug(key, "has active subscriptions, keeping it in cache");
          }
        }
      });
    };

    let gc: NodeJS.Timeout | null = null;

    const expire = (maxAge: number, interval?: number) => {
      if (gc != null) {
        clearInterval(gc);
        gc = null;
      }
      if (interval) {
        gc = setInterval(() => expireCache(maxAge), interval);
      } else {
        expireCache(maxAge);
      }
    };

    const cSubscribe = <T extends Value>(
      key: Key,
      callback: CachedStateCallback<T>
    ) => {
      expirationCandidates.delete(key);
      const transactionId = nextTransactionId();
      subscriptionKeys.set(transactionId, key);
      let existingSubscribers = cachedSubscriptions.get(key);
      if (!existingSubscribers) {
        let subs = new Map();
        const tid = subscribe(
          key,
          (e) => {
            const previous = cache.get(key);
            cache.set(key, { value: e.value });
            if (previous === undefined || !deepEqual(previous.value, e.value)) {
              subs.forEach((callback) => {
                callback(e.value);
              });
            }
          },
          true,
          false
        );
        cachedSubscriptions.set(key, (existingSubscribers = subs));
        subscriptionTids.set(key, tid);
      }
      existingSubscribers.set(
        transactionId,
        callback as CachedStateCallback<Value>
      );
      const current = cache.get(key);
      if (current != null) {
        callback(current.value as T);
      }

      return transactionId;
    };

    const cUnsubscribe = (tid: TransactionID) => {
      const key = subscriptionKeys.get(tid);
      if (!key) {
        return;
      }
      subscriptionKeys.delete(tid);
      const subs = cachedSubscriptions.get(key);
      subs?.delete(tid);
      if (noActiveSubs(subs)) {
        expirationCandidates.set(key, Date.now());
      }
    };

    const cSet = async <T extends Value>(key: Key, value: T) => {
      let subs = cachedSubscriptions.get(key);
      if (noActiveSubs(subs)) {
        expirationCandidates.set(key, Date.now());
      }
      const previous = cache.get(key);
      if (previous === undefined || !deepEqual(previous.value, value)) {
        cache.set(key, { value });
        subs?.forEach((callback) => callback(value));
      }
      return await set<T>(key, value);
    };

    const cDel = async <T extends Value>(key: Key): Promise<T | undefined> => {
      let subs = cachedSubscriptions.get(key);
      if (noActiveSubs(subs)) {
        expirationCandidates.set(key, Date.now());
      }
      const previous = cache.get(key);
      if (previous === undefined || previous.value !== undefined) {
        cache.set(key, { value: undefined });
        subs?.forEach((callback) => callback(undefined));
      }
      if (previous === undefined) {
        return await del<T>(key);
      } else {
        del(key);
        return previous.value as T;
      }
    };

    const cGet = async <T extends Value>(key: Key): Promise<T | undefined> => {
      if (noActiveSubs(cachedSubscriptions.get(key))) {
        expirationCandidates.set(key, Date.now());
      }
      const cached = cache.get(key);
      if (cached !== undefined) {
        return cached.value as T;
      }
      const value = await get<T>(key);
      cache.set(key, { value });
      if (!cachedSubscriptions.has(key)) {
        cSubscribe<T>(key, noOpCallback);
      }
      return value;
    };

    const cachedClient: WbCache = {
      get: cGet,
      set: cSet,
      delete: cDel,
      subscribe: cSubscribe,
      unsubscribe: cUnsubscribe,
      expire,
    };

    const cached = () => cachedClient;

    const close = () => {
      if (gc != null) {
        clearInterval(gc);
      }
      cache.clear();
      cachedSubscriptions.clear();
      subscriptionKeys.clear();
      closing = true;
      socket.close();
    };

    const connection: Worterbuch = {
      clientId,
      get,
      pGet,
      delete: del,
      pDelete,
      set,
      sPubInit,
      sPub,
      publish,
      subscribe,
      pSubscribe,
      unsubscribe,
      ls,
      pLs,
      subscribeLs,
      unsubscribeLs,
      close,
      graveGoods,
      lastWill,
      clientName,
      setGraveGoods,
      setLastWill,
      setClientName,
      cached,
    };

    socket.onopen = (e?: Event) => {
      console.log("Connected to server.");
      state.connected = true;
    };

    socket.onclose = (e?: CloseEvent) => {
      if (connected) {
        if (closing) {
          console.log("Connection to server closed.");
        } else {
          console.error(
            `Connection to server was closed unexpectedly (code: ${e?.code}): ${e?.reason}`
          );
        }
      } else {
        rej(
          new Error(
            `Connection to server was closed unexpectedly (code: ${e?.code}): ${e?.reason}`
          )
        );
      }
      state.connected = false;
      if (connection.onclose) {
        connection.onclose(e);
      }
    };

    socket.onerror = (e?: Event | Error) => {
      if (connection.onconnectionerror) {
        connection.onconnectionerror(e);
      } else {
        console.error("Error in websocket connection.");
      }
      if (!connected) {
        rej(e);
        close();
      }
    };

    const processStateMsg = <T extends Value>(msg: StateMsg<T>) => {
      const { transactionId, value, deleted } = msg.state;

      if (value !== undefined) {
        const pendingGet = pendingGets.get(transactionId);
        if (pendingGet) {
          pendingGets.delete(transactionId);
          pendingGet[0](value);
        }
        const subscription = subscriptions.get(transactionId);
        if (subscription) {
          subscription[0]({ value });
        }
      }

      if (deleted !== undefined) {
        const pendingDelete = pendingDeletes.get(transactionId);
        if (pendingDelete) {
          pendingDeletes.delete(transactionId);
          pendingDelete[0](value);
        }
        const subscription = subscriptions.get(transactionId);
        if (subscription) {
          subscription[0]({ deleted });
        }
      }
    };

    const processAckMsg = (msg: AckMsg) => {
      const { transactionId } = msg.ack;

      const pendingSet = pendingSets.get(transactionId);
      if (pendingSet) {
        pendingSets.delete(transactionId);
        pendingSet[0]();
      }

      const pendingPublish = pendingPublishes.get(transactionId);
      if (pendingPublish) {
        pendingSets.delete(transactionId);
        pendingPublish[0]();
      }

      const pendingSpubInit = pendingSpubInits.get(transactionId);
      if (pendingSpubInit) {
        pendingSpubInits.delete(transactionId);
        pendingSpubInit[0](transactionId);
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

    const processPStateMsg = <T extends Value>(msg: PStateMsg<T>) => {
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
          resolve(undefined);
        } else if (reject) {
          reject(new WbError(msg.err));
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
          resolve(undefined);
        } else if (reject) {
          reject(new WbError(msg.err));
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
          reject(new WbError(msg.err));
        } else {
          console.error(
            `Error in ls with transaction ID '${transactionId}'`,
            msg.err
          );
        }
      }

      const pendingSet = pendingSets.get(transactionId);
      if (pendingSet) {
        pendingSets.delete(transactionId);
        let [_, reject] = pendingSet;
        if (reject) {
          reject(new WbError(msg.err));
        } else {
          console.error(
            `Error in set with transaction ID '${transactionId}'`,
            msg.err
          );
        }
      }

      const pendingPublish = pendingPublishes.get(transactionId);
      if (pendingPublish) {
        pendingPublishes.delete(transactionId);
        let [_, reject] = pendingPublish;
        if (reject) {
          reject(new WbError(msg.err));
        } else {
          console.error(
            `Error in publish with transaction ID '${transactionId}'`,
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
        if (msg.welcome.info.authorizationRequired) {
          requestAuthorization(msg.welcome.clientId);
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

    const processAuthorizedMsg = (msg: AuthorizedMsg) => {
      console.info("Authorization successful.");
      connected = true;
      res(connection);
    };

    socket.onmessage = async (e: string) => {
      const msg: ServerMessage<Value> = decode_server_message(e);

      if (connection.onmessage) {
        connection.onmessage(msg);
      }

      if ((<StateMsg<Value>>msg).state) {
        processStateMsg(<StateMsg<Value>>msg);
      } else if ((<PStateMsg<Value>>msg).pState) {
        processPStateMsg(<PStateMsg<Value>>msg);
      } else if ((<ErrMsg>msg).err) {
        processErrMsg(<ErrMsg>msg);
      } else if ((<LsStateMsg>msg).lsState) {
        processLsStateMsg(<LsStateMsg>msg);
      } else if ((<WelcomeMsg>msg).welcome) {
        processWelcomeMsg(<WelcomeMsg>msg);
      } else if ((<AuthorizedMsg>msg).authorized) {
        processAuthorizedMsg(<AuthorizedMsg>msg);
      } else if (<AckMsg>msg) {
        processAckMsg(<AckMsg>msg);
      }
    };
  });
}

function defaultPort(proto: string) {
  if (proto === "wss") {
    return 443;
  }
  if (proto === "tcp") {
    return 8081;
  }
  return 80;
}

function deepEqual(obj1: Value | undefined, obj2: Value | undefined) {
  // Base case: If both objects are identical, return true.
  if (obj1 === obj2) {
    return true;
  }
  // Check if both objects are objects and not null.
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 == null ||
    obj2 == null
  ) {
    return false;
  }
  // Get the keys of both objects.
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  // Check if the number of keys is the same.
  if (keys1.length !== keys2.length) {
    return false;
  }
  // Iterate through the keys and compare their values recursively.
  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !deepEqual((obj1 as any)[key], (obj2 as any)[key])
    ) {
      return false;
    }
  }
  // If all checks pass, the objects are deep equal.
  return true;
}

function noOpCallback() {}

function noActiveSubs<T extends Value>(
  subs: Map<number, StateCallback<T>> | undefined
) {
  return (
    subs == null ||
    subs.size === 0 ||
    (subs.size === 1 && subs.values().next().value === noOpCallback)
  );
}
