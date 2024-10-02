import { expect, group, test } from './mod.ts';
import { delay } from '@std/async';

group('0 group', () => {
  test('1 test', () => {
    expect(true).toBe(false);
  });

  test('2 test', async () => {
    expect(1 + 1).toBe(2);
  });

  test('3 test', () => {
    expect.toFail('Fails');
    expect.toPass();
  });
});

Deno.test('4 group', async (t) => {
  await t.step('5 group', async (t) => {
    await t.step('6 test', async () => {
      await delay(1000);
      expect(1 + 1).toBe(2);
    });

    await t.step('7 group', async (tn) => {
      await tn.step('8 test with a very long name', () => {
        expect.toFail('Fails');
        expect.toPass();
      });

      // expect.toFail('Fails');
      expect.toPass();
    });
  });
});

Deno.test('9 test', () => {
  // expect.toFail('Fails');
  expect(1 + 1).toBe(2);
});
