# Camunda Modeler BaSys Plugin

[![Compatible with Camunda Modeler version 4.7](https://img.shields.io/badge/Camunda%20Modeler-4.7+-blue.svg)](https://github.com/camunda/camunda-modeler)

This is a BaSys plugin for the Camunda Modeler.


## Development Setup

Use [npm](https://www.npmjs.com/) to download and install required dependencies:

```sh
npm install
```

To make the Camunda Modeler aware of your plug-in you must link the plug-in to the [Camunda Modeler plug-in directory](https://github.com/camunda/camunda-modeler/tree/develop/docs/plugins#plugging-into-the-camunda-modeler) via a symbolic link.
Available utilities to do that are [`mklink /d`](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/mklink) on Windows and [`ln -s`](https://linux.die.net/man/1/ln) on MacOS / Linux.

Re-start the app in order to recognize the newly linked plug-in.


## Building the Plug-in

You may spawn the development setup to watch source files and re-build the client plug-in on changes:

```sh
npm run dev
```

Given you've setup and linked your plug-in [as explained above](#development-setup), you should be able to reload the modeler to pick up plug-in changes. To do so, open the app's built in development toos via `F12`. Then, within the development tools press the reload shortcuts `CTRL + R` or `CMD + R` to reload the app.


To build the plugin, run:

```sh
npm run bundle
```


## Licence

EPLv2
