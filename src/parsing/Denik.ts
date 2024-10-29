import { compareDate, formatDate, getDocument, parseDate } from "../utils";
import { BaseParser } from "./base";
import { getContext, retrieveContext } from "./context";

export enum AttendanceOption {
    Present = 1,
    Absent = 2,
    Excused = 3,
    Late = 4,
};

const attendanceLabels = ['přítomen', 'nepřítomen', 'omluven', 'pozdní příchod'];

export type Attendance = Record<string, AttendanceOption>;

export type DescriptionData = {
    theme: string;
    goal: string;
    description: string;
};

const fieldIds = {
    date: 'densch_datum',
    type: 'densch_typ',
    start: 'densch_zacatek',
    length: 'densch_trvani',
    notes: 'densch_poznamka',
};

export class Description {
    private group: HTMLDivElement;

    constructor(group: HTMLDivElement) {
        this.group = group;
    }

    get fullHTML() {
        return this.group.querySelector('textarea') as HTMLTextAreaElement;
    }

    get labelFullHTML() {
        return this.group.querySelector('label') as HTMLLabelElement;
    }

    get full() {
        return this.fullHTML.value;
    }

    get theme() {
        return this.full.split('\n')[0].split(': ')[1];
    }

    get goal() {
        return this.full.split('\n')[1].split(': ')[1];
    }

    get description() {
        return this.full.split('\n').slice(2).join('\n');
    }

    makeTheme(doc: Document) {
        const themeLabel = doc.createElement('label');
        themeLabel.textContent = 'Téma';
        themeLabel.htmlFor = 'densch_tema';
        themeLabel.className = 'text-muted mb-0';

        const theme = doc.createElement('input');
        theme.type = 'text';
        theme.className = this.fullHTML.className;
        theme.placeholder = 'Téma';
        theme.value = this.theme;

        // Téma group
        const themeGroup = doc.createElement('div');
        themeGroup.className = 'form-group';
        themeGroup.appendChild(themeLabel);
        themeGroup.appendChild(theme);

        return themeGroup;
    }

    makeGoal(doc: Document) {
        const goalLabel = doc.createElement('label');
        goalLabel.textContent = 'Cíl';
        goalLabel.htmlFor = 'densch_cil';
        goalLabel.className = 'text-muted mb-0';

        const goal = doc.createElement('textarea');
        goal.className = this.fullHTML.className;
        goal.placeholder = 'Cíl';
        goal.value = this.goal;

        // Cíl group
        const goalGroup = doc.createElement('div');
        goalGroup.className = 'form-group';
        goalGroup.appendChild(goalLabel);
        goalGroup.appendChild(goal);

        return goalGroup;
    }

    makeDescription(doc: Document) {
        const descriptionLabel = doc.createElement('label');
        descriptionLabel.textContent = 'Popis';
        descriptionLabel.htmlFor = 'densch_popis';
        descriptionLabel.className = 'text-muted mb-0';

        const description = doc.createElement('textarea');
        description.className = this.fullHTML.className;
        description.placeholder = 'Popis';
        description.value = this.description;

        // Popis group
        const descriptionGroup = doc.createElement('div');
        descriptionGroup.className = 'form-group';
        descriptionGroup.appendChild(descriptionLabel);
        descriptionGroup.appendChild(description);

        return descriptionGroup;
    }

    getSplitHTML(doc: Document) {
        this.fullHTML.style.display = 'none';
        this.labelFullHTML.style.display = 'none';

        // append the new elements
        const parent = this.fullHTML.parentElement!;
        parent.appendChild(this.makeTheme(doc));
        parent.appendChild(this.makeGoal(doc));
        parent.appendChild(this.makeDescription(doc));
    }

};

export type EntryData = {
    date: string;
    type: 'Běžná schůzka' | 'Jiná aktivita';
    from: string;
    length: string;
    description: Description;
    notes: string;
    attendance: Attendance;
    lectors: string[];
};

export class Entry implements BaseParser<EntryData> {
    url: string;
    deleter: string | null = null;
    private doc: Document | null = null;
    private _description: Description | null = null;

