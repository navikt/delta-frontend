import React from 'react';
import { Accordion } from '@navikt/ds-react';
import LongParagraphs from './components/LongParagraphs';
import LongSentences from './components/LongSentences';
import LongWords from './components/LongWords';
import DuplicateWords from './components/DuplicateWords';
import KansellistenDictionary from './components/KansellistenDictionary';
import NrkDictionary from './components/NrkDictionary';
import AvloeserordDictionary from './components/AvloeserordDictionary';
import CommaCheck from './components/CommaCheck';
import PersonalData from './components/PersonalData';
import Tools from './components/Tools';

interface Options {
    longParagraphs?: boolean;
    longSentences?: boolean;
    longWords?: boolean;
    duplicateWords?: boolean;
    kansellistenDictionary?: boolean;
    nrkDictionary?: boolean;
    avloeserordDictionary?: boolean;
    commaCheck?: boolean;
    personalData?: boolean;
    tools?: boolean;
}

interface Props {
    value?: string;
    open?: boolean;
    options?: Options;
}

export const Spraksjekk = ({ value, open, options = {} }: Props) => {
    const {
        longParagraphs = true,
        longSentences = true,
        longWords = false,
        duplicateWords = true,
        kansellistenDictionary = true,
        nrkDictionary = true,
        avloeserordDictionary = true,
        commaCheck = true,
        personalData = true,
        tools = false,
    } = options;

    if (!value || !open) {
        return null;
    }

    return (
        <Accordion>
            {longParagraphs && <LongParagraphs value={value} />}
            {longSentences && <LongSentences value={value} />}
            {longWords && <LongWords value={value} />}
            {duplicateWords && <DuplicateWords value={value} />}
            {kansellistenDictionary && <KansellistenDictionary value={value} />}
            {nrkDictionary && <NrkDictionary value={value} />}
            {avloeserordDictionary && <AvloeserordDictionary value={value} />}
            {commaCheck && <CommaCheck value={value} />}
            {personalData && <PersonalData value={value} />}
            {tools && <Tools value={value} />}
        </Accordion>
    );
};
