import React from 'react';

import { HPX_SERVER, DEFAULT_HPX_OPTS } from './constants'

export interface ConnectOpts {
    server?: string
    session?: string
    username?: string
    password?: string
}

export const AppContext = React.createContext({
    server: HPX_SERVER,
    session: DEFAULT_HPX_OPTS.session,
    connected: false,
    onConnect: (state, opt?: ConnectOpts) => {}
})