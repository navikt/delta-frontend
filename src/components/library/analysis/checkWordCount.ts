interface WordCountResult {
    totalWords: number;
    totalSentences: number;
    totalParagraphs: number;
    totalCharacters: number;
    totalCharactersWithoutSpaces: number;
}

const checkWordCount = (value: string): WordCountResult => {
    const words = value.split(/\s+/);

    const totalWords = words.length;

    const unprocessedParagraphs = value.split('\n\n');
    const totalParagraphs = unprocessedParagraphs.reduce((acc, cur) => {
        const stripWhitespaces = cur.replace(/\s+/gi, '');
        return stripWhitespaces.length > 1 ? acc + 1 : acc;
    }, 0);

    const punctuations = '!.?';
    const totalSentences = value.split('').reduce((acc, cur) => (!punctuations.includes(cur) ? acc : acc + 1), 0);

    const totalCharacters = value.length;
    const totalCharactersWithoutSpaces = totalCharacters - (value.match(/\s/g)?.length ?? 0);

    return {
        totalWords,
        totalSentences,
        totalParagraphs,
        totalCharacters,
        totalCharactersWithoutSpaces,
    };
};

export default checkWordCount;
