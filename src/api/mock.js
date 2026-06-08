// Helper to decode/encode base64 for token simulation
const encodeBase64 = (str) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

// Seed default questions
const SEED_PROBLEMS = [
  {
    id: "Q1",
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    difficulty: "easy",
    tags: ["array", "hash-table"]
  },
  {
    id: "Q2",
    title: "Reverse String",
    slug: "reverse-string",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    constraints: "1 <= s.length <= 10^5\ns[i] is a printable ascii character.",
    input: "s = ['h','e','l','l','o']",
    output: "['o','l','l','e','h']",
    difficulty: "easy",
    tags: ["string", "two-pointers"]
  },
  {
    id: "Q3",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    input: "s = \"abcabcbb\"",
    output: "3",
    difficulty: "medium",
    tags: ["string", "sliding-window"]
  },
  {
    id: "Q4",
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\nThe overall run time complexity should be O(log (m+n)).",
    constraints: "nums1.length == m, nums2.length == n\n0 <= m, n <= 1000\n-10^6 <= nums1[i], nums2[i] <= 10^6",
    input: "nums1 = [1,3], nums2 = [2]",
    output: "2.00000",
    difficulty: "hard",
    tags: ["array", "binary-search", "divide-and-conquer"]
  }
];

const SEED_COMMENTS = [
  {
    id: "c1",
    problem_id: "two-sum",
    user_id: "u2",
    username: "AliceCoder",
    body: "Excellent problem for beginners! The hash map approach is O(N) runtime and O(N) space.",
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "c2",
    problem_id: "two-sum",
    user_id: "u3",
    username: "BobDev",
    body: "Can we solve this in O(1) space if the array is already sorted?",
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "c3",
    problem_id: "two-sum",
    user_id: "u1", // admin
    username: "Bansal",
    body: "Yes Bob, if the array is sorted, you can use the two-pointer approach for O(1) space complexity!",
    is_deleted: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Seed localStorage if empty
if (!localStorage.getItem("oj_problems")) {
  localStorage.setItem("oj_problems", JSON.stringify(SEED_PROBLEMS));
}
if (!localStorage.getItem("oj_comments")) {
  localStorage.setItem("oj_comments", JSON.stringify(SEED_COMMENTS));
}
if (!localStorage.getItem("oj_users")) {
  // Admin user
  localStorage.setItem("oj_users", JSON.stringify([
    {
      id: "u1",
      username: "Bansal",
      email: "sumitbansal1290@gmail.com",
      password_hash: "admin123",
      role: "admin",
      created_at: new Date().toISOString()
    },
    {
      id: "u2",
      username: "AliceCoder",
      email: "alice@example.com",
      password_hash: "user123",
      role: "user",
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
    const comments = JSON.parse(localStorage.getItem("oj_comments") || "[]");
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

    // POST /auth/register
    if (url.endsWith("/auth/register") && method === "post") {
      const { username, email, password } = body;
      if (users.find(u => u.email === email)) {
        return {
          status: 400,
          data: { message: "User with this email already exists" }
        };
      }
      const newUser = {
        id: "u_" + Math.random().toString(36).substr(2, 9),
        username,
        email,
        password_hash: password, // plain text for mock simplicity
        role: "user",
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem("oj_users", JSON.stringify(users));

      return {
        status: 201,
        data: { message: "Registration successful" }
      };
    }

    // POST /auth/login
    if (url.endsWith("/auth/login") && method === "post") {
      const { email, password } = body;
      const user = users.find(u => u.email === email && u.password_hash === password);
      if (!user) {
        return {
          status: 401,
          data: { message: "Invalid email or password" }
        };
      }

      const token = generateFakeJWT(user);
      localStorage.setItem("oj_session", JSON.stringify({ userId: user.id, refreshToken: "fake_refresh_token" }));

      return {
        status: 200,
        headers: {
          "Set-Cookie": "refreshToken=fake_refresh_token; HttpOnly" // simulate set cookie
        },
        data: { accessToken: token }
      };
    }

    // POST /auth/refresh
    if (url.endsWith("/auth/refresh") && method === "post") {
      if (!activeSession) {
        return {
          status: 401,
          data: { message: "No refresh token provided" }
        };
      }
      const user = users.find(u => u.id === activeSession.userId);
      if (!user) {
        return {
          status: 401,
          data: { message: "Invalid user session" }
        };
      }

      const token = generateFakeJWT(user);
      return {
        status: 200,
        data: { accessToken: token }
      };
    }

    // POST /auth/logout
    if (url.endsWith("/auth/logout") && method === "post") {
      localStorage.removeItem("oj_session");
      return {
        status: 200,
        data: { message: "Logged out successfully" }
      };
    }

    // -----------------------------------------------------------------
    // PROBLEMS ROUTER
    // -----------------------------------------------------------------

    // GET /problems (Public)
    if (url.match(/\/problems$/) && method === "get") {
      // Parse query params manually from the config params or URL
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

      if (tag) {
        filtered = filtered.filter(p => p.tags.includes(tag.toLowerCase()));
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

      return {
        status: 200,
        data: {
          problems: paginated,
          total: totalItems,
          page: parseInt(page),
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    }

    // GET /problems/:id (or :slug) (Public)
    const problemMatch = url.match(/\/problems\/([^/]+)$/);
    if (problemMatch && method === "get") {
      const param = problemMatch[1]; // could be ID or slug
      const problem = problems.find(p => p.id === param || p.slug === param);
      if (!problem) {
        return {
          status: 404,
          data: { message: "Problem not found" }
        };
      }
      return {
        status: 200,
        data: problem
      };
    }

    // POST /problems (Admin)
    if (url.endsWith("/problems") && method === "post") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }

      const { id, title, description, constraints, input, output, difficulty, tags } = body;
      if (problems.find(p => p.id === id || p.title === title)) {
        return { status: 400, data: { message: "Problem with this ID or Title already exists" } };
      }

      const newProblem = {
        id,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description,
        constraints,
        input,
        output,
        difficulty: difficulty.toLowerCase(),
        tags: Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean),
        created_by: authUser.id
      };

      problems.push(newProblem);
      localStorage.setItem("oj_problems", JSON.stringify(problems));

      return {
        status: 201,
        data: newProblem
      };
    }

    // PUT /problems/:id (Admin)
    const problemEditMatch = url.match(/\/problems\/([^/]+)$/);
    if (problemEditMatch && method === "put") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }

      const pId = problemEditMatch[1];
      const index = problems.findIndex(p => p.id === pId);
      if (index === -1) {
        return { status: 404, data: { message: "Problem not found" } };
      }

      const { title, description, constraints, input, output, difficulty, tags } = body;
      problems[index] = {
        ...problems[index],
        title: title || problems[index].title,
        slug: title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : problems[index].slug,
        description: description || problems[index].description,
        constraints: constraints || problems[index].constraints,
        input: input || problems[index].input,
        output: output || problems[index].output,
        difficulty: difficulty ? difficulty.toLowerCase() : problems[index].difficulty,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : problems[index].tags)
      };

      localStorage.setItem("oj_problems", JSON.stringify(problems));
      return {
        status: 200,
        data: problems[index]
      };
    }

    // DELETE /problems/:id (Admin)
    const problemDeleteMatch = url.match(/\/problems\/([^/]+)$/);
    if (problemDeleteMatch && method === "delete") {
      const authUser = getAuthUser();
      if (!authUser || authUser.role !== "admin") {
        return { status: 403, data: { message: "Admin privileges required" } };
      }

      const pId = problemDeleteMatch[1];
      const filteredProblems = problems.filter(p => p.id !== pId);
      if (filteredProblems.length === problems.length) {
        return { status: 404, data: { message: "Problem not found" } };
      }

      localStorage.setItem("oj_problems", JSON.stringify(filteredProblems));
      return {
        status: 200,
        data: { message: "Problem deleted successfully" }
      };
    }

    // -----------------------------------------------------------------
    // COMMENTS ROUTER
    // -----------------------------------------------------------------

    // GET /comments/:problemId
    const commentsGetMatch = url.match(/\/comments\/([^/]+)$/);
    if (commentsGetMatch && method === "get") {
      const pSlug = commentsGetMatch[1];
      const problemComments = comments.filter(c => c.problem_id === pSlug);
      // Soft-delete formatting: replace body with [deleted] if is_deleted
      const formattedComments = problemComments.map(c => ({
        ...c,
        body: c.is_deleted ? "[deleted]" : c.body,
        username: c.is_deleted ? "[deleted]" : c.username
      }));

      return {
        status: 200,
        data: formattedComments
      };
    }

    // POST /comments (Auth)
    if (url.endsWith("/comments") && method === "post") {
      const authUser = getAuthUser();
      if (!authUser) {
        return { status: 401, data: { message: "Authentication required" } };
      }

      const { problem_id, body: commentBody } = body;
      const newComment = {
        id: "c_" + Math.random().toString(36).substr(2, 9),
        problem_id,
        user_id: authUser.id,
        username: authUser.username,
        body: commentBody,
        is_deleted: false,
        created_at: new Date().toISOString()
      };

      comments.push(newComment);
      localStorage.setItem("oj_comments", JSON.stringify(comments));

      return {
        status: 201,
        data: newComment
      };
    }

    // DELETE /comments/:id (Owner or Admin)
    const commentDeleteMatch = url.match(/\/comments\/([^/]+)$/);
    if (commentDeleteMatch && method === "delete") {
      const authUser = getAuthUser();
      if (!authUser) {
        return { status: 401, data: { message: "Authentication required" } };
      }

      const cId = commentDeleteMatch[1];
      const index = comments.findIndex(c => c.id === cId);
      if (index === -1) {
        return { status: 404, data: { message: "Comment not found" } };
      }

      // Check if user is owner of comment OR is admin
      if (comments[index].user_id !== authUser.id && authUser.role !== "admin") {
        return { status: 403, data: { message: "Forbidden" } };
      }

      // Soft delete!
      comments[index].is_deleted = true;
      localStorage.setItem("oj_comments", JSON.stringify(comments));

      return {
        status: 200,
        data: { message: "Comment deleted (soft-deleted)" }
      };
    }

    // -----------------------------------------------------------------
    // Fallback
    // -----------------------------------------------------------------
    return {
      status: 404,
      data: { message: `Mock route not found: ${method} ${url}` }
    };
  };
};
