const assert = require("assert");
const GitHubSync = require("../main");

describe("GitHub Script Sync Adapter", function() {
  let adapter;

  before(function(done) {
    // Setup adapter for testing
    adapter = new GitHubSync({
      name: "githubsync",
      dirname: __dirname.replace(/\/test$/, ""),
      loglevel: "debug",
      testing: true
    });

    adapter.on("ready", () => {
      done();
    });
  });

  it("should parse GitHub URL correctly", function() {
    const testCases = [
      {
        url: "https://github.com/user/repo",
        expected: { owner: "user", repo: "repo" }
      },
      {
        url: "https://github.com/user/my-repo",
        expected: { owner: "user", repo: "my-repo" }
      },
      {
        url: "git@github.com:user/repo.git",
        expected: { owner: "user", repo: "repo" }
      }
    ];

    testCases.forEach(testCase => {
      const result = adapter.parseGitHubUrl(testCase.url);
      assert.strictEqual(result.owner, testCase.expected.owner);
      assert.strictEqual(result.repo, testCase.expected.repo);
    });
  });

  it("should match file patterns correctly", function() {
    const testCases = [
      { file: "script.js", pattern: "**/*.js", expected: true },
      { file: "test_script.js", pattern: "test_*.js", expected: true },
      { file: "script.txt", pattern: "**/*.js", expected: false },
      { file: "lib/helper.js", pattern: "**/*.js", expected: true }
    ];

    testCases.forEach(testCase => {
      const result = adapter.matchesPattern(testCase.file, testCase.pattern);
      assert.strictEqual(result, testCase.expected,
        `Pattern "${testCase.pattern}" should ${testCase.expected ? "match" : "not match"} "${testCase.file}"`
      );
    });
  });

  it("should initialize required states", async function() {
    // Check if states are created
    const states = [
      "syncNow",
      "lastSync",
      "lastError",
      "syncStatus",
      "syncCount",
      "connected"
    ];

    for (const state of states) {
      const obj = await adapter.getObjectAsync(`${adapter.namespace}.${state}`);
      assert(obj, `State ${state} should be created`);
    }
  });

  after(function(done) {
    adapter.terminate(done);
  });
});
