export let DEFAULT_HPX_SERVER = "http://localhost:7008"
export let HPX_SERVER_ENDPOINT_PATH = "/server/"
export let DEFAULT_HPX_SERVER_ENDPOINT = DEFAULT_HPX_SERVER + HPX_SERVER_ENDPOINT_PATH
export let HPX_CLIENT_NAME = "hpx-browser-extension"

export const IS_POPUP_CONTEXT = typeof window !== 'undefined' ? window.location.hash === '#popup' : false
export const IS_BACKGROUND_CONTEXT = typeof window !== 'undefined' ? window.location.hash === '#background' : false

export const DEBUG = true

export const MESSAGES = {
    popup: undefined as browser.runtime.Port,
    background: undefined as browser.runtime.Port
}

export let BACKGROUND_STATE = {
    connected: false,
    session: "",
    server: "",
    popup_connected: false // i.e. popup has connected to the background page
}