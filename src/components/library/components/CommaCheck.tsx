import { Accordion, Heading } from '@navikt/ds-react';
import checkComma from '../analysis/checkComma';

interface Props {
    value: string;
}

function CommaCheck({ value }: Props) {
    const commas = checkComma(value);

    return (
        <>
            {commas != 0 && (
                <Accordion.Item>
                    <Accordion.Header>
                        {commas == 1 ? <>1 tilfelle av manglende komma</> : <>{commas} tilfeller av manglende komma</>}
                    </Accordion.Header>
                    <Accordion.Content className="">
                        <Heading spacing level="3" size="xsmall">
                            Alltid komma foran "men"
                        </Heading>
                        Det er {commas == 1 ? <>ett tilfelle</> : <>{commas} tilfeller</>} i teksten der det mangler
                        komma foran "men".
                    </Accordion.Content>
                </Accordion.Item>
            )}
        </>
    );
}

export default CommaCheck;
