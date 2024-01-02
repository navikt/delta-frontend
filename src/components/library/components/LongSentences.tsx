import {Accordion, BodyShort, Link, Pagination, ReadMore} from '@navikt/ds-react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import checkLongSentences from '../analysis/checkLongSentences';

interface Props {
    value: string;
}

function LongSentences({ value }: Props) {
    const longSentences = checkLongSentences(value);

    if (longSentences.length === 0) {
        return null;
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(1);

    const pageSize = 3;
    const indexOfLastPost = page * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize;
    const allFreq = Object.entries(longSentences).slice(indexOfFirstPost, indexOfLastPost);

    const pagesCount = Math.ceil(longSentences.length / pageSize);

    return (
        <>
            <Accordion.Item>
                <Accordion.Header>
                    {longSentences.length} {longSentences.length === 1 ? <>lang setning</> : <>lange setninger</>}
                </Accordion.Header>
                <Accordion.Content>
                    <BodyShort spacing>Ifølge studier kan setninger med over 20 ord anses som vanskelige å lese.</BodyShort>
                    <BodyShort spacing>
                    {allFreq.map((wordFreq: [string, string]) => {
                        const truncatedHeader =
                            wordFreq[1].substring(0, 15) + '...' + ' (' + wordFreq[1].split(/\s+/).length + ' ord)';
                        return (
                            <ReadMore key={wordFreq[0]} header={truncatedHeader}>
                                {wordFreq[1]}
                            </ReadMore>
                        );
                    })}
                    </BodyShort>
                    <BodyShort spacing>
                        Kilde:{' '}
                        <Link
                            target="_blank"
                            href="https://strainindex.wordpress.com/2012/04/30/longer-the-sentence-greater-the-strain/"
                        >
                            Nirmaldasan
                            <ExternalLinkIcon />
                        </Link>
                    </BodyShort>
                    {longSentences.length > pageSize && (
                        <div>
                            <Pagination
                                page={page}
                                onPageChange={setPage}
                                count={pagesCount}
                                size="small"
                                siblingCount={0}
                                boundaryCount={1}
                            />
                        </div>
                    )}
                </Accordion.Content>
            </Accordion.Item>
        </>
    );
}

export default LongSentences;
