import { native_fetch } from '.'
import { HPX_CLIENT_NAME, BACKGROUND_STATE } from '../constants'

export const getJson = (msg) => {
    return JSON.parse(msg)
}

interface FetchInit extends Omit<RequestInit, 'body'> {
    body?: string | object
    json?: boolean
}

export const fetch = (url, props: FetchInit = {}) => {
    let def_props: FetchInit = {
        credentials: "include",
        method: 'post',
    }

    if (props.json || typeof props.body === 'object') {
        def_props.headers = Object.assign(def_props.headers || {}, props.headers || {}, {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        
        if (typeof props.body !== 'string') {
            props.body = JSON.stringify(props.body)
        }
    }
    
    delete props.json
    
    let fetch_props: RequestInit = Object.assign(def_props, props)

    return native_fetch(url, fetch_props)
}

export const callFunction = (name: string, args: object, {session = undefined as string, server = undefined as string} = {}) => {
    let prepared_data = {
        session: session || BACKGROUND_STATE.session,
        name: HPX_CLIENT_NAME,
        data: [{fname: name, ...args}]
    }
    return fetch(server || BACKGROUND_STATE.server, {method:"post", json: true, body: prepared_data}).then(async (r) => {
        let d
        if (r.ok) {
            let r_data = await r.json()
            if (!r_data.error && r_data.data) {
                d = r_data.data
                if (Array.isArray(d)) {
                    d = d[0]
                }
            } else {
                console.log(r_data)
                // do something
            }
        }
        return d
    })
}