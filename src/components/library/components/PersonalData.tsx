import {Accordion, BodyShort, Heading, List} from '@navikt/ds-react';
import checkPersonalData from '../analysis/checkPersonalData';

interface Props {
    value: string;
}

function createOccurrenceKey() {
    const occurrences = new Map<string, number>();
    return (value: string) => {
        const occurrence = occurrences.get(value) ?? 0;
        occurrences.set(value, occurrence + 1);
        return `${value}-${occurrence}`;
    };
}

function PersonalData({ value }: Props) {
    const { emails, names, phonenumbers } = checkPersonalData(value);

    if (emails.length === 0 && names.length === 0 && phonenumbers.length === 0) {
        return null;
    }

    const emailKey = createOccurrenceKey();
    const phoneKey = createOccurrenceKey();
    const nameKey = createOccurrenceKey();

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
                            {emails.map((email) => (
                                <List.Item key={emailKey(email)}>"{email}"</List.Item>
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
                            {phonenumbers.map((phonenumber) => (
                                <List.Item key={phoneKey(phonenumber)}>"{phonenumber}"</List.Item>
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
                            {names.map((name) => (
                                <List.Item key={nameKey(name)}>"{name}"</List.Item>
                            ))}
                        </List>
                    </BodyShort>
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
}

export default PersonalData;
