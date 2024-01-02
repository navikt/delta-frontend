import { Avloeserord, Datatermer } from './dictionaries';

interface Avloeserord {
    importord: string;
    avloeserord: string;
}

interface Dataterm {
    ord: string;
    bokmaal: string;
    nynorsk: string;
    definisjon: string;
}

export interface AvloeserordResult {
    avloeserordMatches: Avloeserord[];
    datatermerMatches: Dataterm[];
}

const checkAvloeserord = (value: string): AvloeserordResult => {
    if (value === '') return { avloeserordMatches: [], datatermerMatches: [] };

    const avloeserordMatches = Avloeserord.filter((ordliste) => {
        return value.toLowerCase().match('\\b' + ordliste.importord.toLowerCase() + '\\b');
    });

    const datatermerMatches = Datatermer.filter((dataterm) => {
        return value.toLowerCase().match('\\b' + dataterm.ord.toLowerCase() + '\\b');
    });

    return { avloeserordMatches, datatermerMatches };
};

export default checkAvloeserord;
