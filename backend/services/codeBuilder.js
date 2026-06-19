export const buildCode = (userCode, language, problem) => {
    switch (language) {
        case "cpp":
            return buildCpp(userCode, problem);
        case "javascript":
            return buildJavascript(userCode, problem);
        case "python":
            return buildPython(userCode, problem);
        case "java":
            return buildJava(userCode, problem);
        default:
            throw new Error(`Unsupported language: ${language}`);
    }
};

const buildCpp = (userCode, problem) => {
    // Determine return type from starterCode if possible
    let returnType = "int";
    const cppTemplate = problem.codeTemplate?.find(t => t.language === "cpp");
    if (cppTemplate) {
        const regex = new RegExp(`(\\w+<\\w+>|\\w+)\\s+${problem.functionName}\\s*\\(`);
        const match = cppTemplate.starterCode.match(regex);
        if (match) {
            returnType = match[1];
        }
    }

    // Generate input reading code
    let inputReading = "";
    let paramNames = [];
    problem.parameterTypes.forEach((type, index) => {
        const varName = `param${index}`;
        paramNames.push(varName);
        if (type.endsWith("[]")) {
            inputReading += `    string line${index};\n`;
            inputReading += `    if (!getline(cin, line${index})) return 0;\n`;
            inputReading += `    vector<int> ${varName} = parseVectorInt(line${index});\n`;
        } else if (type === "string") {
            inputReading += `    string ${varName};\n`;
            inputReading += `    if (!getline(cin, ${varName})) return 0;\n`;
        } else if (type === "bool" || type === "boolean") {
            inputReading += `    string line${index};\n`;
            inputReading += `    if (!getline(cin, line${index})) return 0;\n`;
            inputReading += `    bool ${varName} = (line${index} == "true" || line${index} == "1");\n`;
        } else {
            // number or int
            inputReading += `    string line${index};\n`;
            inputReading += `    if (!getline(cin, line${index})) return 0;\n`;
            inputReading += `    int ${varName} = stoi(line${index});\n`;
        }
    });

    const hasSolutionClass = userCode.includes("class Solution");
    let callCode = "";
    if (hasSolutionClass) {
        callCode = `    Solution solver;\n    auto result = solver.${problem.functionName}(${paramNames.join(", ")});`;
    } else {
        callCode = `    auto result = ${problem.functionName}(${paramNames.join(", ")});`;
    }

    let outputWriting = "";
    if (returnType.startsWith("vector")) {
        outputWriting = `    cout << "[";\n    for(size_t i=0; i<result.size(); i++) {\n        cout << result[i];\n        if (i < result.size() - 1) cout << ",";\n    }\n    cout << "]" << endl;`;
    } else if (returnType === "bool") {
        outputWriting = `    cout << (result ? "true" : "false") << endl;`;
    } else {
        outputWriting = `    cout << result << endl;`;
    }

    return `
#include <bits/stdc++.h>
using namespace std;

vector<int> parseVectorInt(string s) {
    vector<int> res;
    int start = 0;
    while(start < s.length() && (s[start] == '[' || s[start] == ' ' || s[start] == ',')) start++;
    int end = s.length() - 1;
    while(end >= 0 && (s[end] == ']' || s[end] == ' ' || s[end] == ',')) end--;
    if (start > end) return res;
    string sub = s.substr(start, end - start + 1);
    stringstream ss(sub);
    string token;
    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            res.push_back(stoi(token));
        }
    }
    return res;
}

${userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
${inputReading}
${callCode}
${outputWriting}
    return 0;
}
`;
};

const buildJavascript = (userCode, problem) => {
    let paramNames = [];
    let parsingCode = "";
    problem.parameterTypes.forEach((type, index) => {
        const varName = `param${index}`;
        paramNames.push(varName);
        if (type.endsWith("[]")) {
            parsingCode += `    const ${varName} = JSON.parse(inputLines[${index}]);\n`;
        } else if (type === "string") {
            parsingCode += `    const ${varName} = inputLines[${index}];\n`;
        } else if (type === "bool" || type === "boolean") {
            parsingCode += `    const ${varName} = inputLines[${index}].trim().toLowerCase() === 'true';\n`;
        } else {
            // number or int
            parsingCode += `    const ${varName} = Number(inputLines[${index}]);\n`;
        }
    });

    const hasSolutionClass = userCode.includes("class Solution");
    let callCode = "";
    if (hasSolutionClass) {
        callCode = `    const solver = new Solution();\n    const result = solver.${problem.functionName}(${paramNames.join(", ")});`;
    } else {
        callCode = `    const result = ${problem.functionName}(${paramNames.join(", ")});`;
    }

    return `
const fs = require('fs');

${userCode}

function main() {
    const input = fs.readFileSync(0, 'utf-8');
    const inputLines = input.trim().split(/\\r?\\n/);
    if (inputLines.length === 0 || inputLines[0] === '') return;
    
${parsingCode}
${callCode}
    console.log(typeof result === 'object' ? JSON.stringify(result) : result);
}

main();
`;
};

