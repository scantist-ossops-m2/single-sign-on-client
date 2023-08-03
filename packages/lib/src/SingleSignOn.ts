import { AuthIdentity } from "@dcl/crypto";

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

export function getIdentity(user: string): Promise<AuthIdentity | null> {
  return performAction("get", user);
}

export function storeIdentity(user: string, identity: AuthIdentity): Promise<void> {
  return performAction("store", user, identity);
}

export function clearIdentity(user: string): Promise<void> {
  return performAction("clear", user);
}

function performAction(action: string, user: string, identity?: AuthIdentity) {
  const iframe = getIframe();

  _counter++;

  const id = _counter;

  const promise = new Promise<any>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.target !== IFRAME_TARGET || event.data?.id !== id) {
        return;
      }

      window.removeEventListener("message", handler);

      if (event.data?.error) {
        reject(new Error(event.data.error));
        return;
      }

      const msgIdentity = event.data?.identity;

      if (msgIdentity) {
        const msgIdentityParsed = JSON.parse(msgIdentity) as AuthIdentity;

        msgIdentityParsed.expiration = new Date(msgIdentityParsed.expiration);

        resolve(msgIdentityParsed);
      } else {
        resolve(null);
      }
    };

    window.addEventListener("message", handler);
  });

  iframe.postMessage(
    {
      target: IFRAME_TARGET,
      id,
      action,
      user,
      identity,
    },
    _src
  );

  return promise;
}

function getIframe() {
  const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;

  const cw = iframe?.contentWindow;

  if (!cw) {
    throw new Error("Iframe is not available");
  }

  return cw;
}
