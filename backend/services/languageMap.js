
export const LANGUAGE_MAP = {
   cpp:54,
   python:72,
   javascript:73,
   java:74
};
export function getLanguageId(language) {

    if (!LANGUAGE_MAP[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return LANGUAGE_MAP[language];

}