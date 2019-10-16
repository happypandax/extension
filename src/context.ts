import React from 'react';

import { BACKGROUND_STATE } from './constants'

export interface ConnectOpts {
    server?: string
    session?: string
    username?: string
    password?: string
}

export const AppContext = React.createContext({
    server: BACKGROUND_STATE.server,
    session: BACKGROUND_STATE.session,
    connected: false,
    onConnect: (state, opt?: ConnectOpts) => {},
    setError: (error: string) => {}
})