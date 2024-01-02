import { Kansellisten } from './dictionaries';

interface Kanselliord {
    kanselliord: string;
    alternativ_1: string;
    alternativ_2: string;
}

const checkKansellisten = (value: string): Kanselliord[] => {
    if (value === '') return [];

    const kanselliordMatches = Kansellisten.filter((ord) => {
        return value.toLowerCase().match('\\b' + ord.kanselliord.toLowerCase() + '\\b');
    });

    return kanselliordMatches;
};

export default checkKansellisten;
