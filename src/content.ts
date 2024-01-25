import opravaSchuzky from './opravaSchuzky';
import denik from './denik';

function main() {
    // This is a sub-header which conveniently tells us what we are looking at
    const decider = document.getElementsByClassName('text-muted text-truncate my-0')[0].textContent;
    switch (decider) {
        case 'Deník':
            denik();
            break;
        case 'Oprava schůzky':
            opravaSchuzky();
            break;
        case 'Nová schůzka':
            opravaSchuzky();
            break;
        case null:
            console.error('Unknown page');
            break;
    }
}

main();