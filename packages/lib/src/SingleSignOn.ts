import { AuthIdentity } from "@dcl/crypto";
import {
  Action,
  ClientMessage,
  ServerMessage,
  SINGLE_SIGN_ON_TARGET,
  createMessage,
  localStorageGetIdentity,
  localStorageStoreIdentity,
  localStorageClearIdentity,
} from "./SingleSignOn.shared";

const IFRAME_ID = SINGLE_SIGN_ON_TARGET;
const GET_IFRAME_TIMEOUT = 500;
const GET_IFRAME_RETRIES = 5;

let _counter = 0;
let _src = "";

export function init(src: string) {
  if (document.getElementById(IFRAME_ID)) {
    throw new Error("SingleSignOn already initialized");
  }

  _src = src;

  const iframe = document.createElement("iframe");
  iframe.id = IFRAME_ID;
  iframe.src = src;
  iframe.width = "0";
  iframe.height = iframe.width;

  document.body.appendChild(iframe);
}

export async function getIdentity(user: string): Promise<AuthIdentity | null> {
  const iframe = await getIframe();

  let identity: AuthIdentity | null;

  try {
    const message = await postMessage(iframe, Action.GET, { user });
    identity = message.identity ?? null;
  } catch (e) {
    logFallback(e as Error);
    identity = localStorageGetIdentity(user);
  }

  return identity;
}

export async function storeIdentity(user: string, identity: AuthIdentity): Promise<void> {
  const iframe = await getIframe();

  try {
    await postMessage(iframe, Action.STORE, { user, identity });
  } catch (e) {
    logFallback(e as Error);
    localStorageStoreIdentity(user, identity);
  }
}

export async function clearIdentity(user: string): Promise<void> {
  const iframe = await getIframe();

  try {
    await postMessage(iframe, Action.CLEAR, { user });
  } catch (e) {
    logFallback(e as Error);
    localStorageClearIdentity(user);
  }
}

async function getIframe() {
  for (let i = 0; i < GET_IFRAME_RETRIES; i++) {
    const element = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;

    const contentWindow = element?.contentWindow;

    if (!contentWindow) {
      await wait(GET_IFRAME_TIMEOUT);
      continue;
    }

    try {
      await postMessage(contentWindow, Action.PING, {}, GET_IFRAME_TIMEOUT);
    } catch (e) {
      continue;
    }

    return contentWindow;
  }

  throw new Error("Could not get iframe because it is not ready or cannot be communicated with");
}

async function postMessage(
  iframe: Window,
  action: Action,
  payload: Pick<ClientMessage, "user" | "identity">,
  timeout = 0
) {
  _counter++;

  const id = _counter;

  let handler: ((event: MessageEvent) => void) | null = null;

  const request = new Promise<ServerMessage>((resolve, reject) => {
    handler = ({ data }: MessageEvent<ServerMessage>) => {
      if (!data || data.target !== SINGLE_SIGN_ON_TARGET || data.id !== id) {
        return;
      }

      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data);
      }
    };

    window.addEventListener("message", handler);
  });

  iframe.postMessage(createMessage({ id, action, ...payload }), _src);

  try {
    return await (timeout
      ? Promise.race([
          request,
          new Promise<ServerMessage>((_, reject) =>
            setTimeout(() => reject(new Error("Did not receive a response in time")), timeout)
          ),
        ])
      : request);
  } catch (error) {
    throw error;
  } finally {
    if (handler) {
      window.removeEventListener("message", handler);
    }
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logFallback(error: Error) {
  console.warn("Could not get identity from iframe, falling back to localStorage", error.message);
}
