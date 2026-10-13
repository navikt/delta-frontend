import {Accordion, BodyShort, List} from '@navikt/ds-react';
import checkDuplicateWords from '../analysis/checkDuplicateWords';

interface Props {
    value: string;
}

function DuplicateWords({ value: val }: Props) {
    const duplicateWords = checkDuplicateWords(val);
    const occurrences = new Map<string, number>();

    if (duplicateWords.length === 0) {
        return null;
    }

    return (
        <Accordion.Item>
            <Accordion.Header>
                {duplicateWords.length === 1 ? (
                    <>1 gjentakelse av like ord</>
                ) : (
                    <>{duplicateWords.length} gjentakelser av like ord</>
                )}
            </Accordion.Header>
            <Accordion.Content>
                <BodyShort spacing> Like ord som er gjentatt etter hverandre: </BodyShort>
                <List>
                    {duplicateWords.map((duplicateWord) => {
                        const occurrence = occurrences.get(duplicateWord) ?? 0;
                        occurrences.set(duplicateWord, occurrence + 1);
                        return (
                            <List.Item key={`${duplicateWord}-${occurrence}`}>
                                "{duplicateWord}"
                            </List.Item>
                        );
                    })}
                </List>
            </Accordion.Content>
        </Accordion.Item>
    );
}

export default DuplicateWords;
