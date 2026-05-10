import * as assert from "node:assert/strict";
import { computeHealthDeclineScore } from "../src/modules/health/health-monitoring.service";

function run() {
  const high = computeHealthDeclineScore({
    stepsRecent: 3000,
    stepsBase: 7000,
    sleepRecent: 320,
    sleepBase: 460,
    rhrRecent: 92,
    rhrBase: 78,
    activeRecent: 18,
    activeBase: 45,
  });
  assert.equal(high.score >= 2, true);
  assert.equal(high.triggered.includes("resting_hr_increase"), true);

  const stable = computeHealthDeclineScore({
    stepsRecent: 6500,
    stepsBase: 6800,
    sleepRecent: 430,
    sleepBase: 440,
    rhrRecent: 79,
    rhrBase: 78,
    activeRecent: 42,
    activeBase: 43,
  });
  assert.equal(stable.score, 0);

  const missing = computeHealthDeclineScore({
    stepsRecent: null,
    stepsBase: null,
    sleepRecent: null,
    sleepBase: null,
    rhrRecent: null,
    rhrBase: null,
    activeRecent: null,
    activeBase: null,
  });
  assert.equal(missing.score, 0);

  console.log("health-wellbeing test passed");
}

run();
