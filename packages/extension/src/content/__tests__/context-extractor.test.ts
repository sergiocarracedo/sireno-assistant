import { beforeEach, describe, expect, it } from "vitest";
import type { FieldRef } from "../../shared/types";
import { extractContext } from "../context-extractor";

describe("context-extractor", () => {
  const mockFields: FieldRef[] = [
    {
      id: "id-email",
      frameId: 0,
      selector: "#email",
      kind: "input",
      inputType: "email",
      labelHint: "Email",
      value: "test@example.com",
    },
    {
      id: "id-name",
      frameId: 0,
      selector: "#name",
      kind: "input",
      inputType: "text",
      labelHint: "Name",
      value: "John Doe",
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = "<h1>Test Page</h1><p>Some content here</p>";

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        hostname: "example.com",
        href: "https://example.com/test",
      },
      writable: true,
    });
  });

  describe("extractContext - none level", () => {
    it("should return minimal context", () => {
      const context = extractContext("none", [], mockFields);

      expect(context.level).toBe("none");
      expect(context.domain).toBeUndefined();
      expect(context.url).toBeUndefined();
      expect(context.selectedFields).toBeUndefined();
      expect(context.pageText).toBeUndefined();
    });
  });

  describe("extractContext - domain level", () => {
    it("should include domain", () => {
      const context = extractContext("domain", [], mockFields);

      expect(context.level).toBe("domain");
      expect(context.domain).toBe("example.com");
      expect(context.url).toBeUndefined();
      expect(context.selectedFields).toBeUndefined();
    });
  });

  describe("extractContext - url level", () => {
    it("should include domain and url", () => {
      const context = extractContext("url", [], mockFields);

      expect(context.level).toBe("url");
      expect(context.domain).toBe("example.com");
      expect(context.url).toBe("https://example.com/test");
      expect(context.selectedFields).toBeUndefined();
    });
  });

  describe("extractContext - selected level", () => {
    it("should include selected fields with values", () => {
      const selectedIds = ["id-email"];
      const context = extractContext("selected", selectedIds, mockFields);

      expect(context.level).toBe("selected");
      expect(context.domain).toBe("example.com");
      expect(context.url).toBe("https://example.com/test");
      expect(context.selectedFields).toHaveLength(1);
      expect(context.selectedFields?.[0].id).toBe("id-email");
      expect(context.selectedFields?.[0].value).toBe("test@example.com");
    });

    it("should filter to only selected fields", () => {
      const selectedIds = ["id-email", "id-name"];
      const context = extractContext("selected", selectedIds, mockFields);

      expect(context.selectedFields).toHaveLength(2);
    });
  });

  describe("extractContext - allPage level", () => {
    it("should include page text", () => {
      const context = extractContext("allPage", [], mockFields);

      expect(context.level).toBe("allPage");
      expect(context.pageText).toBeDefined();
      expect(context.pageText).toContain("Test Page");
      expect(context.pageText).toContain("Some content here");
    });

    it("should cap page text at specified limit", () => {
      document.body.innerHTML = "<p>" + "a".repeat(20000) + "</p>";

      const context = extractContext("allPage", [], mockFields, 5000);

      expect(context.pageText).toBeDefined();
      expect(context.pageText!.length).toBeLessThanOrEqual(5004); // 5000 + '...'
      expect(context.pageText).toMatch(/\.\.\.$/);
    });

    it("should remove scripts and styles from page text", () => {
      document.body.innerHTML = `
        <p>Visible content</p>
        <script>console.log('hidden')</script>
        <style>.hidden { display: none; }</style>
        <div hidden>Hidden div</div>
      `;

      const context = extractContext("allPage", [], mockFields);

      expect(context.pageText).toContain("Visible content");
      expect(context.pageText).not.toContain("console.log");
      expect(context.pageText).not.toContain(".hidden");
      expect(context.pageText).not.toContain("Hidden div");
    });

    it("should normalize whitespace", () => {
      document.body.innerHTML = `
        <p>Line   with    spaces</p>
        <p>
          Multiple
          lines
        </p>
      `;

      const context = extractContext("allPage", [], mockFields);

      expect(context.pageText).not.toMatch(/\s{2,}/);
      expect(context.pageText).toMatch(/Line with spaces/);
    });
  });

  describe("extractContext - level hierarchy", () => {
    it("should include all lower-level context at higher levels", () => {
      const selectedIds = ["id-email"];

      const domainContext = extractContext("domain", selectedIds, mockFields);
      expect(domainContext.domain).toBeDefined();
      expect(domainContext.url).toBeUndefined();

      const urlContext = extractContext("url", selectedIds, mockFields);
      expect(urlContext.domain).toBeDefined();
      expect(urlContext.url).toBeDefined();
      expect(urlContext.selectedFields).toBeUndefined();

      const selectedContext = extractContext("selected", selectedIds, mockFields);
      expect(selectedContext.domain).toBeDefined();
      expect(selectedContext.url).toBeDefined();
      expect(selectedContext.selectedFields).toBeDefined();
      expect(selectedContext.pageText).toBeUndefined();

      const allPageContext = extractContext("allPage", selectedIds, mockFields);
      expect(allPageContext.domain).toBeDefined();
      expect(allPageContext.url).toBeDefined();
      expect(allPageContext.selectedFields).toBeDefined();
      expect(allPageContext.pageText).toBeDefined();
    });
  });
});