    get date() {
        return (this.doc?.getElementById('densch_datum') as HTMLInputElement).value
    }

    get type() {
        return (this.doc?.getElementById('densch_typ') as HTMLSelectElement).value as 'Běžná schůzka' | 'Jiná aktivita';
    }

    get from() {
        return (this.doc?.getElementById('densch_zacatek') as HTMLSelectElement).value;
    }

    get length() {
        return (this.doc?.getElementById('densch_trvani') as HTMLSelectElement).value;
    }

    get description() {
        if (!this._description)
            throw new Error('Description not found');

        return this._description;
    }

    get notes() {
        return (this.doc?.getElementById('densch_poznamka') as HTMLTextAreaElement).value;
    }

    get lectors() {
        const elems = this.doc?.querySelectorAll('[id^="denschlek_id_uzivatele_"]');
        if (!elems) return [];
        return Array
            .from(elems)
            .map((elem) => [(elem as HTMLInputElement).value, (elem as HTMLInputElement).checked])
            .filter((elem) => elem[1])
            .map((elem) => elem[0])
            .sort() as string[];
    }

    get attendance(): Attendance {
        throw new Error('Not implemented');
    }

    get htmlNode() {
        return this.doc!.getElementById('diary_edit')!.cloneNode(true) as HTMLFormElement;
    }

    /**
     * @param options.attendance Whether to include attendance - defaults to false
     * @param options.splitDescription Whether to split description into paragraphs - defaults to true
     * @returns HTML representation of the entry
     */
    getHTML(options: { attendance?: boolean, splitDescription?: boolean } = {}) {
        const { attendance = false, splitDescription = true } = options;
        const entry = this.htmlNode;

        if (!attendance) {
            for (let i = 0; i < entry.children.length; i++) {
                if (i < 2 || i > 4)
                    continue
                (entry.children[i] as HTMLDivElement).style.display = 'none'
            }
        }

        if (splitDescription) {
            // hide the original description

        }

        entry.addEventListener('submit', async (event) => {
            event.preventDefault()

            const data = new FormData(entry)
            this.doc = await getDocument(entry.action, {
                method: 'POST',
                body: data,
            });

            entry.replaceWith(this.getHTML(options))
        });

        return entry
    }

    constructor(url: string, deleter?: string | null) {
        this.url = url;
        this.deleter = deleter || null;
    }

    async fetch() {
        this.doc = await getDocument(this.url);
        if (!this.doc) throw new Error('Document not found');
        this._description = new Description(this.doc.getElementById('densch_popis') as HTMLDivElement);
    }

    async update(data: EntryData) {
        throw new Error('Not implemented');
    }

    async delete() {
        if (!this.deleter) throw new Error("Not available");

        console.debug("Deleting entry", this.date);

        const doc = await getDocument(this.deleter);
        const form = doc.getElementById('diary_drop') as HTMLFormElement | null;
        if (!form) throw new Error('Form not found');

        const formData = new FormData(form);
        await getDocument(form.action, {
            method: 'POST',
            body: formData,
        });
    }
};

class NewEntryBuilder {
    static parseAttandance(divs: HTMLDivElement[]) {
        const entries = divs.map((elem: HTMLDivElement): [string, [string, AttendanceOption]] => {
            const name = elem.firstChild?.firstChild?.firstChild?.textContent;
            if (!name)
                throw new Error('Could not parse name');

            const data = elem.querySelector('input');
            console.log(data);
            return [data?.getAttribute('name')!, [name, AttendanceOption.Absent]];
        })

        return Object.fromEntries(entries);
    }

    attendance: Record<string, [string, AttendanceOption]>;
    date: Date = new Date();

    constructor(private form: HTMLFormElement) {
        this.attendance = NewEntryBuilder.parseAttandance(Array.from(form.getElementsByClassName('attendance')) as HTMLDivElement[]);
    }

