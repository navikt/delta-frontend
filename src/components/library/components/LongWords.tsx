import { Accordion, Table, Pagination, Heading, Link } from '@navikt/ds-react';
import { useState } from 'react';
import { ReactComponent as ExternalLinkIcon } from './ExternalLink.svg';
import checkLongWords from '../analysis/checkLongWords';

interface Props {
    value: string;
}

function LongWords({ value }: Props) {
    const longWords = checkLongWords(value);

    if (longWords.length === 0) {
        return null;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Pagination pages
    const indexOfLastPost = page * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize;
    const allFreq = Object.entries(longWords).slice(indexOfFirstPost, indexOfLastPost);

    // Number of pages in pagination
    const pagesCount = Math.ceil(longWords.length / pageSize);

    return (
        <Accordion.Item>
            <Accordion.Header>
                {longWords.length === 1 ? <>1 unikt langt</> : <>{longWords.length} unike lange</>} ord
            </Accordion.Header>
            <Accordion.Content>
                <Heading spacing level="3" size="xsmall">
                    Velg korte og enkle ord
                </Heading>
                Ifølge lesbarhetsindeksen Liks anses ord med over seks bokstaver som lange -{' '}
                <Link target="_blank" href="https://no.wikipedia.org/wiki/Lesbarhetsindeks">
                    Wikipedia
                    <ExternalLinkIcon />
                </Link>
                <Heading spacing level="3" size="xsmall">
                    Ord med over seks bokstaver
                </Heading>
                <div>
                    <Table zebraStripes size="small">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">Ord</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Bokstaver</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {allFreq.map((wordFreq: [string, string]) => {
                                return (
                                    <Table.Row key={wordFreq[0]}>
                                        <Table.HeaderCell scope="row">{wordFreq[1]}</Table.HeaderCell>
                                        <Table.DataCell>{wordFreq[1].length}</Table.DataCell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </div>
                {longWords.length > pageSize && (
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
    );
}

export default LongWords;
