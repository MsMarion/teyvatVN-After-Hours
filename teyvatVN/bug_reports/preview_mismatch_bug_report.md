# Bug Report: Preview Mismatch between /editing and /story

**Issue**
- The visual novel text box preview displayed on the **Editor Page** (`/editing`) does not match the preview shown on the **Story Page** (`/story`).
- Layout, navigation buttons, and styling differ, leading to an inconsistent user experience.

**Observed Differences**
1. **Navigation Controls**
   - `/story` shows "Prev" / "Next" buttons with a progress counter (e.g., `1 / 10`).
   - `/editing` preview currently hides navigation or displays a different layout.
2. **Styling**
   - The embedded preview on `/editing` uses the `.embedded` CSS class, which alters padding, background, and font sizes.
   - `/story` uses the default styling, resulting in mismatched fonts, colors, and spacing.
3. **Component State**
   - The `VNTextBox` component is used in two modes (controlled vs uncontrolled). The controlled mode on `/editing` does not correctly propagate the navigation callbacks, causing the UI to be out‑of‑sync with the segment list.

**Root Cause**
- The `VNTextBox` component was refactored to support both controlled and uncontrolled modes, but the integration on the Editor page does not fully replicate the navigation UI from the Story page.
- The `embedded` prop changes the layout, but navigation elements are conditionally hidden, leading to missing buttons.

**Proposed Fix**
- **Solidify `VNTextBox`**:
  - Ensure the component always renders navigation controls when `segment` prop is provided, regardless of the `embedded` flag.
  - Pass `onNext`, `onPrev`, `currentIndex`, and `totalSegments` from the Editor page to keep navigation in sync with the segment list.
- **Styling Consistency**:
  - Refactor `.embedded` CSS to only adjust layout (e.g., padding) without removing navigation elements.
  - Verify font families, colors, and spacing match the Story page defaults.
- **Editor Integration**:
  - Update `EditorPage.jsx` to pass the required navigation callbacks and indices to `VNTextBox`.
  - Ensure the preview updates when navigating via the buttons, and the selected segment in the list stays in sync.

**Priority**: High – This discrepancy affects the core user experience and must be resolved before the application is shipped to production.

**Next Steps**
1. Update `VNTextBox.jsx` to always render navigation UI in controlled mode.
2. Adjust `VNTextBox.css` to keep navigation visible for the embedded preview.
3. Modify `EditorPage.jsx` to correctly pass navigation props.
4. Add visual regression tests to guarantee both pages render identical previews.

---
*Created by Antigravity AI assistant on 2025-11-29.*
