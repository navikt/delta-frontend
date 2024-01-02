export interface PersonalDataResult {
    emails: string[];
    phonenumbers: string[];
    names: string[];
}

const checkPersonalData = (value: string): PersonalDataResult => {
    const preprocessedValue = value.replaceAll('Kopier lenke', '');

    const extractEmails = (value: string) => {
        return value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) ?? [];
    };

    const extractPhone = (value: string) => {
        return value.match(/(\s*[0-9]+){8,11}/gi) ?? [];
    };

    const extractName = (value: string) => {
        return (
            value
                .match(/([A-Z][a-z][a-z]*(?: [A-Z][a-z][a-z]*){1,2})/g)
                ?.filter((name, index) => value.indexOf(name) === index) ?? []
        );
    };

    return {
        emails: extractEmails(preprocessedValue),
        phonenumbers: extractPhone(preprocessedValue),
        names: extractName(preprocessedValue),
    };
};

export default checkPersonalData;
