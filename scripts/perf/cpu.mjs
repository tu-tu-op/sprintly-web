import fs from 'node:fs';
import { aggregateSessions, computeAchievements, computePersonalRecords, filterSessionsByRange, getStreakStats, sessionCompositeScore } from '../../lib/sprintly/analytics.ts';
import { DEMO_SESSIONS } from '../../lib/sprintly/demo-data.ts';

const now = new Date('2026-09-05T12:00:00Z');
const sessions = Array.from({length: 3000}, (_, i) => ({ ...DEMO_SESSIONS[i % DEMO_SESSIONS.length], sessionId: `bench-${i}`, startedAt: new Date(now.getTime() - (i % 7) * 86400000).toISOString() }));
const streaks = getStreakStats(sessions, now, 'Asia/Kolkata');
const samples = {};
for (const [name, fn] of Object.entries({
  aggregate: () => aggregateSessions(sessions),
  filter: () => filterSessionsByRange(sessions, 'week', now, undefined, 'Asia/Kolkata'),
  achievements: () => computeAchievements(sessions, streaks, 'Asia/Kolkata'),
  personalRecords: () => computePersonalRecords(sessions, streaks, 'Asia/Kolkata'),
  scoreSort: () => [...sessions].sort((a,b) => sessionCompositeScore(b) - sessionCompositeScore(a)),
})) {
  fn(); const times = [];
  for (let i = 0; i < 7; i++) { const start = performance.now(); fn(); times.push(performance.now() - start); }
  samples[name] = { medianMs: [...times].sort((a,b) => a-b)[3], samplesMs: times };
}
fs.mkdirSync('docs/performance/measurements', {recursive:true});
fs.writeFileSync(`docs/performance/measurements/${process.argv[2] || 'baseline'}-cpu.json`, JSON.stringify({ sessions: sessions.length, now, samples }, null, 2));
console.log(JSON.stringify(samples, null, 2));
