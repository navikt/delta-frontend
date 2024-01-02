const checkDuplicateWords = (value: string): string[] => {
    const processedValue = value
        .replaceAll('Kontakt', '')
        .replaceAll(/\d+(?: \d+)/g, '')
        .toLowerCase();

    const duplicateWords =
        processedValue.match(/\b(\w{2,5})\s+\1\b/g)?.map((duplicatedWord) => {
            return duplicatedWord;
        }) ?? [];

    return duplicateWords;
};

export default checkDuplicateWords;
