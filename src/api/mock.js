// Helper to decode/encode base64 for token simulation
const encodeBase64 = (str) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

// Seed default topics
const SEED_TOPICS = [
  { id: "t1", name: "Array", slug: "array" },
  { id: "t2", name: "Hash Table", slug: "hash-table" },
  { id: "t3", name: "String", slug: "string" },
  { id: "t4", name: "Two Pointers", slug: "two-pointers" },
  { id: "t5", name: "Sliding Window", slug: "sliding-window" },
  { id: "t6", name: "Binary Search", slug: "binary-search" },
  { id: "t7", name: "Divide and Conquer", slug: "divide-and-conquer" }
];

// Seed default problem topics mapping
const SEED_PROBLEM_TOPICS = [
  { id: "pt1", problemId: "Q1", topicId: "t1" },
  { id: "pt2", problemId: "Q1", topicId: "t2" },
  { id: "pt3", problemId: "Q2", topicId: "t3" },
  { id: "pt4", problemId: "Q2", topicId: "t4" },
  { id: "pt5", problemId: "Q3", topicId: "t3" },
  { id: "pt6", problemId: "Q3", topicId: "t5" },
  { id: "pt7", problemId: "Q4", topicId: "t1" },
  { id: "pt8", problemId: "Q4", topicId: "t6" },
  { id: "pt9", problemId: "Q4", topicId: "t7" }
];

// Seed default problems matching the new ER schema (with timilimt, memorylimit, constrains, solutions, etc.)
const SEED_PROBLEMS = [
  {
    id: "Q1",
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constrains: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    timilimt: 1000,
    memorylimit: 256,
    acceptanceCount: 2432,
    submissionsCount: 4210,
    exampleSchema: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    codeTemplateSchema: [
      {
        language: "javascript",
        starterCode: "function twoSum(nums, target) {\n    // Write your code here\n    \n}"
      },
      {
        language: "python",
        starterCode: "def twoSum(nums, target):\n    # Write your code here\n    pass"
      }
    ],
    solutionSchema: [
      {
        language: "javascript",
        code: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}"
      }
    ],
    functionName: "twoSum",
    parameterTypes: "integer[], integer",
    hints: "Try utilizing a Hash Map to reduce search complexity from O(N^2) to O(N).",
    createdAt: new Date().toISOString()
  },
  {
    id: "Q2",
    title: "Reverse String",
    slug: "reverse-string",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    constrains: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
    timilimt: 1000,
    memorylimit: 128,
    acceptanceCount: 1890,
    submissionsCount: 2100,
    exampleSchema: [
      {
        input: "s = ['h','e','l','l','o']",
        output: "['o','l','l','e','h']",
        explanation: "Reversing the array in-place changes the contents."
      }
    ],
    codeTemplateSchema: [
      {
        language: "javascript",
        starterCode: "function reverseString(s) {\n    // Write your code here\n    \n}"
      },
      {
        language: "python",
        starterCode: "def reverseString(s):\n    # Write your code here\n    pass"
      }
    ],
    solutionSchema: [
      {
        language: "javascript",
        code: "function reverseString(s) {\n    let l = 0, r = s.length - 1;\n    while(l < r) {\n        let temp = s[l];\n        s[l] = s[r];\n        s[r] = temp;\n        l++;\n        r--;\n    }\n    return s;\n}"
      }
    ],
    functionName: "reverseString",
    parameterTypes: "character[]",
    hints: "Use two pointers—one at the start and one at the end—swapping characters and moving inward.",
    createdAt: new Date().toISOString()
  },
  {
    id: "Q3",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    constrains: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    timilimt: 2000,
    memorylimit: 256,
    acceptanceCount: 840,
    submissionsCount: 2900,
    exampleSchema: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      }
    ],
    codeTemplateSchema: [
      {
        language: "javascript",
        starterCode: "function lengthOfLongestSubstring(s) {\n    // Write your code here\n    \n}"
      }
    ],
    solutionSchema: [
      {
        language: "javascript",
        code: "function lengthOfLongestSubstring(s) {\n    let map = {};\n    let left = 0, max = 0;\n    for(let right=0; right<s.length; right++) {\n        if(map[s[right]] !== undefined && map[s[right]] >= left) {\n            left = map[s[right]] + 1;\n        }\n        map[s[right]] = right;\n        max = Math.max(max, right - left + 1);\n    }\n    return max;\n}"
      }
    ],
    functionName: "lengthOfLongestSubstring",
    parameterTypes: "string",
    hints: "Maintain a sliding window containing unique characters, shifting the left pointer when duplicates occur.",
    createdAt: new Date().toISOString()
  }
];

