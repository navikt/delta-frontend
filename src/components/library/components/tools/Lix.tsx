import { Accordion, BodyShort, Heading, Link } from '@navikt/ds-react';
import { ReactComponent as ExternalLinkIcon } from '../ExternalLink.svg';
import checkLix from '../../analysis/checkLix';

interface Props {
    value: string;
}

const getLixMelding = (lix: number) => {
    if (lix <= 33) {
        return 'Enkel å lese';
    } else if (lix > 33 && lix < 44) {
        return 'Middels å lese';
    } else {
        return 'Vanskelig å lese';
    }
};

function Lix({ value }: Props) {
    const lix = checkLix(value);

    if (!lix) {
        return (
            <Accordion.Item>
                <Accordion.Header>Liks: For lite tekst</Accordion.Header>
                <Accordion.Content>Sett inn minst én setning for å få opp resultater.</Accordion.Content>
            </Accordion.Item>
        );
    }

    const lixMelding = getLixMelding(lix);

    return (
        <Accordion.Item>
            <Accordion.Header>
                Liks: {lix}. {lixMelding}
            </Accordion.Header>
            <Accordion.Content>
                <BodyShort style={{ textTransform: 'initial' }}>
                    Liks: {lix}. Teksten er <span style={{ textTransform: 'lowercase' }}>{lixMelding}</span> ifølge{' '}
                    <Link target="_blank" href="https://no.wikipedia.org/wiki/Lesbarhetsindeks">
                        lesbarhetsindeksen
                        <ExternalLinkIcon />
                    </Link>
                    .
                </BodyShort>
                <div>
                    <Heading spacing level="3" size="xsmall">
                        Skriveråd
                    </Heading>
                    <ul>
                        <li>Skriv korte og enkle setninger</li>
                        <li>Velg korte og enkle ord</li>
                        <li>Skriv det viktigste først</li>
                    </ul>
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
}

export default Lix;
