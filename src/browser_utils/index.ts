export const askSitePermission = async (site: string | string[]) => {
    if (browser) {
        let s
        if (typeof site === 'string') {
            s = [site]
        }
        return await browser.permissions.request({origins: s})
    }
    return false
}

export const hasSitePermission = async (site: string) => {
    if (browser) {
        return await browser.permissions.contains({origins: [site]})
    }
    return false
}

export const askPermission = async (p: browser.permissions.Permission[]) => {
    if (browser) {
        return await browser.permissions.request({permissions: p})
    }
    return false
}

export const hasPermission = async (p: browser.permissions.Permission[]) => {
    if (browser) {
        return await browser.permissions.contains({permissions: p})
    }
    return false
}

export const askTabsPermission = () => askPermission(["tabs"])
export const hasTabsPermission = async () => hasPermission(["tabs"])

export const askWebNavPermission = () => askPermission(["webNavigation"])
export const hasWebNavPermission = async () => hasPermission(["webNavigation"])

export const reload = () => {
    if (browser) {
        browser.runtime.reload()
    }
}

export const loadContentScript = async (matcher: string, script: string) => {
    if (await hasSitePermission(matcher) && script) {
      browser.contentScripts.register({
        "matches": [matcher],
        "js": [{code: script}]
      })
      return true
    }
    return false
}

export const getStorageValue = async (keys: string | string[]) => {
    let single = typeof keys === "string"
    if (browser) {

        let r = await browser.storage.local.get(keys)
        return single ? r[keys as string] : r as object
    }
    return single ? undefined : {}
}

export const clearStorage = async () => {
    if (browser) {
        return await browser.storage.local.clear()
    }
}


export const setStorageValue = async (values: browser.storage.StorageObject) => {
    if (browser) {
        return await browser.storage.local.set(values)
    }
}

export const getActiveTabUrl = async () => {
    if (browser) {
        let tabs = await browser.tabs.query({currentWindow: true, active: true})
        let t = tabs[0]
        return t ? t.url : ""
    }
    return ""
}

export const getActiveTabId = async () => {
    if (browser) {
        let tabs = await browser.tabs.query({currentWindow: true, active: true})
        let t = tabs[0]
        return t ? t.id : undefined
    }
    return undefined
}

export const getBagde = async ({ text = true, activeTab = true } = {}) => {
    return {
        text: text ? await browser.browserAction.getBadgeText({tabId: activeTab ? await getActiveTabId() : undefined}) : undefined
    }
}

export const setBadge = async ({text = undefined as string, color = undefined as string, background = undefined as string, activeTab = true} = {}) => {
    browser.browserAction.setBadgeBackgroundColor({color: background || "white", tabId: activeTab ? await getActiveTabId() : undefined})
    browser.browserAction.setBadgeTextColor({color: color || "black",  tabId: activeTab ? await getActiveTabId() : undefined})
    if (text !== undefined) {
        browser.browserAction.setBadgeText({text,  tabId: activeTab ? await getActiveTabId() : undefined})
    }
}