// Seed default test cases (public and hidden)
const SEED_TEST_CASES = [
  // Two Sum
  {
    id: "tc1",
    problemId: "Q1",
    input: "[2,7,11,15]\n9",
    expectedOutput: "[0,1]",
    isHidden: false
  },
  {
    id: "tc2",
    problemId: "Q1",
    input: "[3,2,4]\n6",
    expectedOutput: "[1,2]",
    isHidden: true
  },
  {
    id: "tc3",
    problemId: "Q1",
    input: "[3,3]\n6",
    expectedOutput: "[0,1]",
    isHidden: true
  },
  // Reverse String
  {
    id: "tc4",
    problemId: "Q2",
    input: '["h","e","l","l","o"]',
    expectedOutput: '["o","l","l","e","h"]',
    isHidden: false
  },
  {
    id: "tc5",
    problemId: "Q2",
    input: '["H","a","n","n","a","h"]',
    expectedOutput: '["h","a","n","n","a","H"]',
    isHidden: true
  },
  // Longest Substring
  {
    id: "tc6",
    problemId: "Q3",
    input: '"abcabcbb"',
    expectedOutput: '3',
    isHidden: false
  },
  {
    id: "tc7",
    problemId: "Q3",
    input: '"bbbbb"',
    expectedOutput: '1',
    isHidden: true
  },
  {
    id: "tc8",
    problemId: "Q3",
    input: '"pwwkew"',
    expectedOutput: '3',
    isHidden: true
  }
];

