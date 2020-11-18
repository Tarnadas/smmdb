# SMMDB

![Continuous integration](https://img.shields.io/travis/Tarnadas/smmdb?label=Travis%20CI&logo=travis)
[![Discord](https://img.shields.io/discord/168893527357521920?label=Discord&logo=discord&color=7289da)](https://discord.gg/SPZsgSe)
[![Twitter](https://img.shields.io/twitter/follow/marior_dev?style=flat&logo=twitter&label=follow&color=00acee)](https://twitter.com/marior_dev)

A cross console/emulator sharing platform for Super Mario Maker courses to rule them all.

- [Website](https://smmdb.net)

- [API Backend repository](https://github.com/Tarnadas/smmdb-api)

- [API Documentation Website (WIP)](https://api.smmdb.net/)

- [SMM1 Save File Editor](https://github.com/tarnadas/cemu-smmdb/releases)

## Super Mario Maker on any platform

Super Mario Maker is available for Wii U and 3DS.
There are also Wii U emulators [Cemu](http://cemu.info) and [decaf-emu](https://github.com/decaf-emu/decaf-emu) as well as the 3DS emulator [Citra](https://citra-emu.org/). It is hard to make those platforms work together and this is what this project is all about.

Not even Nintendo managed to give 3DS users the full game experience, because they intentionally(?) removed features like downloading the levels **you** want. By connecting to SMMDB you can download all levels and get them to your 3DS.

Emulators are known for having either bad or no internet connectivity feature. Cemu managed to add those features, but you would have to own a real Wii U to play online with Cemu. You can instead use SMMDB and a [save file editor](https://github.com/tarnadas/cemu-smmdb) to play any level that has been uploaded on the platform.

It is important to mention, that SMMDB relies on the users to upload their levels separately. SMMDB cannot connect to real Nintendo servers, therefore not all worldwide levels are available.

## Software that connects to SMMDB

#### PC:

[Cemu SMMDB](https://github.com/tarnadas/cemu-smmdb)

#### 3DS Homebrew:

[OCDM](https://gbatemp.net/threads/ocdm-mario-maker-3ds-course-manager.451621/)

## Protocol Buffer Files

[Protocol Buffer](https://developers.google.com/protocol-buffers/) is used to serialize courses into an interchangable format. Any course that gets uploaded will be automatically converted into a new file format. Courses won't be stored in the format Nintendo is using.

Protocol Buffer files can be found at [smm-protobuf](https://github.com/Tarnadas/smm-protobuf).

## Public API

There is a [public API](docs/API.md) for developers, if they want to add SMMDB support to their software.
