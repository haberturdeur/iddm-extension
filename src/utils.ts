export async function getDocument(...args: Parameters<typeof fetch>) {
    const response = await fetch(...args);
    const text = await response.text();

    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
}

export function parseDate(dateString: string) {
    // Split the date string into day, month, and year components
    const [day, month, year] = dateString.split('.').map(Number);

    // Create and return a new Date object
    return new Date(year, month - 1, day); // Months are zero-based in JavaScript Date objects
}

export function formatDate(date: Date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based for some fucking reason
    const year = date.getFullYear();

    // Pad the day and month with leading zeros if needed
    const dayPadded = day < 10 ? '0' + day : day;
    const monthPadded = month < 10 ? '0' + month : month;

    return `${dayPadded}.${monthPadded}.${year}`;
}