// Seed discussions (replaces comments; now has title and content)
const SEED_DISCUSSIONS = [
  {
    id: "d1",
    problemId: "Q1",
    userId: "u2",
    username: "AliceCoder",
    title: "Optimized O(N) Hash Map Approach",
    content: "Excellent problem for beginners! The hash map approach achieves O(N) runtime and O(N) space by looking up the complement in a single pass.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "d2",
    problemId: "Q1",
    userId: "u3",
    username: "BobDev",
    title: "Is it possible to solve in O(1) space?",
    content: "If the input array is already sorted, can we achieve O(1) auxiliary space complexity using two pointers?",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "d3",
    problemId: "Q1",
    userId: "u1",
    username: "Bansal",
    title: "Yes Bob, sorted array allows O(1) space!",
    content: "If the array is pre-sorted, we can maintain low and high pointers and move them based on the sum, which uses no extra memory.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Seed localStorage if empty / migrate tables
if (!localStorage.getItem("oj_topics")) {
  localStorage.setItem("oj_topics", JSON.stringify(SEED_TOPICS));
}
if (!localStorage.getItem("oj_problem_topics")) {
  localStorage.setItem("oj_problem_topics", JSON.stringify(SEED_PROBLEM_TOPICS));
}
if (!localStorage.getItem("oj_test_cases")) {
  localStorage.setItem("oj_test_cases", JSON.stringify(SEED_TEST_CASES));
}
if (!localStorage.getItem("oj_discussions")) {
  localStorage.setItem("oj_discussions", JSON.stringify(SEED_DISCUSSIONS));
  // Remove deprecated oj_comments
  localStorage.removeItem("oj_comments");
}
// Overwrite oj_problems to update schemas dynamically
localStorage.setItem("oj_problems", JSON.stringify(SEED_PROBLEMS));

if (!localStorage.getItem("oj_users")) {
  localStorage.setItem("oj_users", JSON.stringify([
    {
      id: "u1",
      username: "Bansal",
      email: "sumitbansal1290@gmail.com",
      password_hash: "admin123",
      role: "admin",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Bansal",
      created_at: new Date().toISOString()
    },
    {
      id: "u2",
      username: "AliceCoder",
      email: "alice@example.com",
      password_hash: "user123",
      role: "user",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Alice",
      created_at: new Date().toISOString()
    }
  ]));
}

// Generate a fake JWT token
const generateFakeJWT = (user) => {
  const header = encodeBase64(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = encodeBase64(JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 900 // 15 mins expiry
  }));
  return `${header}.${payload}.mocksignature`;
};

// Simulate network delay
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const setupMockAPI = (axiosInstance) => {
  axiosInstance.defaults.adapter = async (config) => {
    await delay(300);

    const { url, method, data, headers } = config;
    const body = data ? JSON.parse(data) : {};

    // Get current DB snapshot
    const users = JSON.parse(localStorage.getItem("oj_users") || "[]");
    const problems = JSON.parse(localStorage.getItem("oj_problems") || "[]");
    const testCases = JSON.parse(localStorage.getItem("oj_test_cases") || "[]");
    const discussions = JSON.parse(localStorage.getItem("oj_discussions") || "[]");
    const topics = JSON.parse(localStorage.getItem("oj_topics") || "[]");
    const problemTopics = JSON.parse(localStorage.getItem("oj_problem_topics") || "[]");
    const activeSession = JSON.parse(localStorage.getItem("oj_session") || "null");

    // Helper to authenticate request
    const getAuthUser = () => {
      const authHeader = headers["Authorization"] || axiosInstance.defaults.headers.common["Authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
      
      const token = authHeader.split(" ")[1];
      try {
        const payloadStr = window.atob(token.split(".")[1]);
        return JSON.parse(payloadStr);
      } catch (e) {
        return null;
      }
    };

    // -----------------------------------------------------------------
    // AUTH ROUTER
    // -----------------------------------------------------------------
    if (url.endsWith("/auth/register") && method === "post") {
      const { username, email, password } = body;
      if (users.find(u => u.email === email)) {
        return { status: 400, data: { message: "User with this email already exists" } };
      }
      const newUser = {
        id: "u_" + Math.random().toString(36).substr(2, 9),
        username,
        email,
        password_hash: password,
        role: "user",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem("oj_users", JSON.stringify(users));
      return { status: 201, data: { message: "Registration successful" } };
    }

    if (url.endsWith("/auth/login") && method === "post") {
      const { email, password } = body;
      const user = users.find(u => u.email === email && u.password_hash === password);
      if (!user) {
        return { status: 401, data: { message: "Invalid email or password" } };
      }
      const token = generateFakeJWT(user);
      localStorage.setItem("oj_session", JSON.stringify({ userId: user.id, refreshToken: "fake_refresh_token" }));
      return {
        status: 200,
        headers: { "Set-Cookie": "refreshToken=fake_refresh_token; HttpOnly" },
        data: { accessToken: token }
      };
    }

    if (url.endsWith("/auth/refresh") && method === "post") {
      if (!activeSession) {
        return { status: 401, data: { message: "No refresh token provided" } };
      }
      const user = users.find(u => u.id === activeSession.userId);
      if (!user) {
        return { status: 401, data: { message: "Invalid user session" } };
      }
      const token = generateFakeJWT(user);
      return { status: 200, data: { accessToken: token } };
    }

    if (url.endsWith("/auth/logout") && method === "post") {
      localStorage.removeItem("oj_session");
      return { status: 200, data: { message: "Logged out successfully" } };
    }

    // -----------------------------------------------------------------
    // PROBLEMS ROUTER
    // -----------------------------------------------------------------
    if (url.match(/\/problems$/) && method === "get") {
      const params = config.params || {};
      const { search = "", difficulty = "", tag = "", page = 1, limit = 10 } = params;

      let filtered = [...problems];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.id.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }

      if (difficulty) {
        filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
      }

      // Filter relationally using oj_problem_topics
      if (tag) {
        const activeTopic = topics.find(t => t.slug === tag.toLowerCase() || t.name.toLowerCase() === tag.toLowerCase());
        if (activeTopic) {
          const mappedProblemIds = problemTopics.filter(pt => pt.topicId === activeTopic.id).map(pt => pt.problemId);
          filtered = filtered.filter(p => mappedProblemIds.includes(p.id));
        } else {
          filtered = [];
        }
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

      // Append topics to the problem representation before returning
      const problemsWithTopics = paginated.map(p => {
        const pTopicIds = problemTopics.filter(pt => pt.problemId === p.id).map(pt => pt.topicId);
        const pTopics = topics.filter(t => pTopicIds.includes(t.id)).map(t => t.name);
        return { ...p, tags: pTopics }; // Map topic names to frontend tags key
      });

      return {
        status: 200,
        data: {
          problems: problemsWithTopics,
          total: totalItems,
          page: parseInt(page),
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    }

    const problemMatch = url.match(/\/problems\/([^/]+)$/);
    if (problemMatch && method === "get") {
      const param = problemMatch[1];
      const problem = problems.find(p => p.id === param || p.slug === param);
      if (!problem) {
        return { status: 404, data: { message: "Problem not found" } };
      }

      // Map topics
      const pTopicIds = problemTopics.filter(pt => pt.problemId === problem.id).map(pt => pt.topicId);
      const pTopics = topics.filter(t => pTopicIds.includes(t.id)).map(t => t.name);

      return {
        status: 200,
        data: { ...problem, tags: pTopics }
      };
    }

    // POST /problems (Admin)
    if (url.endsWith("/problems") && method === "post") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }

      const { 
        id, title, description, constrains, timilimt, memorylimit, 
        exampleSchema, codeTemplateSchema, solutionSchema, 
        functionName, parameterTypes, hints, topics: problemTopicIds 
      } = body;

      if (problems.find(p => p.id === id || p.title === title)) {
        return { status: 400, data: { message: "Problem with this ID or Title already exists" } };
      }

      const newProblem = {
        id,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description,
        constrains,
        timilimt: Number(timilimt) || 1000,
        memorylimit: Number(memorylimit) || 256,
        acceptanceCount: 0,
        submissionsCount: 0,
        exampleSchema: Array.isArray(exampleSchema) ? exampleSchema : [],
        codeTemplateSchema: Array.isArray(codeTemplateSchema) ? codeTemplateSchema : [],
        solutionSchema: Array.isArray(solutionSchema) ? solutionSchema : [],
        functionName: functionName || "solve",
        parameterTypes: parameterTypes || "string",
        hints: hints || "",
        createdAt: new Date().toISOString()
      };

      problems.push(newProblem);
      localStorage.setItem("oj_problems", JSON.stringify(problems));

      // Handle Topic Mappings
      if (Array.isArray(problemTopicIds)) {
        const newTopicMaps = problemTopicIds.map(tId => ({
          id: "pt_" + Math.random().toString(36).substr(2, 9),
          problemId: id,
          topicId: tId
        }));
        const allTopicMaps = [...problemTopics, ...newTopicMaps];
        localStorage.setItem("oj_problem_topics", JSON.stringify(allTopicMaps));
      }

      return { status: 201, data: newProblem };
    }

    // PUT /problems/:id (Admin)
    if (problemMatch && method === "put") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }

      const pId = problemMatch[1];
      const index = problems.findIndex(p => p.id === pId);
      if (index === -1) {
        return { status: 404, data: { message: "Problem not found" } };
      }

      const { 
        title, description, constrains, timilimt, memorylimit, 
        exampleSchema, codeTemplateSchema, solutionSchema, 
        functionName, parameterTypes, hints, topics: problemTopicIds 
      } = body;

      problems[index] = {
        ...problems[index],
        title: title || problems[index].title,
        slug: title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : problems[index].slug,
        description: description || problems[index].description,
        constrains: constrains || problems[index].constrains,
        timilimt: timilimt !== undefined ? Number(timilimt) : problems[index].timilimt,
        memorylimit: memorylimit !== undefined ? Number(memorylimit) : problems[index].memorylimit,
        exampleSchema: exampleSchema || problems[index].exampleSchema,
        codeTemplateSchema: codeTemplateSchema || problems[index].codeTemplateSchema,
        solutionSchema: solutionSchema || problems[index].solutionSchema,
        functionName: functionName || problems[index].functionName,
        parameterTypes: parameterTypes || problems[index].parameterTypes,
        hints: hints || problems[index].hints
      };

      localStorage.setItem("oj_problems", JSON.stringify(problems));

      // Update Topic Mappings
      if (Array.isArray(problemTopicIds)) {
        const filteredTopicMaps = problemTopics.filter(pt => pt.problemId !== pId);
        const newTopicMaps = problemTopicIds.map(tId => ({
          id: "pt_" + Math.random().toString(36).substr(2, 9),
          problemId: pId,
          topicId: tId
        }));
        localStorage.setItem("oj_problem_topics", JSON.stringify([...filteredTopicMaps, ...newTopicMaps]));
      }

      return { status: 200, data: problems[index] };
    }

    // DELETE /problems/:id (Admin)
    if (problemMatch && method === "delete") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }

      const pId = problemMatch[1];
      const filteredProblems = problems.filter(p => p.id !== pId);
      if (filteredProblems.length === problems.length) {
        return { status: 404, data: { message: "Problem not found" } };
      }

      localStorage.setItem("oj_problems", JSON.stringify(filteredProblems));
      return { status: 200, data: { message: "Problem deleted" } };
    }

    // -----------------------------------------------------------------
    // TEST CASES ROUTER
    // -----------------------------------------------------------------
    const testCasesMatch = url.match(/\/problems\/([^/]+)\/testcases$/);
    if (testCasesMatch && method === "get") {
      const pIdOrSlug = testCasesMatch[1];
      const problem = problems.find(p => p.id === pIdOrSlug || p.slug === pIdOrSlug);
      if (!problem) {
        return { status: 404, data: { message: "Problem not found" } };
      }

      const pTestCases = testCases.filter(tc => tc.problemId === problem.id);
      const authUser = getAuthUser();
      
      // Filter out hidden test cases if not Admin
      if (!authUser || authUser.role !== "admin") {
        const publicCases = pTestCases.filter(tc => !tc.isHidden);
        return { status: 200, data: publicCases };
      }

      return { status: 200, data: pTestCases };
    }

    // Create / update testcase (Admin only)
    if (url.endsWith("/testcases") && method === "post") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }
      const { problemId, input, expectedOutput, isHidden } = body;
      const newTestCase = {
        id: "tc_" + Math.random().toString(36).substr(2, 9),
        problemId,
        input,
        expectedOutput,
        isHidden: !!isHidden
      };
      testCases.push(newTestCase);
      localStorage.setItem("oj_test_cases", JSON.stringify(testCases));
      return { status: 201, data: newTestCase };
    }

    const testCaseDeleteMatch = url.match(/\/testcases\/([^/]+)$/);
    if (testCaseDeleteMatch && method === "delete") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }
      const tcId = testCaseDeleteMatch[1];
      const filtered = testCases.filter(tc => tc.id !== tcId);
      localStorage.setItem("oj_test_cases", JSON.stringify(filtered));
      return { status: 200, data: { message: "Test case deleted" } };
    }

    // -----------------------------------------------------------------
    // TOPICS ROUTER
    // -----------------------------------------------------------------
    if (url.endsWith("/topics") && method === "get") {
      return { status: 200, data: topics };
    }

    // -----------------------------------------------------------------
    // DISCUSSIONS ROUTER (Replaces Comments)
    // -----------------------------------------------------------------
    const discussionsGetMatch = url.match(/\/discussions\/([^/]+)$/);
    if (discussionsGetMatch && method === "get") {
      const pSlugOrId = discussionsGetMatch[1];
      const problem = problems.find(p => p.slug === pSlugOrId || p.id === pSlugOrId);
      if (!problem) return { status: 404, data: { message: "Problem not found" } };

      const pDiscussions = discussions.filter(d => d.problemId === problem.id || d.problemId === problem.slug);
      return { status: 200, data: pDiscussions };
    }

    if (url.endsWith("/discussions") && method === "post") {
      const authUser = getAuthUser();
      if (!authUser) {
        return { status: 401, data: { message: "Authentication required" } };
      }

      const { problemId, title, content } = body;
      const problem = problems.find(p => p.id === problemId || p.slug === problemId);
      const newDiscussion = {
        id: "d_" + Math.random().toString(36).substr(2, 9),
        problemId: problem ? problem.id : problemId,
        userId: authUser.id,
        username: authUser.username,
        title,
        content,
        createdAt: new Date().toISOString()
      };

      discussions.push(newDiscussion);
      localStorage.setItem("oj_discussions", JSON.stringify(discussions));

      return { status: 201, data: newDiscussion };
    }

    const discussionDeleteMatch = url.match(/\/discussions\/([^/]+)$/);
    if (discussionDeleteMatch && method === "delete") {
      const authUser = getAuthUser();
      if (!authUser) return { status: 401, data: { message: "Authentication required" } };

      const dId = discussionDeleteMatch[1];
      const index = discussions.findIndex(d => d.id === dId);
      if (index === -1) return { status: 404, data: { message: "Discussion not found" } };

      if (discussions[index].userId !== authUser.id && authUser.role !== "admin") {
        return { status: 403, data: { message: "Forbidden" } };
      }

      // Soft delete content replacement
      discussions[index].title = "[deleted]";
      discussions[index].content = "[deleted]";
      discussions[index].username = "[deleted]";
      discussions[index].is_deleted = true;

      localStorage.setItem("oj_discussions", JSON.stringify(discussions));
      return { status: 200, data: discussions[index] };
    }

    // -----------------------------------------------------------------
    // SUBMISSIONS ROUTER
    // -----------------------------------------------------------------
    if (url.endsWith("/submissions") && method === "post") {
      const authUser = getAuthUser();
      const { problemId, code, language } = body;
      
      const problem = problems.find(p => p.id === problemId || p.slug === problemId);
      if (!problem) return { status: 404, data: { message: "Problem not found" } };

      const pTestCases = testCases.filter(tc => tc.problemId === problem.id);
      
      let status = "AC";
      let passedCount = 0;
      let totalCount = pTestCases.length;
      let errorOutput = "";
      let compileOutput = "";
      
      if (totalCount === 0) {
        status = "AC";
      } else {
        // Evaluate JavaScript submissions dynamically
        if (language === "javascript") {
          try {
            // Re-create user code function factory
            const cleanCode = code + `\nreturn ${problem.functionName};`;
            const userFunctionFactory = new Function(cleanCode);
            const userFunction = userFunctionFactory();

            if (typeof userFunction !== 'function') {
              throw new Error(`Function '${problem.functionName}' was not defined.`);
            }

            for (let tc of pTestCases) {
              // Parse input parameters (line split JSON)
              let args = [];
              try {
                if (tc.input.includes('\n')) {
                  args = tc.input.split('\n').map(p => JSON.parse(p.trim()));
                } else {
                  args = [JSON.parse(tc.input.trim())];
                }
              } catch (parseErr) {
                // Treat input as a single raw string if JSON parsing fails
                args = [tc.input];
              }

              const expected = JSON.parse(tc.expectedOutput.trim());
              const result = userFunction(...args);
              
              // Validate output matches expected output
              const isMatch = (Array.isArray(expected) && Array.isArray(result)) 
                ? expected.sort().join(',') === result.sort().join(',')
                : JSON.stringify(expected) === JSON.stringify(result);

              if (isMatch) {
                passedCount++;
              } else {
                status = "WA";
                if (passedCount === 0) {
                  errorOutput = `Wrong Answer on Test Case.\nInput: ${tc.input}\nExpected: ${tc.expectedOutput}\nGot: ${JSON.stringify(result)}`;
                }
              }
            }
          } catch (err) {
            status = "CE";
            compileOutput = err.message;
            errorOutput = err.stack ? err.stack.split('\n')[0] : err.message;
          }
        } else {
          // Simulation for other languages
          passedCount = Math.floor(Math.random() * (totalCount + 1));
          status = passedCount === totalCount ? "AC" : (Math.random() > 0.3 ? "WA" : "CE");
          if (status === "CE") {
            compileOutput = "g++ compiler error: missing type specifier before identifier";
            errorOutput = "Compilation failed.";
          } else if (status === "WA") {
            errorOutput = "Assertion failed: output mismatch on hidden case";
          }
        }
      }

      // Record detailed submission stats matching the ER schema
      const runtime = status === "AC" ? Math.floor(5 + Math.random() * 20) : 0;
      const memory = status === "AC" ? Math.floor(10 + Math.random() * 15) : 0;

      const newSubmission = {
        id: "sub_" + Math.random().toString(36).substr(2, 9),
        userId: authUser ? authUser.id : "guest",
        problemId: problem.id,
        code,
        language,
        status,
        runtime,
        memory,
        passedTestCases: passedCount,
        totalTestCases: totalCount,
        executionTime: runtime,
        errorOutput,
        compileOutput,
        executionOutput: status === "AC" ? "Correct" : "Incorrect",
        submittedAt: new Date().toISOString()
      };

      const allSubmissions = JSON.parse(localStorage.getItem("oj_submissions") || "[]");
      allSubmissions.push(newSubmission);
      localStorage.setItem("oj_submissions", JSON.stringify(allSubmissions));

      // Update Problem Statistics Counts
      const pIndex = problems.findIndex(p => p.id === problem.id);
      if (pIndex !== -1) {
        problems[pIndex].submissionsCount = (problems[pIndex].submissionsCount || 0) + 1;
        if (status === "AC") {
          problems[pIndex].acceptanceCount = (problems[pIndex].acceptanceCount || 0) + 1;
        }
        localStorage.setItem("oj_problems", JSON.stringify(problems));
      }

      return { status: 201, data: newSubmission };
    }

    return {
      status: 404,
      data: { message: `Mock route not found: ${method} ${url}` }
    };
  };
};
