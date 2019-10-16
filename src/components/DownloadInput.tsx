import React, { useState, useEffect, useContext } from 'react';
import { callFunction, downloadUrl } from '../utility/request';
import { getActiveTabUrl } from '../browser_utils';
import sites from '../sites';

// browser.commands.onCommand.addListener(function (command) {
//     if (command === "download-this-gallery") {
//       console.log("Downloading this gallery");
//     }
//   });
  
export const getGalleryUrl = async () => {
    let u = await getActiveTabUrl()
    let r = ""
    for (let m in sites) {
        if (sites[m].gallery) {
            let reg = new RegExp(sites[m].gallery)
            if (reg.test(u)) {
                r = u
                break
            }
        }
    }
    return r
}

export const DownloadButton = ({ added = false, loading = false, children = undefined, ...props}) => {

    return (
        <button {...props} className={`ui basic button ${!children ? "icon" : ""} ${added ? "green" : "primary"} ${loading ? "loading" : ""}`}>
            <i className={`icon ${added ? "check" : "download"}`}></i>
            {children}
        </button>
    );
};

export const DownloadCurrentUrlButton = () => {

    const [added, set_added] = useState(false)
    const [loading, set_loading] = useState(false)

    return (
        <DownloadButton added={added} loading={loading} onClick={async ev => {
            ev.preventDefault()
            let current_url = await getGalleryUrl()
            if (current_url) {
                set_loading(true)
                downloadUrl([current_url]).then(r => {
                    set_loading(false)
                    set_added(r)
                })
            }
        }}>
            {added ? "Sent!" : "Download this gallery"}
        </DownloadButton>
    );
};

const DownloadInput = () => {

    const [url, set_url] = useState("")
    const [msg, set_msg] = useState("")
    const [added, set_added] = useState(false)
    const [loading, set_loading] = useState(false)


    useEffect(() => {(async () => {
        if (!url) {
            set_url(await getActiveTabUrl())
        }
    })()
    }, [])


    return (
        <form className="ui form" onSubmit={ev => {
            ev.preventDefault()
            set_added(false)
            if (url) {
                set_loading(true)
                downloadUrl([url]).then(r => {
                    set_loading(false)
                    if (r) {
                        set_url("")
                        set_added(true)
                    }
                }).catch(err => {set_loading(false); set_msg(err.message)})
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