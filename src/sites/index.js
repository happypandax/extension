/* eslint-disable import/no-webpack-loader-syntax */

// matcher : object

export default {
    "*://e-hentai.org/*": { // match pattern url, used to ask for site permission and match for the contextmenu items
        code: require("!raw-loader!../sites/ehentai").default, // content-script code that should be injected
        test: ".*//(www\\.)?e-hentai\\.org/.*$", // different than the match pattern above, this is a regex expression to test if the site matches
        gallery: ".*//(www\\.)?e-hentai\\.org/g/[0-9]{3,10}/[0-9a-zA-Z]{3,15}/?$", // this is used to test if a url is a gallery
    },
    "*://exhentai.org/*": {
        code: require("!raw-loader!../sites/ehentai").default,
        test: ".*//(www\\.)?exhentai\\.org/.*$",
        gallery: ".*//(www\\.)?exhentai\\.org/g/[0-9]{3,10}/[0-9a-zA-Z]{3,15}/?$",
    },
    "*://panda.chaika.moe/*": {
        code: "",
        test: ".*//(www\\.)?panda\\.chaika\\.moe/.*$",
        gallery: ".*//(www\\.)?panda\\.chaika\\.moe/(gallery|archive)/[0-9]{3,15}/?$",
    },
    "*://nhentai.net/*": {
        code: "",
        test: ".*//(www\\.)?nhentai\\.net/.*$",
        gallery: ".*//(www\\.)?nhentai\\.net/g/[0-9]{3,10}/?$",
    },
}
