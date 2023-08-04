import { AuthIdentity } from "@dcl/crypto";

export enum Action {
  GET = "get",
  STORE = "store",
  CLEAR = "clear",
  PING = "ping",
}

export const SINGLE_SIGN_ON_TARGET = "single-sign-on";

export type ClientMessage = {
  target: string;
  id: number;
  action?: Action;
  user?: string;
  identity?: AuthIdentity | null;
};

export type ServerMessage = {
  target: string;
  id: number;
  identity?: AuthIdentity | null;
  error?: string;
};

export function createMessage(message: Omit<ClientMessage & ServerMessage, "target">) {
  return {
    target: SINGLE_SIGN_ON_TARGET,
    ...message,
  };
}

export function localStorageGetIdentity(user: string) {
  const item = localStorage.getItem(getKey(user));

  const identity = item ? (JSON.parse(item) as AuthIdentity) : null;

  if (identity) {
    identity.expiration = new Date(identity.expiration);
  }

  return identity;
}

export function localStorageStoreIdentity(user: string, identity: AuthIdentity) {
  localStorage.setItem(getKey(user), JSON.stringify(identity));
}

export function localStorageClearIdentity(user: string) {
  localStorage.removeItem(getKey(user));
}

function getKey(user: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(user)) {
    throw new Error(`User must be a valid ethereum address`);
  }

  return `single-sign-on-${user.toLowerCase()}`;
}
