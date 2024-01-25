function getButtonParent() {
    const candidates = document.getElementsByClassName('btn text-nowrap btn-primary ml-2')
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
        console.log('submit')

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

function addAggregationCard() {
    const card = document.getElementsByClassName('page-section')[0].appendChild(document.createElement('div'))
    card.className = 'row'

    return card
}

async function agregate() {
    const candidates = document.getElementsByTagName('table')
    if (candidates.length === 0) throw new Error('Table not found')
    const table = candidates[0]

    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    if (!rows || rows.length === 0) throw new Error('No rows found')

    const urls: string[] = []
    for (let row of rows) {
        const ref = (row.attributes as any)['data-href'].value
        urls.push(ref)
    }

    const requests = urls.map((url) => fetch(url))
    const responses = await Promise.all(requests)

    const meetings = await Promise.all(responses.map((response) => response.text()))

    const card = addAggregationCard()

    for (let meeting of meetings) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(meeting, 'text/html')
        
        const krouzek = getKrouzek(doc)

        console.log(krouzek)

        card.appendChild(krouzek)
    }
}

export default function inject() {
    // const parent = getButtonParent()
    // if (!parent) throw new Error('Parent not found')

    // const btn = parent?.appendChild(document.createElement('a'))
    // btn.textContent = 'Agreguj schůzky'
    // btn.className = 'btn text-nowrap btn-primary ml-2'
    // btn.addEventListener('click', () => {
    //     agregate()
    // });
    agregate()
}