let currentTab: chrome.tabs.Tab | null = null
let partialMatch = true

function contentLog(message: string) {
    chrome.scripting.executeScript({
        target: { tabId: currentTab?.id || 0 },
        func: (message) => {
            console.log(message)
        },
        args: [message],
    })
}

function updateCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            currentTab = tabs[0]
        }
    })
}

chrome.tabs.onActivated.addListener(updateCurrentTab)
chrome.tabs.onUpdated.addListener(updateCurrentTab)

updateCurrentTab()

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (currentTab && currentTab.url) {
        const sources = urlToSources(currentTab.url)
        contentLog(`Sources: ${JSON.stringify(sources)}`)
        const sinks = findSinks(details.url, sources)
        sinks.length && contentLog(`Sinks: ${JSON.stringify(sinks)}`)
    }
}, { urls: ['<all_urls>'] })

enum SourceType {
    QueryValue = 'query value',
    QueryValueEncoded = 'query value encoded',
    PathValue = 'path value',
    PathValueEncoded = 'path value encoded',
    UndefinedValue = 'undefined value',
    NullValue = 'null value',
}

interface Source {
    type: SourceType
    value: string
}

function urlToSources(url: string): Source[] {
    const sources: Source[] = []
    const u = new URL(url)

    const query = u.searchParams
    query.forEach((v) => {
        sources.push({
            type: SourceType.QueryValue,
            value: v,
        })

        const encoded = encodeURIComponent(v)
        if (encoded !== v) {
            sources.push({
                type: SourceType.QueryValueEncoded,
                value: encoded,
            })
        }
    })

    const pathParts = u.pathname.split('/')
    pathParts.forEach((part) => {
        sources.push({
            type: SourceType.PathValue,
            value: part,
        })

        const encoded = encodeURIComponent(part)
        if (encoded !== part) {
            sources.push({
                type: SourceType.PathValueEncoded,
                value: encoded,
            })
        }
    })

    const undefinedValue = 'undefined'
    sources.push({
        type: SourceType.UndefinedValue,
        value: undefinedValue,
    })

    const nullValue = 'null'
    sources.push({
        type: SourceType.NullValue,
        value: nullValue,
    })

    return sources.filter((source) => source.value.length > 0)
}

function findSinks(url: string, sources: Source[]): Source[] {
    const sinks: Source[] = []
    const pathParts = (new URL(url)).pathname.split('/')

    sources.forEach((source) => {
        pathParts.forEach((part) => {
            const match = partialMatch ? part.includes(source.value) : part === source.value
            if (part.length !== 0 && match) {
                sinks.push(source)
            }
        })
    })

    return sinks
}
