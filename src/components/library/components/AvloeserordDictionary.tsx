import {Accordion, BodyShort, Link, ReadMore} from '@navikt/ds-react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import checkAvloeserord from '../analysis/checkAvloeserord';

interface Props {
    value: string;
}

function AvloeserDictionary({ value }: Props) {
    const { avloeserordMatches, datatermerMatches } = checkAvloeserord(value);

    if (avloeserordMatches.length === 0 && datatermerMatches.length === 0) {
        return null;
    }

    return (
        <>
            <Accordion.Item>
                <Accordion.Header>
                    {avloeserordMatches.length + datatermerMatches.length == 1 ? (
                        <>1 mulig avløserord</>
                    ) : (
                        <>{`${avloeserordMatches.length + datatermerMatches.length} mulige avløserord`}</>
                    )}
                </Accordion.Header>
                <Accordion.Content>
                    <BodyShort spacing>Norske ord som kan brukes i stedet for de tilsvarende engelske:</BodyShort>
                    <BodyShort spacing>
                    {avloeserordMatches.length > 0 &&
                        avloeserordMatches.map((ordliste) => (
                            <ReadMore key={`ordliste-${ordliste.importord}`} header={`"${ordliste.importord}"`}>
                                Forslag til alternativer: {ordliste.avloeserord}
                            </ReadMore>
                        ))}
                    {datatermerMatches.length > 0 &&
                        datatermerMatches.map((ordliste) => (
                            <ReadMore key={`dataterm-${ordliste.ord}`} header={`"${ordliste.ord}"`}>
                                Forslag til alternativer: {ordliste.bokmaal}
                                <p>{ordliste.definisjon}</p>
                            </ReadMore>
                        ))}
                    </BodyShort>
                    <div>
                    {avloeserordMatches.length > 0 && (
                       <BodyShort>
                            Kilde:{' '}
                            <Link target="_blank" href="https://www.sprakradet.no/sprakhjelp/Skriverad/Avloeysarord/">
                                På godt norsk – avløserord
                                <ExternalLinkIcon />
                            </Link>
                       </BodyShort>
                    )}
                    {datatermerMatches.length > 0 && (
                        <BodyShort>
                            Kilde:{' '}
                            <Link
                                target="_blank"
                                href="https://www.sprakradet.no/sprakhjelp/Skriverad/Ordlister/Datatermar/"
                            >
                                Språkrådets datatermer <ExternalLinkIcon />
                            </Link>
                        </BodyShort>
                    )}
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        </>
    );
}

export default AvloeserDictionary;
