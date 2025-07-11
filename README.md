<p align="center">
  <a href="https://vqmsoftware.github.io"><img src="static/icons/icon.png" width="256"></a>
</p>

<div align="center">
  <h1>LunarWolf Browser</h1>

LunarWolf Browser which is a modern web browser, built on top of modern web technologies such as `Electron` and `React`, that can also be used as a framework to create a custom web browser (see the [License](#license) section).

</div>

# Table of Contents:
- [Motivation](#motivation)
- [Features](#features)
- [Screenshots](#screenshots)
- [Downloads](#downloads)
- [Contributing](#contributing)
- [Development](#development)
  - [Running](#running)
- [Documentation](#documentation)
- [License](#license)

# Motivation

a couple of years ago the original wexond project was discontenued, it was a very good base and still is, but now its outdated, where it hasent been maintained in so many years, our goal is to make a broser from there 5.2.0 codebase and other mixins to create the ultra form browser, that dosen't require so much space like chromium does, and the best part is you can make changes very easy, Thanks to wexond and other forks of it out there for making this possible, the browser will have our own implamentations aswell, and will eventually as time passes get more feature ritch.

# Features

- **LunarWolf Shield** - Browse the web without any ads and don't allow websites to track your intrests. Thanks to the LunarWolf Shield powered by [cliqz which was renamed to ghostery](https://github.com/ghostery/adblocker), websites can load even 8 times faster!
- **Chromium without Google services and low resources usage** - Since LunarWolf uses Wexond and Electron under the hood which is based on only several and the most important Chromium components, it's not bloated with redundant Google tracking services and others.
- **Fast and fluent UI** - The animations are really smooth and their timings are perfectly balanced.
- **Highly customizable new tab page** - Customize almost an every aspect of the new tab page!
- **Customizable browser UI** - Choose whether LunarWolf should have compact or normal UI.
- **Tab groups** - Easily group tabs, so it's hard to get lost.
- **Scrollable tabs**
- **extension support is being reworked with electron-chrome-extensions**

## Other basic features

- Downloads popup with currently downloaded items (download manager WebUI page is WIP)
- History manager
- Bookmarks bar & manager
- Settings
- Find in page
- Dark and light theme
- Omnibox with autocomplete algorithm similar to Chromium
- State of the art tab system

# Screenshots

![image](https://user-images.githubusercontent.com/11065386/81024159-d9388f80-8e72-11ea-85e7-6c30e3b66554.png)

UI normal variant:
![image](https://user-images.githubusercontent.com/11065386/81024186-f40b0400-8e72-11ea-976e-cd1ca1b43ad8.png)

UI compact variant:
![image](https://user-images.githubusercontent.com/11065386/81024222-13099600-8e73-11ea-9fc9-3c63a034403d.png)
![image](https://user-images.githubusercontent.com/11065386/81024252-2ddc0a80-8e73-11ea-9f2f-6c9a4a175c60.png)

# Downloads
-- Not ready yet.

# Development

## Running

Before running LunarWolf, please ensure you have **latest** [`Node.js`](https://nodejs.org/en/download)

> NOTE: yarn is built into node.js

### Windows

Make sure you have build tools installed. You can install them by running this command as **administrator**:

```bash
$ corepack enable
```

```bash
$ yarn install # Install needed depedencies.
$ yarn run build # builds native modules using Electron headers.
$ yarn run rebuild # Rebuild native modules using Electron headers.
$ yarn dev # Run LunarWolf in development mode
```

### More commands

```bash
$ yarn compile-win32 # Package LunarWolf for Windows
$ yarn compile-linux # Package LunarWolf for Linux
$ yarn compile-darwin # Package LunarWolf for macOS
$ yarn lint # Runs linter
$ yarn lint-fix # Runs linter and automatically applies fixes
```

More commands can be found in [`package.json`](package.json).

# Documentation

Guides and the API reference are located in [`docs`](docs) directory.

# License

This project is licensed under [GPL-3](LICENSE) and an additional license under [PATENTS](PATENTS) file.

[![shields license badge](https://img.shields.io/github/license/vqmsoftware/LunarWolf-Browser-Desktop?style=flat-square)](LICENSE)

