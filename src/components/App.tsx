import React, { useContext, useState, useEffect } from 'react';
import hpxsvg from '../misc/happypandax.svg'
import ConnectForm from './ConnectForm';
import { AppContext, ConnectOpts } from '../context';
import { IS_POPUP_CONTEXT, IS_BACKGROUND_CONTEXT, DEBUG, MESSAGES, BACKGROUND_STATE, HPX_CONTEXTMENU_DOWNLOAD_THIS_GALLERY_ID } from '../constants'
import { callFunction, downloadUrl } from '../utility/request';
import DownloadInput, { DownloadCurrentUrlButton, getGalleryUrl } from './DownloadInput';
import { ErrorMessage } from './Misc';
import { askSitePermission, askTabsPermission, hasTabsPermission, hasSitePermission, reload, loadContentScript, getStorageValue, setStorageValue, clearStorage, hasWebNavPermission, askWebNavPermission, getActiveTabId, setBadge, getBagde, getActiveTabUrl } from '../browser_utils';
import sites from '../sites'

import './App.css';

const DisconnectButton = () => {
  const appcontext = useContext(AppContext)

  return (
    <button className="ui button mini icon" onClick={ev => {
      ev.preventDefault();
      appcontext.onConnect(false)
      setStorageValue({
        username: "",
        password: ""
      })
      }}>
      <i className="sign-out flipped icon"></i>
    </button>
  )
}

const SupportedSites = () => {

  const s = Object.keys(sites).join(" | ")

  return (
    <div className="ui label" data-tooltip={s} data-position="top left">
      <i className="globe icon"></i>
      Sites
    </div>
  )
}

const Footer = () => {
  const appcontext = useContext(AppContext)

  return (
    <div className="ui segment secondary">
      {appcontext.connected && <DisconnectButton/>}
      <SupportedSites/>
      <a className="ui label" href="https://github.com/happypandax/extension/issues">
        <i className="bug icon"></i> Find an issue?
      </a>
      <a className="ui label basic float-right" href="https://github.com/happypandax/extension">
        <i className="code icon"></i> Source
      </a>
      <a className="ui label basic teal float-right" href="https://github.com/happypandax/happypandax">
        <i className="github icon"></i> HappyPanda X
      </a>
    </div>
  )
}

const DebugFooter = () => {
  const appcontext = useContext(AppContext)

  return (
    <div className="ui segment tertiary">
      <button className="ui button basic mini" onClick={clearStorage}>Clear storage</button>
    </div>
  )
}

const checkGalleryUrlExists = async (url: string, recheck=true) => {
  let r = await callFunction("gallery_exists", {url})
  if (!r.error) {
    if (r.data === true) {
      return true
    } else if (r.data === false) {
      if (recheck) {
        if (url.includes("e-hentai.org/g/")) {
          return await checkGalleryUrlExists(url.replace("e-hentai.org/g/", "exhentai.org/g/"), false)
        } else if (url.includes("exhentai.org/g/")) {
          return await checkGalleryUrlExists(url.replace("exhentai.org/g/", "e-hentai.org/g/"), false)
        }
      }
    }
  } 
  return false
}

const CheckExists = () => {

  const [exists, set_exists] = useState(undefined)
  const [loading, set_loading] = useState(false)

  const check = async (ev, url: string) => {
    if (ev) ev.preventDefault();
    let current_url = url || await getGalleryUrl()
    if (current_url) {
      set_loading(true)
      let r = await checkGalleryUrlExists(current_url)
      set_exists(r)
      set_loading(false)
      updateGalleryStatus()
    }
  }

  useEffect(() => {
    getGalleryUrl().then(r => {
      if (r) {
        check(null, r)
      }
    })
  }, [])

  return (
      <button className={`ui basic button ${loading ? "loading" : ""} ${exists === true ? "green" : exists === false ? "red" : "teal"}`} onClick={ev => check(ev, undefined)}>
          <i className={`icon ${exists === true ? "thumbs up" : exists === false ? "close" : "question"}`}></i>
          {exists === true ? "Gallery already exists" : exists === false ? "Gallery does not exist" : "Check if this gallery exists"}
      </button>
  );
};

const NotAvailable = () => {
  return (
    <div className="ui placeholder segment not-available">
      <div className="ui icon header muted">
        <i className="dont icon"></i>
        Not available
      </div>
    </div>
  )
}

const Buttons = () => {

  const [available, set_available] = useState(false)

  useEffect(() => {
    getGalleryUrl().then(r => set_available(!!r))
  }, [])

  return (
    <>
    {available && <DownloadCurrentUrlButton/>}
    {available && <CheckExists/>}
    {!available && <NotAvailable/>}
    </>
  )
}

const PermissionsSegment = ({show = false, onGrant = undefined, children = undefined}) => {
  const appcontext = useContext(AppContext)

  return (
    <>
    {show &&
      <div className="ui segment red secondary">
        <span>
          {children}
          <span className="ml-2">
          <button className="ui button mini" ref={r => ( r.addEventListener('click', ev => {
            ev.preventDefault();
            if (onGrant) {
              try {
                onGrant(true)
              } catch (err) {
                appcontext.setError(err.message)
              }
            }
          }))}>Grant</button>
          <button className="ui button mini" onClick={ev => {
            ev.preventDefault();
            if (onGrant) {
              try {
                onGrant(false)
              } catch (err) {
                appcontext.setError(err.message)
              }
            }
          }}>Deny</button>
          </span>
        </span>
      </div>
    }
    </>
  )
}

