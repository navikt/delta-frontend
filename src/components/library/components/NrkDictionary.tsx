import {Accordion, BodyShort, Link, ReadMore} from '@navikt/ds-react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import checkNrkDictionary, { NrkOrd } from '../analysis/checkNrkDictionary';

interface Props {
    value: string;
}

function NrkDictionary({ value }: Props) {
    const matches = checkNrkDictionary(value);

    if (matches.length === 0) {
        return null;
    }

    const unikeLenker = Array.from(
        matches
            .reduce((previousValue, currentValue) => {
                return previousValue.set(currentValue.kilde, currentValue);
            }, new Map<NrkOrd['kilde'], NrkOrd>())
            .values()
    );

    return (
        <Accordion.Item>
            <Accordion.Header>
                {matches.length == 1 ? <>1 mulig støtende ord</> : <>{matches.length} mulige støtende ord</>}
            </Accordion.Header>
            <Accordion.Content>
                <BodyShort spacing>Ord i teksten som kan være støtende, eller som bør brukes med varsomhet.</BodyShort>
                <BodyShort spacing>
                {matches.map((ord) => (
                    <ReadMore key={ord.id} header={ord.ord}>
                        {ord.bokmaal}
                    </ReadMore>
                ))}</BodyShort>
                {unikeLenker.map((ord) => (
                    <BodyShort key={ord.kilde}>
                        Kilde:{' '}
                        <Link target="_blank" href={ord.lenke}>
                            {ord.kilde}
                            <ExternalLinkIcon />
                        </Link>
                    </BodyShort>
                ))}

            </Accordion.Content>
        </Accordion.Item>
    );
}

export default NrkDictionary;
