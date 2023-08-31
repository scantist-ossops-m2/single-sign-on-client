import type { AuthIdentity } from "@dcl/crypto";

// The possible typo of interactions with the iframe.
export enum Action {
  // Get the identity of a user.
  GET = "get",
  // Store the identity of a user.
  STORE = "store",
  // Clear the identity of a user.
  CLEAR = "clear",
  // Check that the iframe can be communicated with.
  PING = "ping",
}

// Value used to identify messages intended for the iframe.
export const SINGLE_SIGN_ON_TARGET = "single-sign-on";

// The schema of messages sent by the client.
export type ClientMessage = {
  target: string;
  id: number;
  action?: Action;
  user?: string;
  identity?: AuthIdentity | null;
};

// The schema of messages sent by the iframe.
export type ServerMessage = {
  target: string;
  id: number;
  identity?: AuthIdentity | null;
  error?: string;
};

// Helper function to create a message without the need of providing a target.
export function createMessage(message: Omit<ClientMessage & ServerMessage, "target">) {
  return {
    target: SINGLE_SIGN_ON_TARGET,
    ...message,
  };
}

// Get the identity of the user from local storage.
// Does some extra operations on the obtained value to make it more reliable.
export function localStorageGetIdentity(user: string) {
  const item = localStorage.getItem(getKey(user));
  if (!item) {
    return null;
  }

  let identity: AuthIdentity;
  try {
    // If the item is not a valid JSON, we remove it.
    identity = JSON.parse(item);
  } catch (e) {
    localStorageClearIdentity(user);
    return null;
  }

  // The expiration is parsed as a string, so we need to convert it to a Date.
  identity.expiration = new Date(identity.expiration);

  // If expiration is in the past, we remove the identity.
  if (identity.expiration.getTime() <= Date.now()) {
    localStorageClearIdentity(user);
    return null
  }

  // Everything is fine, we return the identity.
  return identity;
}

// Stores the identity of the user in local storage (if is not expired).
export function localStorageStoreIdentity(user: string, identity: AuthIdentity) {
  const expiration = new Date(identity.expiration)
  if (expiration.getTime() > Date.now()) {
    localStorage.setItem(getKey(user), JSON.stringify(identity));
  }
}

// Clears the identity of the user from local storage.
export function localStorageClearIdentity(user: string) {
  localStorage.removeItem(getKey(user));
}

// Gets the key where the identity of the user is stored in local storage.
function getKey(user: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(user)) {
    throw new Error(`User must be a valid ethereum address`);
  }

  return `single-sign-on-${user.toLowerCase()}`;
}
