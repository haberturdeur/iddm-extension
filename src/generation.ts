// import { getButtonParent } from "./injections/denik";

// type Day = 'PO' | 'ÚT' | 'ST' | 'ČT' | 'PÁ' | 'SO' | 'NE';

// const dayAbbreviationMap: { [key in Day]: number } = {
//     PO: 1,
//     ÚT: 2,
//     ST: 3,
//     ČT: 4,
//     PÁ: 5,
//     SO: 6,
//     NE: 0,
// };

// function generateDays(
//     day: Day,
//     startDate: Date,
//     endDate: Date
// ): Date[] {
//     const result: Date[] = [];
//     const dayOfWeek = dayAbbreviationMap[day];

//     // Create copies of the dates to avoid modifying the originals
//     const currentDate = new Date(startDate.getTime());
//     const finalDate = new Date(endDate.getTime());

//     // Ensure finalDate is set to the end of the day
//     finalDate.setHours(23, 59, 59, 999);

//     while (currentDate <= finalDate) {
//         if (currentDate.getDay() === dayOfWeek) {
//             result.push(new Date(currentDate));
//         }
//         // Move to the next day
//         currentDate.setDate(currentDate.getDate() + 1);
//     }

//     return result;
// }

// async function getTime() {
//     const candidates = Array.from(document.getElementsByClassName('nav-link'));
//     const candidate = candidates.find((candidate) => candidate.textContent?.includes('Dny konání'));
//     if (!candidate) throw new Error('Candidate not found');

//     const response = await fetch((candidate as HTMLLinkElement).href);
//     const text = await response.text();

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, 'text/html');

//     if (doc.getElementsByClassName('text-muted text-truncate my-0')[0].textContent !== 'Dny konání')
//         throw new Error('Unknown page');

//     const entries = Array.from(doc.getElementsByTagName('tbody')[0].getElementsByTagName('tr'));
//     if (entries.length === 0) throw new Error('No entries found');
//     if (entries.length > 1) alert('Multiple entries found. This is not supported yet. Only the first entry will be processed.');

//     const entry = entries[0];

//     const day = entry.getElementsByTagName('td')[0].textContent as Day;
//     const from = entry.getElementsByTagName('td')[1].textContent as string;
//     const to = entry.getElementsByTagName('td')[2].textContent as string;

//     return { day, from, to };
// }

// function translateDate(orig: string): Date {
//     const [day, month, year] = orig.split('.');
//     return new Date(Number(year), Number(month) - 1, Number(day));
// }

// async function getDateRange() {
//     const candidates = Array.from(document.getElementsByClassName('nav-link'));
//     const candidate = candidates.find((candidate) => candidate.textContent === 'Kroužek');
//     if (!candidate) throw new Error('Candidate not found');

//     const response = await fetch((candidate as HTMLLinkElement).href);
//     const text = await response.text();

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, 'text/html');

//     if (doc.getElementsByClassName('text-muted text-truncate my-0')[0].textContent !== 'Oprava kroužku')
//         throw new Error('Unknown page');

//     const from = (doc.getElementsByName('cin_zahajeni')[0] as HTMLInputElement).value; // DD.MM.YYYY
//     const to = (doc.getElementsByName('cin_ukonceni')[0] as HTMLInputElement).value; // DD.MM.YYYY

//     return {
//         from: translateDate(from),
//         to: translateDate(to),
//     };
// }

// function getExistingMeetings(): Date[] {
//     const entries = getDenikEntries();

//     return Array.from(entries).map((entry) => {
//         return translateDate(entry.getElementsByTagName('td')[1].textContent as string);
//     })
// }

// async function createMeeting(date: Date) {
//     const buttonParent = getButtonParent();
//     if (!buttonParent) throw new Error('Parent not found');

//     const button = Array.from(buttonParent.children).find((child) => child.textContent === 'Nová schůzka');
//     if (!button) throw new Error('Button not found');

//     const buttonUrl = (button as HTMLLinkElement).href;
//     const response = await fetch(buttonUrl);
//     const text = await response.text();

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, 'text/html');

//     if (doc.getElementsByClassName('text-muted text-truncate my-0')[0].textContent !== 'Nová schůzka')
//         throw new Error('Unknown page');

//     (doc.getElementById('attendance-absent') as HTMLButtonElement).click();

//     const form = doc.getElementById('diary_add') as HTMLFormElement;
//     form.submit();

//     console.log('Meeting created');
// }

// export default async function generation() {
//     createMeeting(new Date());

//     const { day, from, to } = await getTime();
//     const { from: startDate, to: endDate } = await getDateRange();

//     const existing = getExistingMeetings();
//     const all = generateDays(day, startDate, endDate);

//     const toGenerate: Date[] = [];

//     // Both existing and all are sorted
//     let existingIndex = 0;
//     let allIndex = 0;

//     while (existingIndex < existing.length && allIndex < all.length) {
//         const existingDate = existing[existingIndex];
//         const allDate = all[allIndex];

//         if (existingDate < allDate) {
//             existingIndex++;
//         } else if (existingDate > allDate) {
//             toGenerate.push(allDate);
//             allIndex++;
//         } else {
//             existingIndex++;
//             allIndex++;
//         }
//     }

//     while (allIndex < all.length) {
//         toGenerate.push(all[allIndex]);
//         allIndex++;
//     }
// }
