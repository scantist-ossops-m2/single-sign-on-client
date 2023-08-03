import React, { useState } from "react";
import * as SingleSignOn from "@dcl/single-sign-on-client";
import { AuthIdentity, AuthLinkType } from "@dcl/crypto";

function getSampleAuthIdentity(): AuthIdentity {
  return {
    authChain: [{ payload: "payload", type: AuthLinkType.SIGNER, signature: "signature" }],
    ephemeralIdentity: {
      address: "address",
      privateKey: "privateKey",
      publicKey: "publicKey",
    },
    expiration: new Date(100),
  };
}

function App() {
  const [user, setUser] = useState("");

  return (
    <>
      <header>
        <h1>Single Sign On - Demo</h1>
      </header>
      <main>
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          <Input label="key" onChange={(e) => setUser(e.target.value)} />
        </div>
        <div style={{ marginTop: ".5rem", display: "flex", gap: ".5rem" }}>
          <button
            onClick={async () => {
              const identity = getSampleAuthIdentity();

              identity.ephemeralIdentity.address = user;

              try {
                await SingleSignOn.storeIdentity(user, identity);
                console.log("set!");
              } catch (e) {
                console.log((e as Error).message);
              }
            }}
          >
            STORE
          </button>
          <button
            onClick={async () => {
              try {
                const val = await SingleSignOn.getIdentity(user);
                console.log("get!", val);
              } catch (e) {
                console.log((e as Error).message);
              }
            }}
          >
            GET
          </button>
          <button
            onClick={async () => {
              try {
                await SingleSignOn.clearIdentity(user);
                console.log("clear!");
              } catch (e) {
                console.log((e as Error).message);
              }
            }}
          >
            CLEAR
          </button>
        </div>
      </main>
    </>
  );
}

function Input({ label, onChange }: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label style={{ display: "flex" }}>
      <div style={{ width: 40 }}>{label}</div>
      <input type="text" onChange={onChange} />
    </label>
  );
}

export default App;
