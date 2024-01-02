import checkAvloeserord from './checkAvloeserord';
import checkLongParagraphs from './checkLongParagraphs';
import checkLongSentences from './checkLongSentences';
import checkLongWords from './checkLongWords';
import checkDuplicateWords from './checkDuplicateWords';
import checkKansellisten from './checkKansellisten';
import checkNrkDictionary from './checkNrkDictionary';
import checkComma from './checkComma';
import checkPersonalData from './checkPersonalData';
import checkLix from './checkLix';
import checkWordCount from './checkWordCount';
import checkWordFrequency from './checkWordFrequency';

interface ToolsResult {
    lix: ReturnType<typeof checkLix>;
    wordCount: ReturnType<typeof checkWordCount>;
    wordFrequency: ReturnType<typeof checkWordFrequency>;
}

export interface TextCheckerResult {
    longParagraphs: ReturnType<typeof checkLongParagraphs>;
    longSentences: ReturnType<typeof checkLongSentences>;
    longWords: ReturnType<typeof checkLongWords>;
    duplicateWords: ReturnType<typeof checkDuplicateWords>;
    kansellisten: ReturnType<typeof checkKansellisten>;
    nrkOrd: ReturnType<typeof checkNrkDictionary>;
    avloeserord: ReturnType<typeof checkAvloeserord>;
    comma: ReturnType<typeof checkComma>;
    personalData: ReturnType<typeof checkPersonalData>;
    tools: ToolsResult;
}

const checkText = (value: string): TextCheckerResult => {
    return {
        longParagraphs: checkLongParagraphs(value),
        longSentences: checkLongSentences(value),
        longWords: checkLongWords(value),
        duplicateWords: checkDuplicateWords(value),
        kansellisten: checkKansellisten(value),
        nrkOrd: checkNrkDictionary(value),
        avloeserord: checkAvloeserord(value),
        comma: checkComma(value),
        personalData: checkPersonalData(value),
        tools: {
            lix: checkLix(value),
            wordCount: checkWordCount(value),
            wordFrequency: checkWordFrequency(value),
        },
    };
};

export default checkText;
