import { AuthIdentity } from "@dcl/crypto";

export type SingleSignOnConfig = {
  src: string;
};


export class SingleSignOn {
  private static instance?: SingleSignOn;

  static init = (config: SingleSignOnConfig) => {
    if (SingleSignOn.instance) {
      throw new Error("SingleSignOnApi already initialized");
    }

    SingleSignOn.instance = new SingleSignOn(config);
  };

  static getInstance = (): SingleSignOn => {
    if (!SingleSignOn.instance) {
      throw new Error("SingleSignOnApi not initialized");
    }

    return SingleSignOn.instance;
  };

  private iframe: HTMLIFrameElement;

  private counter = 0;

  private constructor(private config: SingleSignOnConfig) {
    const iframe = document.createElement("iframe");
    iframe.src = config.src;
    iframe.width = iframe.height = "0";

    document.body.appendChild(iframe);

    this.iframe = iframe;
  }

  get = async (user: string): Promise<AuthIdentity | null> => {
    const { contentWindow } = this.iframe;

    if (!contentWindow) {
      throw new Error("Prop `contentWindow` is unavailable");
    }

    const id = ++this.counter;

    const promise = new Promise<AuthIdentity | null>((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        if (event.data?.target !== "single-sign-on") {
          return;
        }

        if (event.data?.id !== id) {
          return;
        }

        window.removeEventListener("message", handler);

        if (event.data?.error) {
          reject(new Error(event.data.error));
          return;
        }

        resolve(JSON.parse(event.data.identity));
      };

      window.addEventListener("message", handler);
    });

    contentWindow.postMessage(
      {
        target: "single-sign-on",
        id,
        action: "get",
        user,
      },
      this.config.src
    );

    return promise;
  };
}
