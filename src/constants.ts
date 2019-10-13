export let HPX_SERVER = "http://localhost:7008"
export let HPX_SERVER_ENDPOINT_PATH = "/server/"
export let HPX_SERVER_ENDPOINT = HPX_SERVER + HPX_SERVER_ENDPOINT_PATH
export let HPX_CLIENT_NAME = "hpx-browser-extension"

export let DEFAULT_HPX_OPTS = {
    session: undefined as string,
    server: HPX_SERVER_ENDPOINT
}
