const checkLongParagraphs = (value: string): string[] => {
    const sentencesInLongParagraph = 4;

    const processedValue = value
        .replaceAll('Kopier lenke', '')
        .split('\n')
        .map((l: string) => (l.length > 0 && !['.', ':', '!', '?'].includes(l.slice(-1)) ? l + '.' : l))
        .join('\n');

    const paragraphs = processedValue.split(/\n/).sort((a: string, b: string) => {
        return (
            b.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|').length -
            a.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|').length
        );
    });

    const longParagraphs = paragraphs.reduce((acc: string[], val: string) => {
        const sentencesInParagraphs = val.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');
        return sentencesInParagraphs.length >= sentencesInLongParagraph ? [...acc, val] : [...acc];
    }, []);

    return longParagraphs;
};

export default checkLongParagraphs;
