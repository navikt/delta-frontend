import {Accordion, BodyShort, List} from '@navikt/ds-react';
import checkDuplicateWords from '../analysis/checkDuplicateWords';

interface Props {
    value: string;
}

function DuplicateWords({ value: val }: Props) {
    const duplicateWords = checkDuplicateWords(val);

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
                    {duplicateWords.map((duplicateWord, index) => (
                        <List.Item key={index}>"{duplicateWord}"</List.Item>
                    ))}
                </List>
            </Accordion.Content>
        </Accordion.Item>
    );
}

export default DuplicateWords;
