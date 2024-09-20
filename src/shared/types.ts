enum SourceType {
    QueryValue = 'Query Parameter',
    QueryValueEncoded = 'Query Parameter (URL encoded)',
    PathValue = 'Path',
    PathValueEncoded = 'Path (URL encoded)',
    UndefinedValue = 'Undefined Variable',
    NullValue = 'Null Variable',
}

interface Source {
    type: SourceType
    url: string
    value: string
}

interface Target {
    url: string
}

interface Finding {
    source: Source
    target: Target
}

interface FindingUI {
    index: number;
    finding: Finding;
    croppedSourceUrl: string;
    croppedTargetUrl: string;
}

export { SourceType, Source, Finding, FindingUI }