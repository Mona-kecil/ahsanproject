import assert from "node:assert/strict";
import test from "node:test";

import { applyProjectReaction } from "../app/lib/project-reactions.ts";

const initial = { following: false, supported: false, supportCount: 4 };

test("follow changes independently from support", () => {
  assert.deepEqual(applyProjectReaction(initial, { kind: "follow", active: true }), {
    following: true,
    supported: false,
    supportCount: 4,
  });
});

test("support adjusts its count once for the requested state", () => {
  const supported = applyProjectReaction(initial, { kind: "support", active: true });
  assert.equal(supported.supportCount, 5);
  assert.equal(applyProjectReaction(supported, { kind: "support", active: true }).supportCount, 5);
  assert.equal(applyProjectReaction(supported, { kind: "support", active: false }).supportCount, 4);
});

test("support counts never become negative", () => {
  const inconsistent = { following: false, supported: true, supportCount: 0 };
  assert.equal(applyProjectReaction(inconsistent, { kind: "support", active: false }).supportCount, 0);
});
