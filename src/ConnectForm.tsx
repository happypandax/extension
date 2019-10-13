import React, { useState, useContext } from 'react';
import { HPX_SERVER, HPX_SERVER_ENDPOINT_PATH } from './constants'
import { fetch } from './utility/request';
import { ErrorMessage } from './misc';
import { AppContext } from './context';

const ConnectForm = () => {
    
    const appcontext = useContext(AppContext)

    const [loading, set_loading] = useState(false)
    const [error, set_error] = useState("")

    const set_response_error = r => set_error(`Failed to connect to server (${r.status}): ${r.statusText}`)

    return (
        <form id="connect-form" className={`ui form ${error ? "error" : ""}`} onSubmit={ev => {
            ev.preventDefault()
            set_error("")
            set_loading(true)
            let fdata = new FormData(ev.target as HTMLFormElement)
            let server = fdata.get("server") as string
            if (!server) {
                server = HPX_SERVER
            }
            if (server.endsWith("/")) {
                server = server.slice(0, -1)
            }
            server += HPX_SERVER_ENDPOINT_PATH

            fetch(server, {method: "head"}).then(async (r) => {
                if (r.ok) {
                    let username = fdata.get("username") as string || "default"
                    let password = fdata.get("password") as string

                    const r2 = await fetch(server, {method: "post", body: {username, password}})
                    set_loading(false)
                    if (r2.ok) { //
                        let serv_data = await r2.json()
                        if (serv_data.error) {
                            if (serv_data.code && serv_data.code === 411) {
                                set_error("Wrong credentials")
                            } else {
                                set_error(serv_data.error)
                            }
                        } else {
                            if (serv_data.data === "Authenticated") {
                                appcontext.onConnect(true, {server, username, password, session: serv_data.session})

                            } else {
                                set_error(`Received a weird response: ${JSON.stringify(serv_data)}`)
                            }
                        }
                    } else {
                        if (r2.status === 404) {
                            set_error("The server might have disabled the communication endpoint (enable it in HPX config with server.enable_http_endpoint)")
                        } else {
                            set_response_error(r2)
                        }
                    }
                } else {
                    set_response_error(r)
                    set_loading(false)
                }
            }).catch(err => {
                set_loading(false)
                set_error(`An unkown error occured: ${err.message}`)
            })
        }}>
            <div className="field">
                <label>HPX Web Server Host</label>
                <div className="ui input"><input placeholder="http://localhost:7008" type="text" name="server"/></div>
            </div>
            <div className="field">
                <label>Username</label>
                <div className="ui input"><input placeholder="default" type="text" name="username"/></div>
            </div>
            <div className="field">
                <label>Password</label>
                <div className="ui input"><input placeholder="" type="password" name="password"/></div>
            </div>
            {!!error && <ErrorMessage>{error}</ErrorMessage>}
            <p>
                <button type="submit" className={`ui button ${loading ? " loading" : ""}`}>Connect</button>
            </p>
        </form>
    );
};

export default ConnectForm;