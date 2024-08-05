import { getContext } from '../parsing/context';
import denik from './denik';
import opravaSchuzky from './opravaSchuzky';

function inject(doc: Document) {
    // This is a sub-header which conveniently tells us what we are looking at
    const decider = getContext(doc);
    console.log(decider);
    switch (decider) {
    case 'Deník':
        denik(doc);
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

export default inject;
