import { AuthIdentity } from "@dcl/crypto";

type Action = "get" | "store" | "clear" | "ping";

const IFRAME_ID = "single-sign-on";
const IFRAME_TARGET = IFRAME_ID;

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
  const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;

  const cw = iframe?.contentWindow;

  if (!cw) {
    throw new Error("Iframe is not available");
  }

  return cw;
}

function postMessage<T>(iframe: Window, action: Action, payload: { user?: string; identity?: AuthIdentity }) {
  _counter++;

  const id = _counter;

  const promise = new Promise<T>((resolve, reject) => {
    const handler = ({ data }: MessageEvent) => {
      if (data?.target !== IFRAME_TARGET || data?.id !== id) {
        return;
      }

      window.removeEventListener("message", handler);

      if (data.error) {
        reject(new Error(data.error));
        return;
      }

      resolve(data);
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

  return promise;
}
