const checkComma = (value: string): number => {
    const processedValue = value
        .replaceAll('Kontakt', '')
        .replaceAll(/\d+(?: \d+)/g, '')
        .toLowerCase();

    return processedValue.match(/\b( men)\b/g)?.length ?? 0;
};

export default checkComma;
