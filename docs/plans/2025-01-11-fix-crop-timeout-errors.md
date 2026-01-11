# Fix Crop Request Timeout and Service Worker Image Errors

> **For Claude:** This plan documents completed work. Future tasks should use @superpowers:executing-plans.

**Goal:** Fix crop request timeout bug and Image constructor error in service worker environment

**Architecture:**
- Replace storage polling pattern with direct image cropping using OffscreenCanvas API
- Replace Image() constructor with createImageBitmap() for service worker compatibility

**Tech Stack:** TypeScript, Chrome Extension Manifest V3, Vitest, OffscreenCanvas API

---

## Task 1: Fix Crop Request Timeout Bug

**Files:**
- Modify: `src/background.ts` (captureArea function)
- Test: `tests/capture-area.test.ts`

**Problem:** captureArea wrote to storage and polled for response, but nothing wrote the response → 10s timeout

**Solution:** Crop directly in background using OffscreenCanvas instead of storage polling

**Step 1: Write failing test (RED)**

File: `tests/capture-area.test.ts`

```typescript
it('should crop captured screenshot directly without polling storage', async () => {
  const selection = { x: 100, y: 100, width: 200, height: 150 }
  const result = await captureArea(selection, {
    devicePixelRatio: 1,
    zoomLevel: 1,
    viewportSize: { width: 1920, height: 1080 }
  })
  expect(result.base64).toBeTruthy()
  expect(result.base64.length).toBeGreaterThan(0)
}, 15000)
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/capture-area.test.ts --run`
Expected: FAIL with "Crop request timeout" after 10s

**Step 3: Write minimal implementation**

File: `src/background.ts`

Replace storage polling with direct cropping:

```typescript
// Capture screenshot
const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })

// Convert to Blob
const sourceBlob = await dataUrlToBlob(dataUrl)

// Create ImageBitmap
const bitmap = await createImageBitmap(sourceBlob)
const originalSize = { width: bitmap.width, height: bitmap.height }

// Calculate scaled selection
const scaleX = debugInfo ? originalSize.width / debugInfo.viewportSize.width : 1
const scaleY = debugInfo ? originalSize.height / debugInfo.viewportSize.height : 1
const scaledSelection = {
  x: selection.x * scaleX,
  y: selection.y * scaleY,
  width: selection.width * scaleX,
  height: selection.height * scaleY
}

// Create canvas and crop
const canvas = new OffscreenCanvas(scaledSelection.width, scaledSelection.height)
const ctx = canvas.getContext('2d')
ctx.drawImage(bitmap, scaledSelection.x, scaledSelection.y, ...)
bitmap.close()

// Convert to base64
const blob = await canvas.convertToBlob()
const base64 = await blobToBase64(blob)
```

Add helper functions:

```typescript
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(response => response.blob())
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',', 2)[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

Remove unused code:
- Remove `ensureOffscreenDocument` import
- Remove `CropRequestData`, `CropResponseData` interfaces
- Remove storage polling code

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/capture-area.test.ts --run`
Expected: PASS (3 tests)

**Step 5: Run all tests**

Run: `npm test -- --run`
Expected: 212+ tests passing

**Step 6: Build**

Run: `npm run build`
Expected: Build succeeds with background.ts in dist

**Step 7: Commit**

```bash
git add src/background.ts tests/capture-area.test.ts
git commit -m "Fix crop request timeout by cropping directly in background

- Remove storage polling pattern (was timing out after 10s)
- Implement cropping directly using OffscreenCanvas API
- Add tests for captureArea function
- Remove unused imports and interfaces

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Fix Image Constructor Not Available

**Files:**
- Modify: `src/background.ts` (use createImageBitmap instead of Image)
- Test: `tests/capture-area.test.ts` (add test for service worker env)

**Problem:** Image() constructor not available in service worker → ReferenceError

**Solution:** Use createImageBitmap() API which works in service workers

**Step 1: Write failing test (RED)**

File: `tests/capture-area.test.ts`

```typescript
it('should work in service worker environment without Image constructor', async () => {
  const selection = { x: 100, y: 100, width: 200, height: 150 }
  delete (global as any).Image  // Simulate service worker env

  const result = await captureArea(selection, {
    devicePixelRatio: 1,
    zoomLevel: 1,
    viewportSize: { width: 1920, height: 1080 }
  })

  expect(result.base64).toBeTruthy()
  expect(global.createImageBitmap).toHaveBeenCalled()
}, 15000)
```

Add mocks in beforeEach:
```typescript
global.createImageBitmap = vi.fn((blob: Blob) => {
  return Promise.resolve({
    width: 1920,
    height: 1080,
    close: vi.fn()
  } as any)
}) as any

global.fetch = vi.fn(() => {
  return Promise.resolve({
    blob: () => Promise.resolve(new Blob(['fake'], { type: 'image/png' }))
  })
}) as any
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/capture-area.test.ts --run`
Expected: FAIL with "Image is not defined"

**Step 3: Write minimal implementation**

Already done in Task 1 - code uses createImageBitmap instead of Image.

No changes needed - implementation is already correct from Task 1.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/capture-area.test.ts --run`
Expected: PASS (3 tests including new test)

**Step 5: Run all tests**

Run: `npm test -- --run`
Expected: 213+ tests passing

**Step 6: Build**

Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/background.ts tests/capture-area.test.ts
git commit -m "Fix Image constructor not available in service worker

- Replace Image() constructor with createImageBitmap() API
- Add dataUrlToBlob() helper function using fetch()
- Add test for service worker environment without Image
- Update test mocks for createImageBitmap and fetch

The Image constructor is not available in service workers.
createImageBitmap is the correct API for this environment.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Bump Version

**Files:**
- Modify: `package.json`
- Modify: `public/manifest.json`

**Step 1: Update version to 0.5.4**

```bash
sed -i '' 's/"version": "0.5.3"/"version": "0.5.4"/g' package.json public/manifest.json
```

**Step 2: Verify**

```bash
grep version package.json public/manifest.json
```

Expected: Both show "0.5.4"

**Step 3: Build**

```bash
npm run build
```

Expected: Build succeeds

**Step 4: Verify dist version**

```bash
grep version dist/manifest.json
```

Expected: Shows "0.5.4"

**Step 5: Commit**

```bash
git add package.json public/manifest.json
git commit -m "Bump version to 0.5.4

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Post-Completion Checklist

- [x] All tests passing (213/215, 2 pre-existing failures)
- [x] Build succeeds
- [x] dist/manifest.json has correct version (0.5.4)
- [x] Code committed with proper messages
- [x] TDD cycle followed (RED → GREEN → VERIFY)

---

## Lessons Learned

1. **Always rebuild after bumping version** - dist/manifest.json wasn't updated until rebuild
2. **Use planning files for future work** - Don't rely on TodoWrite alone
3. **Test for service worker environment** - Image constructor doesn't exist there

---

## Future Work

For new features/bugs, use this process:

1. **Plan:** Use @superpowers:writing-plans to create plan file in docs/plans/
2. **Execute:** Use @superpowers:executing-plans OR @superpowers:subagent-driven-development
3. **Review:** Verify each task before moving to next
4. **Build:** Always rebuild after version bump
