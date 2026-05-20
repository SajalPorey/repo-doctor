import type { TechStack } from "@/lib/detector";

export interface TestingGuideStep {
  title: string;
  description: string;
  code?: string;
  language?: string;
}

export interface TestingGuide {
  title: string;
  description: string;
  steps: TestingGuideStep[];
}

export function getTestingGuide(stack: TechStack): TestingGuide {
  switch (stack) {
    case "typescript":
    case "javascript":
      return getJsGuide(stack === "typescript");
    case "python":
      return getPythonGuide();
    case "rust":
      return getRustGuide();
    case "go":
      return getGoGuide();
    case "java":
      return getJavaGuide();
    case "php":
      return getPhpGuide();
    case "ruby":
      return getRubyGuide();
    default:
      return getGenericGuide();
  }
}

function getJsGuide(isTs: boolean): TestingGuide {
  return {
    title: "Vitest Setup Guide",
    description: "Set up Vitest, a blazing fast test framework.",
    steps: [
      {
        title: "1. Install Vitest",
        description: "Run this command to install Vitest as a dev dependency.",
        code: "npm install -D vitest",
        language: "bash"
      },
      {
        title: "2. Add test script",
        description: "Update your package.json scripts to include the test runner.",
        code: `"scripts": {\n  "test": "vitest run"\n}`,
        language: "json"
      },
      {
        title: "3. Write your first test",
        description: `Create a file named \`math.test.${isTs ? "ts" : "js"}\` and add a basic test.`,
        code: `import { expect, test } from 'vitest';\n\ntest('math works', () => {\n  expect(1 + 1).toBe(2);\n});`,
        language: isTs ? "typescript" : "javascript"
      }
    ]
  };
}

function getPythonGuide(): TestingGuide {
  return {
    title: "Pytest Setup Guide",
    description: "Set up pytest, the most popular testing framework for Python.",
    steps: [
      {
        title: "1. Install pytest",
        description: "Install pytest via pip.",
        code: "pip install pytest",
        language: "bash"
      },
      {
        title: "2. Write your first test",
        description: "Create a file named `test_math.py` and write a simple test function.",
        code: `def test_math():\n    assert 1 + 1 == 2`,
        language: "python"
      },
      {
        title: "3. Run tests",
        description: "Execute pytest in your terminal.",
        code: "pytest",
        language: "bash"
      }
    ]
  };
}

function getRustGuide(): TestingGuide {
  return {
    title: "Rust Testing Guide",
    description: "Rust has built-in support for testing! No external tools required.",
    steps: [
      {
        title: "1. Write your first test",
        description: "Add a test module directly in your `src/main.rs` or `src/lib.rs` file.",
        code: `#[cfg(test)]\nmod tests {\n    #[test]\n    fn it_works() {\n        assert_eq!(2 + 2, 4);\n    }\n}`,
        language: "rust"
      },
      {
        title: "2. Run tests",
        description: "Use cargo to run your tests.",
        code: "cargo test",
        language: "bash"
      }
    ]
  };
}

function getGoGuide(): TestingGuide {
  return {
    title: "Go Testing Guide",
    description: "Go has a robust testing framework built right into the standard library.",
    steps: [
      {
        title: "1. Write your first test",
        description: "Create a file ending with `_test.go` (e.g., `math_test.go`).",
        code: `package main\n\nimport "testing"\n\nfunc TestMath(t *testing.T) {\n    if 1+1 != 2 {\n        t.Errorf("Math is broken")\n    }\n}`,
        language: "go"
      },
      {
        title: "2. Run tests",
        description: "Use the go toolchain to run tests.",
        code: "go test ./...",
        language: "bash"
      }
    ]
  };
}

function getJavaGuide(): TestingGuide {
  return {
    title: "JUnit Setup Guide",
    description: "Add JUnit 5 to your project for robust Java testing.",
    steps: [
      {
        title: "1. Add Dependency (Maven)",
        description: "Add JUnit to your `pom.xml` dependencies.",
        code: `<dependency>\n    <groupId>org.junit.jupiter</groupId>\n    <artifactId>junit-jupiter</artifactId>\n    <version>5.10.2</version>\n    <scope>test</scope>\n</dependency>`,
        language: "xml"
      },
      {
        title: "2. Write your first test",
        description: "Create a test class in `src/test/java/ExampleTest.java`.",
        code: `import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.assertEquals;\n\nclass ExampleTest {\n    @Test\n    void mathWorks() {\n        assertEquals(2, 1 + 1);\n    }\n}`,
        language: "java"
      },
      {
        title: "3. Run tests",
        description: "Run tests via Maven.",
        code: "mvn test",
        language: "bash"
      }
    ]
  };
}

function getPhpGuide(): TestingGuide {
  return {
    title: "PHPUnit Setup Guide",
    description: "Set up PHPUnit for testing your PHP codebase.",
    steps: [
      {
        title: "1. Install PHPUnit",
        description: "Install PHPUnit as a development dependency via Composer.",
        code: "composer require --dev phpunit/phpunit",
        language: "bash"
      },
      {
        title: "2. Write your first test",
        description: "Create `tests/ExampleTest.php`.",
        code: `<?php\nuse PHPUnit\\Framework\\TestCase;\n\nfinal class ExampleTest extends TestCase\n{\n    public function testMath(): void\n    {\n        $this->assertSame(2, 1 + 1);\n    }\n}`,
        language: "php"
      },
      {
        title: "3. Run tests",
        description: "Execute PHPUnit from the vendor binary.",
        code: "./vendor/bin/phpunit tests",
        language: "bash"
      }
    ]
  };
}

function getRubyGuide(): TestingGuide {
  return {
    title: "RSpec Setup Guide",
    description: "Set up RSpec, the most popular behavior-driven testing tool for Ruby.",
    steps: [
      {
        title: "1. Install RSpec",
        description: "Add rspec to your Gemfile or install directly.",
        code: "gem install rspec\nrspec --init",
        language: "bash"
      },
      {
        title: "2. Write your first test",
        description: "Create a file named `spec/example_spec.rb`.",
        code: `RSpec.describe "Math" do\n  it "works" do\n    expect(1 + 1).to eq(2)\n  end\nend`,
        language: "ruby"
      },
      {
        title: "3. Run tests",
        description: "Execute the spec files.",
        code: "rspec",
        language: "bash"
      }
    ]
  };
}

function getGenericGuide(): TestingGuide {
  return {
    title: "Generic Testing Guide",
    description: "A testing framework wasn't automatically identified. Choose a framework for your language.",
    steps: [
      {
        title: "1. Pick a Framework",
        description: "Search for the most popular testing framework for your programming language.",
      },
      {
        title: "2. Install and Configure",
        description: "Follow the framework's official documentation to install it into your project.",
      },
      {
        title: "3. Write and Run Tests",
        description: "Write at least one basic assertion and run the test suite locally.",
      }
    ]
  };
}
