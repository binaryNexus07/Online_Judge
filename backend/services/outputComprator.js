function normalizeOutput(output) {
    return output.trim().replace(/\r\n/g, '\n');
}

export function compareOutputs(expected, actual) {
    return normalizeOutput(expected) === normalizeOutput(actual);
}
