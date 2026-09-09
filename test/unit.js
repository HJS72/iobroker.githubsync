const assert = require("assert");
const {
  shouldIncludeFile,
  matchesGlobPattern,
  parseGitHubUrl,
  isValidGitHubUrl,
  isValidGitHubToken,
} = require("../lib/helpers");

describe("lib/helpers", function () {
  describe("shouldIncludeFile / matchesGlobPattern", function () {
    const cases = [
      { file: "script.js", pattern: "**/*.js", exclude: "", expected: true },
      { file: "sub/script.js", pattern: "**/*.js", exclude: "", expected: true },
      { file: "script.txt", pattern: "**/*.js", exclude: "", expected: false },
      { file: "test_foo.js", pattern: "**/*.js", exclude: "test_*.js", expected: false },
      { file: "script.ts", pattern: "**/*.js,**/*.ts", exclude: "", expected: true },
      { file: "sub/script.ts", pattern: "**/*.js,**/*.ts", exclude: "", expected: true },
      { file: "readme.md", pattern: "**/*.js,**/*.ts", exclude: "", expected: false },
    ];

    cases.forEach(({ file, pattern, exclude, expected }) => {
      it(`"${file}" vs include "${pattern}" exclude "${exclude}" => ${expected}`, function () {
        assert.strictEqual(shouldIncludeFile(file, pattern, exclude), expected);
      });
    });

    it("empty pattern matches everything", function () {
      assert.strictEqual(matchesGlobPattern("anything.xyz", ""), true);
    });
  });

  describe("parseGitHubUrl", function () {
    it("parses https URLs", function () {
      const result = parseGitHubUrl("https://github.com/user/repo");
      assert.deepStrictEqual(result, { owner: "user", repo: "repo", url: "https://github.com/user/repo" });
    });

    it("parses https URLs with .git suffix", function () {
      const result = parseGitHubUrl("https://github.com/user/my-repo.git");
      assert.strictEqual(result.owner, "user");
      assert.strictEqual(result.repo, "my-repo");
    });

    it("parses SSH URLs", function () {
      const result = parseGitHubUrl("git@github.com:user/repo.git");
      assert.strictEqual(result.owner, "user");
      assert.strictEqual(result.repo, "repo");
    });

    it("returns null for non-GitHub URLs", function () {
      assert.strictEqual(parseGitHubUrl("https://gitlab.com/user/repo"), null);
    });

    it("returns null for empty input", function () {
      assert.strictEqual(parseGitHubUrl(""), null);
    });
  });

  describe("isValidGitHubUrl", function () {
    it("accepts https and ssh GitHub URLs", function () {
      assert.strictEqual(isValidGitHubUrl("https://github.com/user/repo"), true);
      assert.strictEqual(isValidGitHubUrl("git@github.com:user/repo.git"), true);
    });

    it("rejects other URLs", function () {
      assert.strictEqual(isValidGitHubUrl("https://gitlab.com/user/repo"), false);
      assert.strictEqual(isValidGitHubUrl(""), false);
    });
  });

  describe("isValidGitHubToken", function () {
    it("accepts known GitHub token prefixes", function () {
      assert.strictEqual(isValidGitHubToken("ghp_abcdef123456"), true);
      assert.strictEqual(isValidGitHubToken("gho_abcdef123456"), true);
    });

    it("rejects tokens with unknown prefixes", function () {
      assert.strictEqual(isValidGitHubToken("abcdef123456"), false);
      assert.strictEqual(isValidGitHubToken(""), false);
    });
  });
});
