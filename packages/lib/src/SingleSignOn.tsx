import { useRef } from "react";
import { SingleSignOnContext } from "./SingleSignOn.context";

export function SingleSignOn({ children, iframeUrl }: { children: React.ReactNode; iframeUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const idRef = useRef(1);

  return (
    <SingleSignOnContext.Provider value={{ iframeRef, iframeUrl, idRef }}>
      <iframe ref={iframeRef} src={iframeUrl} />
      {children}
    </SingleSignOnContext.Provider>
  );
}
