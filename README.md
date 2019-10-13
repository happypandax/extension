#### A WebExtensions add-on for browsers that talks with HappyPanda X from browsers

#### [Install on Firefox]() - [Install on Chrome]() - [HappyPanda X](https://github.com/happypandax/happypandax/) - [Support on Patreon](https://www.patreon.com/twiddly)

## Features

With this add-on, you can:

- Send manga & doujinshi to HPX for download from inside your browser
- Detect whether a manga or doujinshi is already inside your HPX database

#### Supported sites

- e-hentai.org
- exhentai.org
- nhentai.net

## Contributing

All contributions are welcome!

## Building

- Install `nodejs` and `npm`
- Clone or download this repository
- Run `cd path/to/cloned/repo`
- Run `npm install -g yarn`
- Run `yarn install`
- Create a file named `.env` with these contents:
    ```
    PORT=3000
    TSC_COMPILE_ON_ERROR=true
    INLINE_RUNTIME_CHUNK=false
    ```
- Run `yarn start` to start the application
- To load the extension:
- Run `yarn run build`
- Go to `about:debugging` (FireFox)
- Click on *“Load Temporary Add-on”* and select the `manifest.json` file found inside the `build` folder.