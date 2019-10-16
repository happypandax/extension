import React, { useState, useContext, useEffect } from 'react';
import { DEFAULT_HPX_SERVER, HPX_SERVER_ENDPOINT_PATH } from '../constants'
import { fetch } from '../utility/request';
import { ErrorMessage } from './Misc';
import { AppContext } from '../context';
import { setStorageValue, getStorageValue } from '../browser_utils';

const ConnectForm = () => {
    
    const appcontext = useContext(AppContext)
    const [loading, set_loading] = useState(false)
    const [error, set_error] = useState("")
    const [def_username, set_def_username] = useState("")
    const [def_password, set_def_password] = useState("")
    const [def_server, set_def_server] = useState("")

    const set_response_error = r => set_error(`Failed to connect to server (${r.status}): ${r.statusText}`)

    const checkLogin = (server, username, password) => {
        let server_endpoint = server + HPX_SERVER_ENDPOINT_PATH
        fetch(server_endpoint, {method: "head"}).then(async (r) => {
            if (r.ok) {
                const r2 = await fetch(server_endpoint, {method: "post", body: {username, password}})
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
                            setStorageValue({
                                server,
                                username,
                                password
                            })
    
                            appcontext.onConnect(true, {server:server_endpoint, username, password, session: serv_data.session})
    
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
            set_error(`An error occured: ${err.message}`)
        })
    }

    useEffect(() => {(async () => {
        let info = await getStorageValue(["username", "password", "server"]) as any
        if (info.server && info.username) {
            checkLogin(info.server, info.username, info.password)
        }
        set_def_server(info.server)
        set_def_username(info.username)
        set_def_password(info.password)
      })()}, [])
    

    return (
        <form id="connect-form" className={`ui form ${error ? "error" : ""}`} onSubmit={ev => {
            ev.preventDefault()
            set_error("")
            set_loading(true)
            let fdata = new FormData(ev.target as HTMLFormElement)
            let server = fdata.get("server") as string
            if (!server) {
                server = DEFAULT_HPX_SERVER
            }
            if (server.endsWith("/")) {
                server = server.slice(0, -1)
            }
            
            let username = fdata.get("username") as string || "default"
            let password = fdata.get("password") as string
            checkLogin(server, username, password)
        }}>
            <div className="field">
                <label>HPX Web Server Host</label>
                <div className="ui input"><input placeholder="http://localhost:7008" defaultValue={def_server} type="text" name="server"/></div>
            </div>
            <div className="field">
                <label>Username</label>
                <div className="ui input"><input placeholder="default" type="text" defaultValue={def_username} name="username"/></div>
            </div>
            <div className="field">
                <label>Password</label>
                <div className="ui input"><input placeholder="" type="password" defaultValue={def_password} name="password"/></div>
            </div>
            {!!error && <ErrorMessage>{error}</ErrorMessage>}
            <p>
                <button type="submit" className={`ui basic button right floated ${loading ? " loading" : ""}`}>Connect</button>
            </p>
        </form>
    );
};

export default ConnectForm;