    buildAttendance() {
        const out: [string, string][] = [];
        Object.entries(this.attendance).forEach(([id, [_, value]]) => {
            // out.push([id, '0'], [id, value.toString()]);
            out.push([id, value.toString()]);
        });
        return out;
    }

    randomAttendance(average: number = 0.75) {
        Object.entries(this.attendance).forEach(([id, _]) => {
            this.attendance[id][1] = Math.random() < average ? AttendanceOption.Present : AttendanceOption.Absent;
        });
    }

    async build() {
        const formData = new FormData(this.form);

        this.buildAttendance().forEach(value => formData.append(...value));

        formData.set('densch_datum', formatDate(this.date));

        console.log(Array.from(formData.entries()));

        const response = await getDocument(this.form.action, {
            method: 'POST',
            body: formData,
        });

        console.log(response);
    }
}

export type DenikData = {
    entries: Entry[];
};

export class Denik implements BaseParser<DenikData> {
    doc: Document | null = null;
    entries: Entry[] = [];

    constructor() {
    }

    async fetch() {
        this.doc = await retrieveContext('Deník');
        await this.getEntries();
    }

    private async getEntries(): Promise<void> {
        if (!this.doc)
            throw new Error('Document not found');

        const candidates = this.doc.getElementsByTagName('table');
        if (candidates.length === 0)
            throw new Error('Table not found');

        const rows = candidates[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        if (!rows || rows.length === 0) throw new Error('No rows found')

        const data: [string, string | null][] = []
        for (let row of rows) {
            const ref: string = (row.attributes as any)['data-href'].value;
            const deleter = (row.lastElementChild as HTMLTableCellElement | null)!.lastElementChild as HTMLAnchorElement | null;
            data.push([ref, deleter!.href]);
        }

        this.entries = data.map(([url, deleter]) => new Entry(url, deleter));
        const requests = this.entries.map((entry) => entry.fetch());
        await Promise.all(requests);
    }

    async update(data: DenikData) {
        throw new Error('Not implemented');
    }

    async getMissingEntries(upTo?: Date) {
        const doc = await retrieveContext('Kroužek', this.doc || undefined);
        if (!doc) throw new Error('Document not found');

        const _startDate = doc.getElementById('cin_zahajeni')!.getAttribute('value');
        const _endDate = doc.getElementById('cin_ukonceni')!.getAttribute('value');

        const startDate = parseDate(_startDate!);
        const endDate = upTo || parseDate(_endDate!);

        const occupiedDates = this.entries.map((entry) => entry.date);
        const missingDates = [];

        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 7)) {
            if (!occupiedDates.includes(formatDate(date))) {
                missingDates.push(structuredClone(date));
            }
        }

        return missingDates;
    }

    async generateMissingEntries(randomAttendance?: boolean, endDate?: Date) {
        const promises = (await this.getMissingEntries(endDate)).map(async (date) => {
            const builder = await this.newEntry();
            builder.date = date;
            if (randomAttendance)
                builder.randomAttendance();
            await builder.build();
        });

        await Promise.all(promises);
    }

    async deleteOverflowEntries(startDate: Date = new Date()) {
        const occupiedDates = this.entries.map((entry) => entry.date);

        const _startDate = formatDate(startDate);
        const overflowEntries = this.entries.filter((entry) => compareDate(parseDate(entry.date), parseDate(_startDate))  < 0);
        const promises = overflowEntries.map((entry) => entry.delete());

        await Promise.all(promises);
    }

    async newEntry() {
        console.log('New entry');
        const context = await retrieveContext('Deník');
        if (!context)
            throw new Error('Context not found');

        const newEntryUrl =
            (
                context.evaluate('//a[contains(., "Nová schůzka")]', context, null, XPathResult.ANY_TYPE, null)
                    .iterateNext() as HTMLAnchorElement | null
            )?.href;
        if (!newEntryUrl)
            throw new Error('New entry URL not found');

        const form = (await getDocument(newEntryUrl)).getElementById("diary_add") as HTMLFormElement | null;
        if (!form)
            throw new Error('Form not found');

        return new NewEntryBuilder(form);
    }
}
