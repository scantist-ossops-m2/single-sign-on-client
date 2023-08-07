# Single Sign On Client

Code that abstracts interaction with the single sign on iframe.

https://github.com/decentraland/single-sign-on <- Single Sign On webapp repo.

## Integration

1. Install the library

```sh
npm install @dcl/single-sign-on-client
```

2. Initialize the client as soon as the application starts or as soon as possible. It is important that initialization happens before it is used.

```ts
import * as SingleSignOn from "@dcl/single-sign-on-client";

const iframeSrc = "https://id.decentraland.org";

SingleSignOn.init(iframeSrc);
```

3. Use the corresponding functions to get, store and clear the identity of the user into the iframe.

```ts
import * as SingleSignOn from "@dcl/single-sign-on-client";

const address: string = "0x..."

const identity: AuthIdentity = await Authenticator.initializeAuthChain(address, ...)

await SingleSignOn.storeIdentity(address, identity)

const storedIdentity: AuthIdentity = await SingleSignOn.getIdentity(address)

await SingleSignOn.clearIdentity(address)
```

## Fallback

There are cases in which the iframe cannot be used to store the user's identity.

Cases like when the origin from were the client is being used is not an allowed origin, the single sign on webapp is not responding or simply because the client was not initialized.

Any time that the identity cannot be stored or obtained from the iframe, the current applications local storage will be used instead. This fallback mechanism will allow users to still access the application but without having their identities stored in the iframe, with all this implies (Not being able to reuse the identity on different applications)

This fallback strategy is intended for decentraland forks and local environments. Allowing us not to block anyone that uses this client which has not been allowed to use the identity iframe.
