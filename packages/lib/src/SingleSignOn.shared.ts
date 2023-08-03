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
