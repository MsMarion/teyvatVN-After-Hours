# Adding New Characters - Step-by-Step Guide

This guide walks you through adding a new character to TeyvatVN with detailed examples.

## Overview

Adding a character requires:
1. Character assets (card image + story sprites)
2. Database entry
3. Import statements
4. Testing

**Time Required:** ~15-20 minutes  
**Difficulty:** Beginner

---

## Step 1: Prepare Character Assets

### Required Images

#### Card Image
- **Purpose:** Displayed on character selection screen
- **Dimensions:** 512x512 pixels
- **Format:** PNG or JPG
- **File Size:** < 100KB (compress if needed)
- **Content:** Character portrait, clear face visibility

**Example Filename:** `zhongli-card.png`

#### Story Sprites
- **Purpose:** Displayed in visual novel scenes
- **Dimensions:** Variable height (recommend 1500-2000px), transparent background
- **Format:** PNG with alpha channel
- **File Size:** < 500KB each
- **Quantity:** At least 1, recommend 3-5 expressions

**Recommended Expressions:**
- `neutral.png` - Default/calm expression
- `happy.png` - Smiling/cheerful
- `sad.png` - Sad/concerned
- `angry.png` - Angry/frustrated (optional)
- `surprised.png` - Shocked/surprised (optional)

**Example Filenames:**
```
zhongli-neutral.png
zhongli-happy.png
zhongli-sad.png
```

### Asset Preparation Tips

1. **Use High Quality Sources**
   - Official artwork preferred
   - Fan art with permission
   - Ensure consistent art style

2. **Optimize File Sizes**
   ```bash
   # Using ImageMagick
   convert input.png -resize 512x512 -quality 85 output.png
   
   # Using online tools
   # TinyPNG.com
   # Squoosh.app
   ```

3. **Remove Backgrounds**
   - Use tools like Photoshop, GIMP, or remove.bg
   - Ensure clean alpha channel
   - No white/colored halos around edges

---

## Step 2: Add Assets to Project

### Directory Structure

```
src/assets/characters/
├── cards/
│   └── zhongli-card.png          ← Place card here
└── story-sprites/
    └── zhongli/                   ← Create character folder
        ├── neutral.png
        ├── happy.png
        └── sad.png
```

### File Placement

1. **Navigate to project**
   ```bash
   cd teyvatVN/src/assets/characters
   ```

2. **Add card image**
   ```bash
   # Copy your card image
   cp /path/to/zhongli-card.png cards/
   ```

3. **Create sprite directory**
   ```bash
   mkdir -p story-sprites/zhongli
   ```

4. **Add sprite images**
   ```bash
   cp /path/to/zhongli-neutral.png story-sprites/zhongli/
   cp /path/to/zhongli-happy.png story-sprites/zhongli/
   cp /path/to/zhongli-sad.png story-sprites/zhongli/
   ```

---

## Step 3: Update Character Database

### Location
`src/data/characterData.js`

### Add Imports

At the **top** of the file, add import statements:

```javascript
// Existing imports...
import dilucCard from "../assets/characters/cards/diluc-card.png";
// ... more imports

// ADD THESE LINES:
// Zhongli card
import zhongliCard from "../assets/characters/cards/zhongli-card.png";

// Zhongli sprites
import zhongliNeutral from "../assets/characters/story-sprites/zhongli/neutral.png";
import zhongliHappy from "../assets/characters/story-sprites/zhongli/happy.png";
import zhongliSad from "../assets/characters/story-sprites/zhongli/sad.png";
```

### Add Database Entry

In the `characterDatabase` object, add your character:

```javascript
export const characterDatabase = {
  // Existing characters...
  "Diluc": { /* ... */ },
  "Kaeya": { /* ... */ },
  
  // ADD THIS ENTRY:
  "Zhongli": {
    name: "Zhongli",
    vision: "Geo",
    weapon: "Polearm",
    rarity: 5,
    cardImage: zhongliCard,
    storySprites: {
      neutral: zhongliNeutral,
      happy: zhongliHappy,
      sad: zhongliSad,
    },
    description: "A mysterious consultant at the Wangsheng Funeral Parlor with extensive knowledge of Liyue's history."
  }
};
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Character's display name (must match key) | "Zhongli" |
| `vision` | string | Element type | "Geo", "Pyro", "Hydro", etc. |
| `weapon` | string | Weapon type | "Sword", "Claymore", "Polearm", etc. |
| `rarity` | number | Star rating (4 or 5) | 5 |
| `cardImage` | import | Card image reference | zhongliCard |
| `storySprites` | object | Sprite expressions | { neutral: ..., happy: ... } |
| `description` | string | Brief character bio | "A mysterious consultant..." |

---

## Step 4: Test the Character

### 1. Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Restart
npm run dev
```

### 2. Navigate to Characters Page

Open browser to: `http://localhost:5173/characters`

### 3. Verify Card Display

**Check:**
- ✅ Character card appears in grid
- ✅ Card image loads correctly
- ✅ Character name displays
- ✅ Vision/weapon icons show (if implemented)
- ✅ Card is clickable

**If card doesn't appear:**
- Check console for import errors
- Verify file paths are correct
- Ensure image files exist in correct locations

### 4. Test Character Selection

1. Click on the new character card
2. Card should highlight/show selected state
3. Select a second character
4. Click "Continue" button

