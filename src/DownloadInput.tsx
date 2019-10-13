import React, { useState, useEffect, useContext } from 'react';
import { callFunction } from './utility/request';

export const DownloadButton = ({ added = false, loading = false, children = undefined, ...props}) => {

    return (
        <button {...props} className={`ui button ${!children ? "icon" : ""} ${added ? "green" : "primary"} ${loading ? "loading" : ""}`}>
            <i className={`icon ${added ? "check" : "download"}`}></i>
            {children}
        </button>
    );
};

export const DownloadCurrentUrlButton = () => {

    const [added, set_added] = useState(false)
    const [loading, set_loading] = useState(false)

    return (
        <DownloadButton added={added} loading={loading} onClick={ev => {
            ev.preventDefault()
            let current_url = window.location.href
            set_loading(true)
            callFunction("add_urls_to_download_queue", {urls: [current_url]}).then(r => {
                set_loading(false)
                if (!r.error) {
                    if (r.data) { 
                        set_added(true)
                    }
                } else {
                }
            })
        }}>
            {added ? "Sent!" : "Download current gallery"}
        </DownloadButton>
    );
};

const DownloadInput = () => {

    const [url, set_url] = useState("")
    const [msg, set_msg] = useState("")
    const [added, set_added] = useState(false)
    const [loading, set_loading] = useState(false)


    useEffect(() => {
        if (!url) {
            set_url(window.location.href)
        }
    }, [])


    return (
        <form className="ui form" onSubmit={ev => {
            ev.preventDefault()
            set_added(false)
            if (url) {
                set_loading(true)
                callFunction("add_urls_to_download_queue", {urls: [url]}).then(r => {
                    set_loading(false)
                    if (!r.error) {
                        console.log(r)
                        if (r.data) { // server returned true
                            set_url("")
                            set_added(true)
                        }
                    } else {
                        set_msg(r.error)
                    }
                })
            }
        }}>
            <div className="field">
                <div className="ui action input">
                    <input value={url} onChange={(ev) => { ev.preventDefault(); set_url(ev.target.value)}} type="text" placeholder="URL"/>
                    <DownloadButton type="submit" added={added} loading={loading}/>
                </div>
            </div>
            <p className="text-center">
                {msg}
            </p>
        </form>
    );
};

export default DownloadInput;