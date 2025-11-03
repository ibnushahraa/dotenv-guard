// Skip this test suite - legacy keytar tests are no longer relevant
// The new crypto-based implementation is tested in cryptoEncryption.test.js
describe.skip("Legacy env.test.js (deprecated - keytar dependency removed)", () => {
  test("skipped - keytar is optional and legacy", () => {
    expect(true).toBe(true);
  });
});
