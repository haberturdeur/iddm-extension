// import generation from '../generation';
import { Denik } from '../parsing/Denik';
import { formatDate } from '../utils';

const denik = new Denik();

export function getButtonParent(doc: Document) {
    const candidates = doc.getElementsByClassName('btn text-nowrap btn-primary ml-2')
    for (let candidate of candidates) {
        if (candidate.textContent === 'Nová schůzka') {
            return candidate.parentElement
        }
    }
    return null
}

function getKrouzek(doc: Document): HTMLElement {
    const entry = doc.getElementById('diary_edit')!.cloneNode(true) as HTMLFormElement;
    for (let i = 0; i < entry.children.length; i++) {
        if (i < 2 || i > 4)
            continue
        (entry.children[i] as HTMLDivElement).style.display = 'none'
    }

    entry.addEventListener('submit', async (event) => {
        event.preventDefault()

        const data = new FormData(entry)
        const response = await fetch(entry.action, {
            method: 'POST',
            body: data,
        });

        const text = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')

        entry.replaceWith(getKrouzek(doc))
    });

    return entry
}

function addAggregationCard(doc: Document) {
    const card = doc.getElementsByClassName('page-section')[0].appendChild(document.createElement('div'))
    card.className = 'row'

    return card
}

async function agregate(doc: Document) {
    const card = addAggregationCard(doc);

    denik.entries.forEach((entry) => {
        card.appendChild(entry.getHTML());
    });
}

function addCheckButton(doc: Document) {
    const parent = getButtonParent(doc)
    if (!parent) throw new Error('Parent not found')

    const btn = parent?.appendChild(doc.createElement('a'))
    btn.textContent = 'Ověř schůzky'
    btn.className = 'btn text-nowrap btn-primary ml-2'
    btn.addEventListener('click', async () => {
        const missing = await denik.getMissingEntries();
        let message = `Chybějící schůzky: ${missing.length}`;
        missing.forEach((entry) => {
            message += `\n${formatDate(entry)}`;
        });
        alert(message);
    });
}

function addGenerationButton(doc: Document) {
    const parent = getButtonParent(doc)
    if (!parent) throw new Error('Parent not found')

    const btn = parent?.appendChild(doc.createElement('a'))
    btn.textContent = 'Vygeneruj schůzky'
    btn.className = 'btn text-nowrap btn-primary ml-2'
    btn.addEventListener('click', async () => {
        await denik.generateMissingEntries();
        location.reload();
    });
}

export default async function inject(doc: Document) {
    await denik.fetch();
    console.log(denik);
    addCheckButton(doc);
    addGenerationButton(doc);
    agregate(doc);
}