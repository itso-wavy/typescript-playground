import { expect, test } from '@playwright/test';

test('checks, completes, restores, and preserves a draft during navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?lesson=ts07.function-contracts');
  const editor = page.getByLabel('index.ts 코드');

  await expect(page.getByText('0 / 36')).toBeVisible();
  await page.getByRole('button', { name: '실행·확인' }).click();
  await expect(page.getByText('아직 타입 계약을 만족하지 않습니다.')).toBeVisible();

  await page.getByRole('button', { name: '해설 코드 보기' }).click();
  await page.getByRole('button', { name: '실행·확인' }).click();
  await expect(page.getByText('타입 계약을 통과했습니다.')).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('tiny-dev-lab:progress:local-preview'))).toContain('"completedAt"');
  await expect(page.locator('.progress-count')).toContainText('1 / 36');
  await page.screenshot({ path: 'docs/screenshots/learning-desktop-1440x1000.png', fullPage: true });

  await editor.press('End');
  await editor.press('Enter');
  await editor.pressSequentially('// resume after navigation');
  await page.getByRole('button', { name: '다음 실습' }).click();
  await expect(page).toHaveURL(/lesson=ts08\.generic-basics/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('tiny-dev-lab:progress:local-preview'))).toContain('resume after navigation');
  await page.goto('/?lesson=ts07.function-contracts');
  await expect(editor).toHaveValue(/resume after navigation/);
  await page.reload();
  await expect(page.getByLabel('index.ts 코드')).toHaveValue(/resume after navigation/);
});

test('fits the mobile learning screen without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?lesson=ts01.inference-literals');
  await expect(page.getByRole('heading', { name: '목록의 첫 항목을 꺼내도 원래 타입 유지하기' })).toBeVisible();
  await expect(page.locator('html').evaluate((element) => element.scrollWidth <= window.innerWidth)).resolves.toBeTruthy();
  await page.screenshot({ path: 'docs/screenshots/learning-mobile-390x844.png', fullPage: true });

  await page.setViewportSize({ width: 360, height: 844 });
  await expect(page.locator('html').evaluate((element) => element.scrollWidth <= window.innerWidth)).resolves.toBeTruthy();
  await page.screenshot({ path: 'docs/screenshots/learning-mobile-360x844.png', fullPage: true });
});