const AskTabsPermission = () => {
  const [perm, set_perm] = useState(true)
  useEffect(() => {
    hasTabsPermission().then(r => set_perm(r))
  }, [])

  return (
    <PermissionsSegment show={!perm} onGrant={(s) => {
      if (s) {
        askTabsPermission().then(r => {
          if (r) {
            set_perm(true)
          }
        })
      }
    }}>
      This extension requires permission to access your tabs to be able to access your tab's URL
    </PermissionsSegment>
  )
}

const AskWebNavPermission = () => {
  const [perm, set_perm] = useState(true)
  useEffect(() => {
    hasWebNavPermission().then(r => set_perm(r))
  }, [])

  return (
    <PermissionsSegment show={!perm} onGrant={(s) => {
      if (s) {
        askWebNavPermission().then(r => {
          if (r) {
            set_perm(true)
          }
        })
      }
    }}>
      This extension requires permission to access navigation to know when a supported URL is encountered
    </PermissionsSegment>
  )
}

const AskSitePermission = () => {
  const site = "*://e-hentai.org/*"
  const [perm, set_perm] = useState(true)
  useEffect(() => {
    hasSitePermission(site).then(r => set_perm(r))
  }, [])

  return (
    <PermissionsSegment show={!perm} onGrant={async (s) => {
      if (s) {
        if (await askSitePermission(site)) {
          set_perm(true)
          await loadContentScript(site, sites[site].code)
        }
      }
    }}>
      Grant this extension the permission to access this site?
    </PermissionsSegment>
  )
}

const AskAllSitesPermission = () => {
  const key = "all_sites_permission_denied"
  const [denied, set_denied] = useState(true)
  const [perm, set_perm] = useState(true)
  useEffect(() => {(async () => {
    let s = true
    for (let m in sites) {
      if (!await hasSitePermission(m)) {
        s = false
        break
      }
    }
    set_perm(s)
    set_denied(await getStorageValue(key) as boolean || false)
  })()}, [])

  return (
    <PermissionsSegment show={!perm && !denied} onGrant={async (s) => {
      if (s) {
        if (await askSitePermission(Object.keys(sites))) {
          set_perm(true)
          loadContentScripts()
        }
      } else {
        set_denied(true)
        let o = {}
        o[key] = true
        setStorageValue(o)
      }
    }}>
      Grant this extension the permission to access all the supportes sites?
    </PermissionsSegment>
  )
}

const loadContentScripts = async () => {
  for (let matcher in sites) {
    await loadContentScript(matcher, sites[matcher].code)
  }
}

const updateGalleryStatus = async () => {
  let u = await getGalleryUrl()
  if (u) {
    if (await checkGalleryUrlExists(u)) {
      await setBadge({text: "✔", color: "green", background: ""})
    } else {
      await setBadge({text: "1", color: "", background: ""})
    }
  }
}

const onContextMenu = (info: browser.menus.OnClickData, tab: browser.tabs.Tab) => {
  if (info.menuItemId === HPX_CONTEXTMENU_DOWNLOAD_THIS_GALLERY_ID) {
    let url = info.linkUrl || info.pageUrl
    if (url) {
      for (let m in sites) {
        let s = sites[m]
        if (!s._gallery) {
          s._gallery = new RegExp(s.gallery)
        }
        if (s._gallery.test(url)) {
          checkGalleryUrlExists(url).then(r => {
            if (!r) {
              downloadUrl([url])
              setBadge({text: "S", color: "green", background:""})
            } else {
              setBadge({text: "E", color: "red", background:""})
            }
          })
        }
      }
    }
  }
}

const onSiteNav = async (site: any, details: any) => {
  let visited_sites = await getStorageValue("visited_sites") as any || []
  if (!visited_sites.includes(site.test)) {
    await setBadge({text: "!", color: "red", background: ""})
  } else {
    if (BACKGROUND_STATE.connected) {
      await updateGalleryStatus()
    }
  }
}

// remember: no async
const onPopupMessage = (msg) => {
  if (msg.setState) {
    Object.assign(BACKGROUND_STATE, msg.setState)
  }
}

// remember: no async
const onBgMessage = (msg) => {
  if (msg.setState) {
    Object.assign(BACKGROUND_STATE, msg.setState)
  }
}

let _setup = false

