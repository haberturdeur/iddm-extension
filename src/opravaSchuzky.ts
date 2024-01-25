export default function inject() {
    type AttendanceRadios = {
        attending: HTMLInputElement | null,
        absent: HTMLInputElement | null,
    }

    const attendanceRadios: Map<string, AttendanceRadios> = new Map()

    document.querySelectorAll('.attendance').forEach((entry) => {
        if (!entry.firstChild || !entry.firstChild.firstChild || !entry.firstChild.firstChild.textContent || !entry.firstChild.lastChild) return;
        const name = entry.firstChild.firstChild.textContent
        const radios: AttendanceRadios = {
            attending: null,
            absent: null,
        }

        entry.firstChild.lastChild.childNodes.forEach((entry) => {
            const label = entry.lastChild
            const data = entry.firstChild
            if (!label) return
            if (label.textContent === 'přítomen') {
                radios.attending = data as HTMLInputElement
            } else if (label.textContent === 'nepřítomen') {
                radios.absent = data as HTMLInputElement
            }
        })

        attendanceRadios.set(name, radios)
    })

    const all_absent = document.querySelector('#attendance-absent')
    if (!all_absent) return

    const parent = all_absent.parentElement
    if (!parent) throw new Error('Parent not found')

    const all_present = parent.appendChild(document.createElement('span'))
    all_present.textContent = 'Všichni přítomní'
    all_present.role = 'button'
    all_present.id = 'attendance-present'
    all_present.className = 'btn text-nowrap btn-primary ml-2'
    all_present.addEventListener('click', () => {
        attendanceRadios.forEach((radios) => {
            if (radios.attending) radios.attending.checked = true
        })
    })

    const random = parent.appendChild(document.createElement('span'))
    random.textContent = 'Náhodně'
    random.role = 'button'
    random.id = 'attendance-random'
    random.className = 'btn text-nowrap btn-primary ml-2'
    random.addEventListener('click', () => {
        attendanceRadios.forEach((radios) => {
            if (radios.attending && radios.absent) {
                const random = Math.random()
                if (random < 0.75) {
                    radios.attending.checked = true
                } else {
                    radios.absent.checked = true
                }
            }
        })
    })
}
