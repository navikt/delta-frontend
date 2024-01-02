import {Accordion, BodyShort, Heading, List} from '@navikt/ds-react';
import checkPersonalData from '../analysis/checkPersonalData';

interface Props {
    value: string;
}

function PersonalData({ value }: Props) {
    const { emails, names, phonenumbers } = checkPersonalData(value);

    if (emails.length === 0 && names.length === 0 && phonenumbers.length === 0) {
        return null;
    }

    return (
        <Accordion.Item>
            <Accordion.Header>
                {emails.length + phonenumbers.length + names.length}{' '}
                {emails.length + phonenumbers.length + names.length === 1 ? (
                    <> mulig personopplysning</>
                ) : (
                    <>mulige personopplysninger</>
                )}
            </Accordion.Header>
            <Accordion.Content>
                {emails.length >= 1 && (
                    <BodyShort spacing>
                        <Heading spacing level="3" size="xsmall">
                            E-postadresser
                        </Heading>
                        <List>
                            {emails.map((email, index) => (
                                <List.Item key={index}>"{email}"</List.Item>
                            ))}
                        </List>
                    </BodyShort>
                )}
                {phonenumbers.length >= 1 && (
                    <BodyShort spacing>
                        <Heading spacing level="3" size="xsmall">
                            Telefonnummer
                        </Heading>
                        <List>
                            {phonenumbers.map((phonenumber, index) => (
                                <List.Item key={index}>"{phonenumber}"</List.Item>
                            ))}
                        </List>
                    </BodyShort>
                )}
                {names.length >= 1 && (
                    <BodyShort>
                        <Heading spacing level="3" size="xsmall">
                            Navn
                        </Heading>
                        <List>
                            {names.map((name, index) => (
                                <List.Item key={index}>"{name}"</List.Item>
                            ))}
                        </List>
                    </BodyShort>
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
}

export default PersonalData;
