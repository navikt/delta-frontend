import { Nrkordliste } from './dictionaries';

export interface NrkOrd {
    id: string;
    ord: string;
    bruk: string;
    bokmaal: string;
    kilde: string;
    lenke: string;
}

const checkNrkDictionary = (value: string): NrkOrd[] => {
    if (value === '') return [];

    return Nrkordliste.filter((ord) => {
        return value.toLowerCase().match('\\b' + ord.ord.toLowerCase() + '\\b');
    });
};

export default checkNrkDictionary;
