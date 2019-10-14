import React, { useCallback, useState } from 'react';
import hpxsvg from '../misc/happypandax.svg'
import ConnectForm from './ConnectForm';
import { AppContext, ConnectOpts } from '../context';
import { HPX_SERVER, DEFAULT_HPX_OPTS } from '../constants'
import { callFunction } from '../utility/request';
import DownloadInput, { DownloadCurrentUrlButton } from './DownloadInput';
import './App.css';

const CheckExists = () => {

  const [exists, set_exists] = useState(undefined)
  const [loading, set_loading] = useState(false)

  return (
      <div className={`ui basic button ${loading ? "loading" : ""} ${exists === true ? "green" : exists === false ? "red" : "teal"}`} onClick={ev => {
          ev.preventDefault()
          let current_url = window.location.href
          set_loading(true)
          callFunction("gallery_exists", {url: current_url}).then(r => {
              set_loading(false)
              if (!r.error) {
                  if (r.data === true) { 
                    set_exists(true)
                  } else if (r.data === false) {
                    set_exists(false)
                  }
              } else {
              }
          })
      }}>
          <i className={`icon ${exists === true ? "thumbs up" : exists === false ? "close" : "question"}`}></i>
          {exists === true ? "Gallery exists" : exists === false ? "Gallery does not exist" : "Check if this gallery exists"}
      </div>
  );
};

function App() {

  const [connected, set_connected] = useState(false)
  const [server, set_server] = useState(HPX_SERVER)
  const [session, set_session] = useState("")

  const onConnect = (state, opts: ConnectOpts) => {
      set_connected(state)
      if (opts) {
        DEFAULT_HPX_OPTS.server = opts.server || server
        DEFAULT_HPX_OPTS.session = opts.session || session
        
        set_server(DEFAULT_HPX_OPTS.session)
        set_session(DEFAULT_HPX_OPTS.session)
      }

  }

  return (
    <AppContext.Provider value={{
      server,
      session,
      onConnect,
      connected
    }}>
      <div className="ui segment browser-popup">
        <div className="text-center">
          <img src={hpxsvg} className={`hpx-logo ${connected ? 'small' : ''}`} alt="logo" />
        </div>
        {!connected && <ConnectForm/>}
        {connected && <div>
          <DownloadCurrentUrlButton/>
          <CheckExists/>
          <div className="ui horizontal divider">Or</div>
          <DownloadInput/>
        </div>}
      </div>
    </AppContext.Provider>
  );
}

export default App;
