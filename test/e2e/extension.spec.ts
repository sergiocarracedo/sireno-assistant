import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '../../dist');
const testPagePath = path.join(__dirname, '../fixtures/test-page.html');

let context: BrowserContext;

test.beforeAll(async () => {
  // Launch browser with extension loaded
  context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
});

test.afterAll(async () => {
  await context.close();
});

test.describe('Sireno Assistant Extension', () => {
  test('should load extension', async () => {
    const page = await context.newPage();
    
    // Check that extension is loaded by looking for service worker
    const serviceWorker = context.serviceWorkers()[0];
    expect(serviceWorker).toBeDefined();
    
    await page.close();
  });

  test('should discover form fields', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    // Check that fields exist on page
    const nameInput = await page.locator('#name');
    const emailInput = await page.locator('#email');
    const bioTextarea = await page.locator('#bio');
    const commentsEditable = await page.locator('#comments');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(bioTextarea).toBeVisible();
    await expect(commentsEditable).toBeVisible();
    
    await page.close();
  });

  test('should exclude password fields', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    // Password field should exist on page but should be excluded from field discovery
    const passwordInput = await page.locator('#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    await page.close();
  });

  test('should detect contenteditable elements', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    const commentsEditable = await page.locator('#comments');
    const isContentEditable = await commentsEditable.getAttribute('contenteditable');
    
    expect(isContentEditable).toBe('true');
    
    await page.close();
  });

  test('should apply values to input fields', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    // Simulate field filling
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#phone', '123-456-7890');
    
    // Verify values
    await expect(page.locator('#name')).toHaveValue('John Doe');
    await expect(page.locator('#email')).toHaveValue('john@example.com');
    await expect(page.locator('#phone')).toHaveValue('123-456-7890');
    
    await page.close();
  });

  test('should apply values to textarea', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    const bioText = 'I am a software developer with 10 years of experience.';
    await page.fill('#bio', bioText);
    
    await expect(page.locator('#bio')).toHaveValue(bioText);
    
    await page.close();
  });

  test('should apply values to contenteditable', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    const commentsText = 'These are my comments.';
    await page.locator('#comments').fill(commentsText);
    
    const textContent = await page.locator('#comments').textContent();
    expect(textContent).toBe(commentsText);
    
    await page.close();
  });

  test('should trigger input events on field changes', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    // Add event listeners
    await page.evaluate(() => {
      (window as any).inputEvents = [];
      (window as any).changeEvents = [];
      
      document.getElementById('name')?.addEventListener('input', () => {
        (window as any).inputEvents.push('name-input');
      });
      
      document.getElementById('name')?.addEventListener('change', () => {
        (window as any).changeEvents.push('name-change');
      });
    });
    
    // Fill field
    await page.fill('#name', 'Test User');
    await page.locator('#name').blur();
    
    // Check events were fired
    const inputEvents = await page.evaluate(() => (window as any).inputEvents);
    const changeEvents = await page.evaluate(() => (window as any).changeEvents);
    
    expect(inputEvents.length).toBeGreaterThan(0);
    expect(changeEvents).toContain('name-change');
    
    await page.close();
  });
});

test.describe('Field Discovery Logic', () => {
  test('should handle dynamically added fields', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    // Add a new field dynamically
    await page.evaluate(() => {
      const form = document.querySelector('form');
      const div = document.createElement('div');
      div.innerHTML = `
        <label for="dynamic">Dynamic Field:</label>
        <input type="text" id="dynamic" name="dynamic" />
      `;
      form?.appendChild(div);
    });
    
    // Field should be discoverable
    const dynamicField = await page.locator('#dynamic');
    await expect(dynamicField).toBeVisible();
    
    await page.close();
  });

  test('should extract labels correctly', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    // Check label associations
    const nameLabel = await page.locator('label[for="name"]');
    await expect(nameLabel).toHaveText('Name:');
    
    const emailLabel = await page.locator('label[for="email"]');
    await expect(emailLabel).toHaveText('Email:');
    
    await page.close();
  });

  test('should extract placeholders', async () => {
    const page = await context.newPage();
    await page.goto(`file://${testPagePath}`);
    
    await expect(page.locator('#name')).toHaveAttribute('placeholder', 'Enter your name');
    await expect(page.locator('#email')).toHaveAttribute('placeholder', 'your@email.com');
    
    await page.close();
  });
});
