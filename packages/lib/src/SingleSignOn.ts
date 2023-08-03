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

export function getIdentity(user: string) {
  const iframe = getIframe();

  _counter++;

  const id = _counter;

  const promise = new Promise<AuthIdentity | null>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.target !== IFRAME_TARGET || event.data?.id !== id) {
        return;
      }

      window.removeEventListener("message", handler);

      if (event.data?.error) {
        reject(new Error(event.data.error));
        return;
      }

      const identity = JSON.parse(event.data.identity) as AuthIdentity | null;

      if (identity) {
        identity.expiration = new Date(identity.expiration);
      }

      resolve(identity);
    };

    window.addEventListener("message", handler);
  });

  iframe.postMessage(
    {
      target: IFRAME_TARGET,
      id,
      action: "get",
      user,
    },
    _src
  );

  return promise;
}

export function storeIdentity(user: string, identity: AuthIdentity) {
  const iframe = getIframe();

  _counter++;

  const id = _counter;

  const promise = new Promise<void>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.target !== IFRAME_TARGET || event.data?.id !== id) {
        return;
      }

      window.removeEventListener("message", handler);

      if (event.data?.error) {
        reject(new Error(event.data.error));
        return;
      }

      resolve();
    };

    window.addEventListener("message", handler);
  });

  iframe.postMessage(
    {
      target: IFRAME_TARGET,
      id,
      action: "store",
      user,
      identity,
    },
    _src
  );

  return promise;
}

export function clearIdentity(user: string) {
  const iframe = getIframe();

  _counter++;

  const id = _counter;

  const promise = new Promise<void>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.target !== IFRAME_TARGET || event.data?.id !== id) {
        return;
      }

      window.removeEventListener("message", handler);

      if (event.data?.error) {
        reject(new Error(event.data.error));
        return;
      }

      resolve();
    };

    window.addEventListener("message", handler);
  });

  iframe.postMessage(
    {
      target: IFRAME_TARGET,
      id,
      action: "clear",
      user,
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
