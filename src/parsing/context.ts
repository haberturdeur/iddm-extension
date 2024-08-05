import { getDocument } from "../utils";

const mainMenuContexts = [
    'Kroužek',
    'Přihlášky',
    'Lektoři',
    'Deník',
    'Dny konání',
    'Rezervace',
    'Dokumenty',
    'Obrázky',
] as const;

const subMenuContexts = [
    'Oprava schůzky',
    'Nová schůzka',
] as const;

const contexts = [...mainMenuContexts, ...subMenuContexts] as const;

export type MainMenuContext = typeof mainMenuContexts[number];
export type SubMenuContext = typeof subMenuContexts[number];
export type Context = typeof contexts[number];

function isMainMenuContext(candidate: string): candidate is MainMenuContext {
    return mainMenuContexts.includes(candidate as MainMenuContext);
}

function isSubMenuContext(candidate: string): candidate is SubMenuContext {
    return subMenuContexts.includes(candidate as SubMenuContext);
}

export function getContext(doc: Document = document): Context {
    const decider = document.getElementsByClassName('text-muted text-truncate my-0')[0].textContent;
    if (!decider)
        throw new Error('Unknown page');

    if (contexts.includes(decider as Context))
        return decider as Context;

    throw new Error('Unknown page');
}

async function switchMainMenu(target: MainMenuContext): Promise<Document> {
    const candidates = Array.from(document.getElementsByClassName('nav-link'));
    const candidate = candidates.find((candidate) => candidate.textContent === 'Kroužek');
    if (!candidate) throw new Error('Candidate not found');

    return await getDocument((candidate as HTMLLinkElement).href);
}

async function returnToMainMenu(origin: Document = document): Promise<Document> {
    if (mainMenuContexts.includes(getContext(origin) as MainMenuContext))
        return origin;

    switch (getContext(origin)) {
        case 'Oprava schůzky':
        case 'Nová schůzka':
            const candidates = Array.from(origin.getElementsByClassName('btn text-nowrap btn-secondary ml-2'));
            const candidate = candidates.find((candidate) => candidate.tagName === 'A');
            if (!candidate) throw new Error('Candidate not found');

            return await getDocument((candidate as HTMLLinkElement).href);

        default:
            throw new Error('Unknown page');
    }
}

export async function retrieveContext(target: MainMenuContext, origin: Document = document): Promise<Document> {
    let doc = origin;
    let current = getContext(doc);
    if (current === target)
        return doc;

    doc = await returnToMainMenu(doc);
    current = getContext(doc);

    if (current === target)
        return doc;

    if (isMainMenuContext(target))
        return switchMainMenu(target as MainMenuContext);

    throw new Error('Unknown page');
}
