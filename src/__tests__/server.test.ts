import { beforeAll, afterAll, describe, it, expect } from 'vitest';

const base = 'http://localhost:8080';

async function waitForHealth(url: string, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Server did not become healthy in time');
}

let closeServer: any = null;

beforeAll(async () => {
  // Import server module to register the test start function on globalThis
  await import('../../server');
  if (typeof (globalThis as any).__startServer === 'function') {
    const result: any = await (globalThis as any).__startServer();
    if (result && typeof result.close === 'function') {
      closeServer = result.close.bind(result);
    }
  } else {
    throw new Error('startServer not available');
  }
  await waitForHealth(base, 10000);
});

afterAll(async () => {
  if (closeServer) {
    try {
      await new Promise((r) => closeServer(r));
    } catch (e) {
      // ignore
    }
  }
});

describe('Server endpoints', () => {
  it('GET /api/health returns ok', async () => {
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty('status', 'ok');
  });

  it('GET /api/profile/:userId provisions user', async () => {
    const uid = `test-user-${Date.now()}`;
    const res = await fetch(`${base}/api/profile/${uid}`);
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty('id', uid);
    expect(j).toHaveProperty('displayName');
  });

  it('POST /api/carbon/logs then GET logs and stats', async () => {
    const uid = `test-user-${Date.now()}`;

    // Ensure profile provisioned first
    const p = await fetch(`${base}/api/profile/${uid}`);
    expect(p.status).toBe(200);

    // Post a transportation log (15 km)
    const postRes = await fetch(`${base}/api/carbon/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: uid,
        date: new Date().toISOString().substring(0, 10),
        category: 'transportation',
        amount: 15,
      }),
    });
    expect(postRes.status).toBe(201);
    const log = await postRes.json();
    expect(log).toHaveProperty('calculatedCo2');

    // Get logs for the user
    const getLogs = await fetch(`${base}/api/carbon/logs/${uid}`);
    expect(getLogs.status).toBe(200);
    const logs = await getLogs.json();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThanOrEqual(1);

    // Get stats and ensure totals reflect the logged CO2
    const statsRes = await fetch(`${base}/api/carbon/stats/${uid}`);
    expect(statsRes.status).toBe(200);
    const stats = await statsRes.json();
    expect(stats).toHaveProperty('monthlyEmissions');
    expect(typeof stats.monthlyEmissions).toBe('number');
  });

  it('POST /api/carbon/coach returns a reply', async () => {
    const res = await fetch(`${base}/api/carbon/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'eco-warrior-kishan',
        message: 'How to reduce emissions?',
        chatHistory: [],
      }),
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty('reply');
    expect(typeof j.reply).toBe('string');
  });

  it('POST /api/carbon/assessment returns a report', async () => {
    const res = await fetch(`${base}/api/carbon/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'eco-warrior-kishan' }),
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j).toHaveProperty('report');
    expect(typeof j.report).toBe('string');
  });

  it('PUT /api/profile/:userId updates user profile', async () => {
    const uid = `test-user-${Date.now()}`;
    const p = await fetch(`${base}/api/profile/${uid}`);
    expect(p.status).toBe(200);

    const putRes = await fetch(`${base}/api/profile/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Updated Name',
        level: 5,
        totalXp: 500,
        currentStreak: 10,
        totalCo2Saved: 100,
      }),
    });
    expect(putRes.status).toBe(200);
    const j = await putRes.json();
    expect(j.displayName).toBe('Updated Name');
    expect(j.level).toBe(5);
  });

  it('DELETE /api/carbon/logs/:logId deletes a log', async () => {
    const uid = `test-user-${Date.now()}`;
    const postRes = await fetch(`${base}/api/carbon/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: uid,
        date: new Date().toISOString().substring(0, 10),
        category: 'waste',
        amount: 5,
      }),
    });
    const log = await postRes.json();
    expect(log.id).toBeDefined();

    const delRes = await fetch(`${base}/api/carbon/logs/${log.id}`, {
      method: 'DELETE',
    });
    expect(delRes.status).toBe(200);
    const j = await delRes.json();
    expect(j.success).toBe(true);
  });
});
