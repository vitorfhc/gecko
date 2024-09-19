import { Mutex } from 'async-mutex';

let currentTab: chrome.tabs.Tab | null = null
let partialMatch = true
let storageMutex = new Mutex()

function storeFinding(source: Finding) {
    storageMutex.runExclusive(async () => {
        chrome.storage.local.get('findings', (items) => {
            const findings = items.findings || []
            findings.push(source)
            chrome.storage.local.set({ findings })
        })
    })
}

function getFindings(): Promise<Finding[]> {
    return storageMutex.runExclusive(async () => {
        return new Promise<Finding[]>((resolve) => {
            chrome.storage.local.get('findings', (items) => {
                const findings = items.findings || []
                resolve(findings)
            })
        })
    })

}

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
        if (details.url === currentTab.url) {
            return
        }
        const sources = urlToSources(currentTab.url)
        const findings = generateFindings(details.url, sources)
        findings.forEach((finding) => storeFinding(finding))
        // getFindings().then((findings) => contentLog(`Findings: ${JSON.stringify(findings)}`))
    }
}, { urls: ['<all_urls>'] })

enum SourceType {
    QueryValue = 'query',
    QueryValueEncoded = 'query encoded',
    PathValue = 'path',
    PathValueEncoded = 'path encoded',
    UndefinedValue = 'undefined',
    NullValue = 'null',
}

interface Source {
    type: SourceType
    url: string
    value: string
}

interface Finding {
    source: Source
    targetUrl: string
}

function urlToSources(url: string): Source[] {
    const sources: Source[] = []
    const u = new URL(url)

    const query = u.searchParams
    query.forEach((v) => {
        sources.push({
            type: SourceType.QueryValue,
            url: url,
            value: v,
        })

        const encoded = encodeURIComponent(v)
        if (encoded !== v) {
            sources.push({
                type: SourceType.QueryValueEncoded,
                url: url,
                value: encoded,
            })
        }
    })

    const pathParts = u.pathname.split('/')
    pathParts.forEach((part) => {
        sources.push({
            type: SourceType.PathValue,
            url: url,
            value: part,
        })

        const encoded = encodeURIComponent(part)
        if (encoded !== part) {
            sources.push({
                type: SourceType.PathValueEncoded,
                url: url,
                value: encoded,
            })
        }
    })

    const undefinedValue = 'undefined'
    sources.push({
        type: SourceType.UndefinedValue,
        url: url,
        value: undefinedValue,
    })

    const nullValue = 'null'
    sources.push({
        type: SourceType.NullValue,
        url: url,
        value: nullValue,
    })

    return sources.filter((source) => source.value.length > 0)
}

function generateFindings(url: string, sources: Source[]): Finding[] {
    const findings: Finding[] = []
    const pathParts = (new URL(url)).pathname.split('/')

    sources.forEach((source) => {
        pathParts.forEach((part) => {
            const match = partialMatch ? part.includes(source.value) : part === source.value
            if (part.length !== 0 && match) {
                findings.push({
                    source,
                    targetUrl: url,
                })
            }
        })
    })

    return findings
}
