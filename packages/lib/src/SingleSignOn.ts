import { AuthIdentity } from "@dcl/crypto";

type Action = "get" | "store" | "clear" | "ping";

const IFRAME_ID = "single-sign-on";
const IFRAME_TARGET = IFRAME_ID;
const GET_IFRAME_TIMEOUT = 500;

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

  const { identity } = await postMessage<{ identity: string | null }>(iframe, "get", { user });

  if (!identity) {
    return null;
  }

  const identityParsed = JSON.parse(identity) as AuthIdentity;

  identityParsed.expiration = new Date(identityParsed.expiration);

  return identityParsed;
}

export async function storeIdentity(user: string, identity: AuthIdentity): Promise<void> {
  const iframe = await getIframe();

  await postMessage(iframe, "store", { user, identity });
}

export async function clearIdentity(user: string): Promise<void> {
  const iframe = await getIframe();

  await postMessage(iframe, "clear", { user });
}

async function getIframe() {
  const retries = 5;

  for (let i = 0; i < retries; i++) {
    const element = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;

    const contentWindow = element?.contentWindow;

    if (!contentWindow) {
      await wait(GET_IFRAME_TIMEOUT);
      continue;
    }

    try {
      await postMessage(contentWindow, "ping", {}, GET_IFRAME_TIMEOUT);
    } catch (e) {
      continue;
    }

    return contentWindow;
  }

  throw new Error("Could not get iframe because it is not ready or cannot be communicated with");
}

async function postMessage<T>(
  iframe: Window,
  action: Action,
  payload: { user?: string; identity?: AuthIdentity },
  timeout = 0
): Promise<T> {
  _counter++;

  const id = _counter;

  let handler: ((event: MessageEvent) => void) | null = null;

  const request = new Promise<T>((resolve, reject) => {
    handler = ({ data }: MessageEvent) => {
      if (data?.target !== IFRAME_TARGET || data?.id !== id) {
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

  iframe.postMessage(
    {
      target: IFRAME_TARGET,
      id,
      action,
      ...payload,
    },
    _src
  );

  try {
    return await (timeout
      ? Promise.race([
          request,
          new Promise<T>((_, reject) =>
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
