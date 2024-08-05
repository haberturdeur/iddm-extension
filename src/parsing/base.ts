export type BaseParser<Data extends Record<string, any>> = Data & {
    fetch(): Promise<void>;
    update(data: Data): Promise<void>;
}
