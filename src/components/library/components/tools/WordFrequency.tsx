import { Accordion, Table, Pagination } from '@navikt/ds-react';
import { useState } from 'react';
import checkWordFrequency from '../../analysis/checkWordFrequency';

interface Props {
    value: string;
}

function WordFrequency(props: Props) {
    const frequencies = checkWordFrequency(props.value);

    if (Object.keys(frequencies).length === 0) {
        return null;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const indexOfLastPost = page * 10;
    const indexOfFirstPost = indexOfLastPost - 10;
    const allFreq = Object.entries(frequencies)
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .slice(indexOfFirstPost, indexOfLastPost);

    // Number of pages in pagination
    const pagesCount = Math.ceil(Object.keys(frequencies).length / pageSize);

    return (
        <Accordion.Item>
            <Accordion.Header>Frekvensordliste</Accordion.Header>
            <Accordion.Content>
                <div>
                    <Table zebraStripes size="small">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">Ord</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Frekvens</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {allFreq.map((wordFreq: [string, number]) => {
                                return (
                                    <Table.Row key={wordFreq[0]}>
                                        <Table.HeaderCell scope="row">{wordFreq[0]}</Table.HeaderCell>
                                        <Table.DataCell>{wordFreq[1]}</Table.DataCell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                </div>
                {pagesCount > 1 && (
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

export default WordFrequency;
