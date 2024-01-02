const checkLongSentences = (value: string): string[] => {
    const wordsInLongSentences = 21;

    const processedValue = value
        .replaceAll('Kopier lenke', '')
        .split('\n')
        .map((l: string) => (l.length > 0 && !['.', ':', '!', '?', '*'].includes(l.slice(-1)) ? l + '.' : l))
        .join('\n');

    const sentences = processedValue
        .replace(/([.?!–"“:*])\s*(?=[A-ZÆØÅ.•*«»"“–\-\d\n])/g, '$1|')
        .split('|')
        .sort((a, b) => {
            return b.split(/\s+/).length - a.split(/\s+/).length;
        });

    const longSentences = sentences.reduce((acc: string[], val: string) => {
        const words = val.split(/\s+/);
        return words.length >= wordsInLongSentences ? [...acc, val] : [...acc];
    }, []);

    return longSentences;
};

export default checkLongSentences;
