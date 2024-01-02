const checkLongWords = (value: string): string[] => {
    const lettersInLongWords = 7;

    const processedValue = value
        .replaceAll('Kopier lenke', '')
        .replaceAll('/', ' / ')
        .replaceAll(/(.*)\.+[A-Za-z]{2,6}/g, '')
        .replaceAll(/http(.*)/g, '')
        .split('\n')
        .map((l: string) => (l.length > 0 && !['.', ':', '!', '?', ' '].includes(l.slice(-1)) ? l + '.' : l))
        .join('\n');

    const words: string[] = processedValue
        .toLowerCase()
        .split(/\s+/)
        .map((s: string) => s.replace(/[.,:?()!"«»]+/g, ''))
        .filter((word) => !word.match(/\d/)) // remove words including numbers
        .filter((word) => !word.match(/[-_>]/)) // remove words including -
        .reduce((acc: string[], val: string) => (!acc.includes(val) ? [...acc, val] : [...acc]), []); // remove duplicates

    const longWords = words.filter((word) => word.length >= lettersInLongWords).sort((a, b) => b.length - a.length);

    return longWords;
};

export default checkLongWords;
