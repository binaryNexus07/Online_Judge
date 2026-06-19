export const buildCppCode = (
    userCode,
    input
) => {
    return `
#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    string s = "${input}";
    cout << reverseString(s);
    return 0;
}
`;
};