const buildPython = (userCode, problem) => {
    let paramNames = [];
    let parsingCode = "";
    problem.parameterTypes.forEach((type, index) => {
        const varName = `param${index}`;
        paramNames.push(varName);
        if (type.endsWith("[]")) {
            parsingCode += `    ${varName} = json.loads(input_lines[${index}])\n`;
        } else if (type === "string") {
            parsingCode += `    ${varName} = input_lines[${index}]\n`;
        } else if (type === "bool" || type === "boolean") {
            parsingCode += `    ${varName} = input_lines[${index}].strip().lower() == 'true'\n`;
        } else {
            // number or int
            parsingCode += `    ${varName} = int(input_lines[${index}]) if '.' not in input_lines[${index}] else float(input_lines[${index}])\n`;
        }
    });

    const hasSolutionClass = userCode.includes("class Solution");
    let callCode = "";
    if (hasSolutionClass) {
        callCode = `    solver = Solution()\n    result = solver.${problem.functionName}(${paramNames.join(", ")})`;
    } else {
        callCode = `    result = ${problem.functionName}(${paramNames.join(", ")})`;
    }

    return `
import sys
import json

${userCode}

def main():
    input_data = sys.stdin.read()
    input_lines = input_data.strip().splitlines()
    if not input_lines:
        return
        
${parsingCode}
${callCode}
    if isinstance(result, (list, dict)):
        print(json.dumps(result))
    elif isinstance(result, bool):
        print(str(result).lower())
    else:
        print(result)

if __name__ == "__main__":
    main()
`;
};

const buildJava = (userCode, problem) => {
    let returnType = "int";
    const javaTemplate = problem.codeTemplate?.find(t => t.language === "java");
    if (javaTemplate) {
        const regex = new RegExp(`(\\w+<\\w+>|\\w+|\\[\\])\\s+${problem.functionName}\\s*\\(`);
        const match = javaTemplate.starterCode.match(regex);
        if (match) {
            returnType = match[1];
        }
    }

    let inputReading = "";
    let paramNames = [];
    problem.parameterTypes.forEach((type, index) => {
        const varName = `param${index}`;
        paramNames.push(varName);
        if (type.endsWith("[]")) {
            inputReading += `        String line${index} = sc.nextLine();\n`;
            inputReading += `        int[] ${varName} = parseVectorInt(line${index});\n`;
        } else if (type === "string") {
            inputReading += `        String ${varName} = sc.nextLine();\n`;
        } else if (type === "bool" || type === "boolean") {
            inputReading += `        String line${index} = sc.nextLine();\n`;
            inputReading += `        boolean ${varName} = line${index}.trim().equalsIgnoreCase("true");\n`;
        } else {
            inputReading += `        String line${index} = sc.nextLine();\n`;
            inputReading += `        int ${varName} = Integer.parseInt(line${index}.trim());\n`;
        }
    });

    let callCode = `        Solution solver = new Solution();\n`;
    if (returnType.endsWith("[]")) {
        callCode += `        int[] result = solver.${problem.functionName}(${paramNames.join(", ")});`;
    } else {
        callCode += `        ${returnType} result = solver.${problem.functionName}(${paramNames.join(", ")});`;
    }

    let outputWriting = "";
    if (returnType.endsWith("[]")) {
        outputWriting = `        System.out.print("[");\n        for (int i = 0; i < result.length; i++) {\n            System.out.print(result[i]);\n            if (i < result.length - 1) System.out.print(",");\n        }\n        System.out.println("]");`;
    } else {
        outputWriting = `        System.out.println(result);`;
    }

    return `
import java.util.*;
import java.io.*;

${userCode}

public class Main {
    private static int[] parseVectorInt(String s) {
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        if (s.isEmpty()) return new int[0];
        String[] tokens = s.split(",");
        int[] res = new int[tokens.length];
        for (int i = 0; i < tokens.length; i++) {
            res[i] = Integer.parseInt(tokens[i].trim());
        }
        return res;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
${inputReading}
${callCode}
${outputWriting}
    }
}
`;
};
