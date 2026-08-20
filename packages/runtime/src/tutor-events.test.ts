import { describe, expect, it } from "vitest";
import { isLoopbackTutorHost } from "./tutor-events.ts";

describe("tutor event publication boundary", () => {
  it("allows only local development hosts", () => {
    expect(isLoopbackTutorHost("127.0.0.1")).toBe(true);
    expect(isLoopbackTutorHost("localhost")).toBe(true);
    expect(isLoopbackTutorHost("::1")).toBe(true);
    expect(isLoopbackTutorHost("courses.example.com")).toBe(false);
  });
});
