import { AuthIdentity } from "@dcl/crypto";

const IFRAME_ID = "single-sing-on";
const IFRAME_TARGET = IFRAME_ID;

let _counter = 0;
let _src = "";

export function init(src: string) {
  if (document.getElementById(IFRAME_ID)) {
    throw new Error("SingleSignOn already initialized");
  }

  const iframe = document.createElement("iframe");
  iframe.id = IFRAME_ID;
  iframe.src = _src = src;
  iframe.width = iframe.height = "0";

  document.body.appendChild(iframe);
}

export function getIdentity(user: string) {
  return handleIdentity<AuthIdentity | null>("get", user);
}

export function storeIdentity(user: string, identity: AuthIdentity) {
  return handleIdentity<void>("store", user, identity);
}

export function clearIdentity(user: string) {
  return handleIdentity<void>("clear", user);
}

function handleIdentity<T>(action: "get" | "store" | "clear", user: string, identity?: AuthIdentity): Promise<T> {
  const iframe = getIframe();

  _counter++;

  const id = _counter;

  const promise = new Promise<T>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.target !== IFRAME_TARGET || event.data?.id !== id) {
        return;
      }

      window.removeEventListener("message", handler);

      if (event.data?.error) {
        reject(new Error(event.data.error));
        return;
      }

      if (action === "get") {
        resolve(JSON.parse(event.data.identity));
      } else {
        resolve({} as T);
      }

      resolve(action === "get" ? JSON.parse(event.data.identity) : undefined);
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

// export class SingleSignOn {
//   private static counter = 0;
//   private static src: string = "";

//   static init(src: string) {
//     if (document.getElementById("single-sing-on")) {
//       throw new Error("SingleSignOn already initialized");
//     }

//     const iframe = document.createElement("iframe");
//     iframe.id = "single-sing-on";
//     iframe.src = SingleSignOn.src = src;
//     iframe.width = iframe.height = "0";

//     document.body.appendChild(iframe);
//   }

//   static async get(user: string): Promise<AuthIdentity | null> {
//     const iframe = SingleSignOn.getIframe();

//     SingleSignOn.counter++;

//     const id = SingleSignOn.counter;

//     const promise = new Promise<AuthIdentity | null>((resolve, reject) => {
//       const handler = (event: MessageEvent) => {
//         if (event.data?.target !== "single-sign-on") {
//           return;
//         }

//         if (event.data?.id !== id) {
//           return;
//         }

//         window.removeEventListener("message", handler);

//         if (event.data?.error) {
//           reject(new Error(event.data.error));
//           return;
//         }

//         resolve(JSON.parse(event.data.identity));
//       };

//       window.addEventListener("message", handler);
//     });

//     iframe.postMessage(
//       {
//         target: "single-sign-on",
//         id,
//         action: "get",
//         user,
//       },
//       SingleSignOn.src
//     );

//     return promise;
//   }

//   private static getIframe() {
//     const iframe = document.getElementById("single-sing-on") as HTMLIFrameElement | null;

//     const cw = iframe?.contentWindow;

//     if (!cw) {
//       throw new Error("Iframe is not available");
//     }

//     return cw;
//   }
// }
