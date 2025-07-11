# Development

> NOTE: wexonds original idea was to replace remote with there rpc solution, we have fixes on the way, but for the most part almost every single remote has been migrated to @electron/remote package instead of the no longer added remote module.

## IPC

Now, the preferred way to communicate between processes is to use [`@wexond/rpc-electron`](https://github.com/wexond/rpc) package.

Example:

Handling the IPC message in the main process:

[`src/main/network/network-service-handler.ts`](../src/main/network/network-service-handler.ts)


Sending the IPC message to the main process:

```ts
const { data } = await networkMainChannel.getInvoker().request('http://localhost');
```

Common RPC interface

[`src/common/rpc/network.ts`](../src/common/rpc/network.ts)

## Node integration

We are going to turn off `nodeIntegration`, enable `contextIsolation` and `sandbox` in the UI webContents,
therefore we prefer not having requires to node.js built-in modules in renderers.

## Project structure

Common interfaces, constants etc. should land into the `common` directory.