### 5. Verify Story Sprite

1. Navigate to Story page
2. Select a background
3. Generate a story mentioning the character
4. **Check:**
   - ✅ Character sprite appears in VN UI
   - ✅ Sprite is properly sized
   - ✅ Transparent background works
   - ✅ No visual glitches

**If sprite doesn't appear:**
- Check browser console for 404 errors
- Verify sprite import paths
- Check `storySprites` object structure
- Ensure PNG has transparency

---

## Step 5: Advanced Configuration

### Multiple Expressions

To use different expressions based on dialogue:

```javascript
// In characterData.js
storySprites: {
  neutral: zhongliNeutral,
  happy: zhongliHappy,
  sad: zhongliSad,
  angry: zhongliAngry,
  surprised: zhongliSurprised,
  thinking: zhongliThinking,
}
```

**Note:** Current implementation uses first sprite. Expression switching requires additional code in `StoryPage.jsx`.

### Custom Sprite Positioning

If sprite needs special positioning, add CSS:

```css
/* In StoryPage.css */
.character-sprite[alt="Zhongli"] {
  bottom: -50px;  /* Adjust vertical position */
  height: 110%;   /* Adjust size */
}
```

### Character-Specific Styling

```css
/* Different positioning for different characters */
.character-sprite[alt="Zhongli"].pos-1 {
  left: 10%;  /* Custom left position */
}

.character-sprite[alt="Zhongli"].pos-2 {
  right: 10%; /* Custom right position */
}
```

---

## Complete Example

Here's a full example adding "Hu Tao":

### 1. Assets
```
src/assets/characters/
├── cards/
│   └── hu-tao-card.png
└── story-sprites/
    └── hu-tao/
        ├── neutral.png
        ├── happy.png
        └── mischievous.png
```

### 2. Imports
```javascript
// Card
import huTaoCard from "../assets/characters/cards/hu-tao-card.png";

// Sprites
import huTaoNeutral from "../assets/characters/story-sprites/hu-tao/neutral.png";
import huTaoHappy from "../assets/characters/story-sprites/hu-tao/happy.png";
import huTaoMischievous from "../assets/characters/story-sprites/hu-tao/mischievous.png";
```

### 3. Database Entry
```javascript
"Hu Tao": {
  name: "Hu Tao",
  vision: "Pyro",
  weapon: "Polearm",
  rarity: 5,
  cardImage: huTaoCard,
  storySprites: {
    neutral: huTaoNeutral,
    happy: huTaoHappy,
    mischievous: huTaoMischievous,
  },
  description: "The 77th Director of the Wangsheng Funeral Parlor, a young lady managing funeral affairs with a quirky personality."
}
```

### 4. Test
```bash
npm run dev
# Navigate to http://localhost:5173/characters
# Select Hu Tao + another character
# Generate story and verify sprite appears
```

---

## Troubleshooting

### Card Image Not Showing

**Problem:** Card appears blank or broken image icon

**Solutions:**
1. Check file path is correct
2. Verify image file exists
3. Check import statement spelling
4. Ensure image format is supported (PNG/JPG)
5. Try clearing browser cache (Ctrl+Shift+R)

### Sprite Too Large/Small

**Problem:** Character sprite doesn't fit properly in VN UI

**Solutions:**
1. Adjust sprite image dimensions (resize source file)
2. Add custom CSS:
   ```css
   .character-sprite[alt="CharacterName"] {
     height: 95%;  /* Adjust percentage */
     max-width: 400px;  /* Adjust max width */
   }
   ```

### Sprite Has White Background

**Problem:** Sprite shows white box instead of transparency

**Solutions:**
1. Re-export PNG with alpha channel
2. Use image editor to remove background:
   - Photoshop: Select → Color Range → Delete
   - GIMP: Layer → Transparency → Add Alpha Channel
   - Online: remove.bg

### Character Not Appearing in Grid

**Problem:** New character doesn't show on Characters page

**Solutions:**
1. Check console for JavaScript errors
2. Verify database key matches name exactly:
   ```javascript
   "Zhongli": {  // Key
     name: "Zhongli",  // Must match key
   }
   ```
3. Ensure all imports are correct
4. Restart dev server

---

## Best Practices

### Asset Quality
- ✅ Use consistent art style across characters
- ✅ Maintain similar sprite heights
- ✅ Compress images without visible quality loss
- ✅ Use descriptive filenames

### Naming Conventions
- ✅ Use character's official name
- ✅ Keep sprite names consistent (neutral, happy, sad)
- ✅ Use kebab-case for filenames (`hu-tao-card.png`)
- ✅ Use PascalCase for character keys (`"Hu Tao"`)

### Organization
- ✅ One folder per character for sprites
- ✅ Group related characters (by region, element, etc.)
- ✅ Document custom positioning in comments
- ✅ Keep backup of original high-res assets

---

## Next Steps

After adding characters, you might want to:

1. **Add More Expressions**
   - Implement expression switching based on dialogue
   - Create emotion detection system

2. **Character Relationships**
   - Add relationship data to database
   - Influence AI story generation

3. **Voice Acting**
   - Add voice line files
   - Integrate audio playback

4. **Character Stats**
   - Add gameplay stats
   - Create character info modal

---

**Need Help?**
- Check the main [README.md](./README.md) for general documentation
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review existing character entries for examples
