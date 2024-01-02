import { Accordion } from '@navikt/ds-react';
import React from 'react';
import checkWordCount from '../../analysis/checkWordCount';

interface Props {
    value: string;
}

function WordCount({ value }: Props) {
    const { totalWords, totalParagraphs, totalSentences, totalCharacters, totalCharactersWithoutSpaces } =
        checkWordCount(value);

    return (
        <Accordion.Item>
            <Accordion.Header>Ordtelling: {totalWords} ord</Accordion.Header>
            <Accordion.Content>
                <ul>
                    <li>Ord: {totalWords}</li>
                    <li>Setninger: {totalSentences}</li>
                    <li>Avsnitt: {totalParagraphs}</li>
                    <li>
                        Tegn: {totalCharacters}{' '}
                        {totalCharacters != totalCharactersWithoutSpaces && (
                            <>({totalCharactersWithoutSpaces} uten mellomrom)</>
                        )}
                    </li>
                </ul>
            </Accordion.Content>
        </Accordion.Item>
    );
}

export default WordCount;
