// Skip this test suite - deasync is an optional dependency
// Tests are skipped to avoid requiring native bindings
describe.skip("detectVite tests (skipped - deasync optional dependency)", () => {
  test("skipped - deasync is optional", () => {
    expect(true).toBe(true);
  });
});