const App = () => {
  
  const [connected, set_connected] = useState(BACKGROUND_STATE.connected)
  const [server, set_server] = useState(BACKGROUND_STATE.server)
  const [session, set_session] = useState(BACKGROUND_STATE.session)
  const [version, set_version] = useState("")
  const [error, set_error] = useState("")
  const [header_text, set_header_text] = useState("")
  const [ready, set_ready] = useState(IS_POPUP_CONTEXT ? false : true)

  useEffect(() => {
    if (!connected && ready) {
      setBadge({text:"Off", color:"black", background: "red"})
    } else if (ready) {
      getBagde({text: true}).then(b => {
        if (b.text === 'Off') {
          setBadge({text:"", color:"", background: ""})
        }
      })
    }
  }, [connected, ready])
  
  useEffect(() => {(async () => {
    try {
      if (!_setup) {
        _setup = true
        if (browser) {
            if (IS_POPUP_CONTEXT) {
              // setup message channel to background page
              browser.runtime.onConnect.addListener(p => {
              if (p.name === "background") {
                setTimeout(() => {
                  set_session(BACKGROUND_STATE.session)
                  set_connected(BACKGROUND_STATE.connected)
                  set_server(BACKGROUND_STATE.server)
                  set_ready(true)
                }, 100)
              }})
              MESSAGES.background = browser.runtime.connect({name:"popup"})
              MESSAGES.background.onMessage.addListener(onPopupMessage)
              MESSAGES.background.postMessage({setState: {popup_connected: true}})

              // reset bagde on first time site visit
              if ((await getBagde()).text === '!') {
                setBadge({text: "", color: ""})
                for (let m in sites) {
                  if (new RegExp(sites[m].test).test(await getActiveTabUrl())) {
                    let visited_sites = await getStorageValue("visited_sites") as any || []
                    visited_sites.push(sites[m].test)
                    setStorageValue({visited_sites})
                  }
                }
                set_header_text("This site is supported!")
              }

            }
            
            if (IS_BACKGROUND_CONTEXT) {
              // setup message channel to popup page page
              browser.runtime.onConnect.addListener(p => {
                if (p.name === "popup") {
                  MESSAGES.popup = p
                  p.onMessage.addListener(onBgMessage)
                  browser.runtime.connect({name:"background"})
                  setTimeout(() => {
                    MESSAGES.popup.postMessage({setState: BACKGROUND_STATE})
                  }, 50)
                }
              })

              await loadContentScripts()

              browser.runtime.onUpdateAvailable.addListener(() => { reload() })
              for (let m of Object.keys(sites)) {
                browser.webNavigation.onDOMContentLoaded.addListener(r => onSiteNav(sites[m], r), {url: [{urlMatches: sites[m].test}]})
              }

              browser.menus.create({
                id: HPX_CONTEXTMENU_DOWNLOAD_THIS_GALLERY_ID,
                title: "Download this gallery",
                contexts: ["bookmark", "link", "page", "tab"],
                onclick: onContextMenu,
                documentUrlPatterns: Object.keys(sites),
                targetUrlPatterns: Object.keys(sites),
              }, () => {
                if (browser.runtime.lastError)
                  console.error(`failed to create context menu: ${browser.runtime.lastError}`)
              })
                

          }

          let manifest = browser.runtime.getManifest()
          set_version(manifest.version)
        }
      }
    } catch (err) {
      set_error(err.message)
      if (IS_BACKGROUND_CONTEXT) {
        console.error(err)   
      }
    }
  })()}, [])

  const onConnect = (state, opts: ConnectOpts) => {
      set_connected(state)
      BACKGROUND_STATE.connected = state
      if (IS_POPUP_CONTEXT) {
        MESSAGES.background.postMessage({setState: {connected: state}})
      }

      if (opts) {
        BACKGROUND_STATE.server = opts.server || server
        BACKGROUND_STATE.session = opts.session || session
        
        set_server(BACKGROUND_STATE.server)
        set_session(BACKGROUND_STATE.session)

        if (IS_POPUP_CONTEXT) {
          MESSAGES.background.postMessage({setState: {session: BACKGROUND_STATE.session, server: BACKGROUND_STATE.server}})
        }

        if (BACKGROUND_STATE.connected) {
          callFunction("set_config", {cfg: {
            "download.skip_if_downloaded_before": false,
          }})
        }

      }

  }

  return (
    <AppContext.Provider value={{
      setError: set_error,
      server,
      session,
      onConnect,
      connected,
    }}>
      <>
        {ready &&
        <div className="ui segments browser-popup">
          {header_text && <div className="ui mini basic label green">{header_text}</div>}
          {version && <div className="ui top right attached mini basic label">{version}</div>}
          <div className="ui segment clearing">
            <div className="text-center">
              <img src={hpxsvg} className={`hpx-logo ${connected ? 'small' : ''}`} alt="logo" />
            </div>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {connected && IS_POPUP_CONTEXT && <AskTabsPermission/>}
            {connected && IS_POPUP_CONTEXT && <AskWebNavPermission/>}
            {connected && IS_POPUP_CONTEXT && <AskAllSitesPermission/>}
            {connected && IS_POPUP_CONTEXT && <AskSitePermission/>}
            {!connected && <ConnectForm/>}
            {connected && <div>
              <Buttons/>
              <div className="ui horizontal divider">Or</div>
              <DownloadInput/>
            </div>}
          </div>
          <Footer/>
          {DEBUG && <DebugFooter/>}
        </div>
        }
      </>
    </AppContext.Provider>
  );
}

export default App;
