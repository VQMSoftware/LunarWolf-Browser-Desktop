# Browser Configuration Settings

## 📁 File Locations

- **Default Settings**: `src/constants/settings.ts`  
- **Interface Definitions**: `src/interfaces/settings.ts`

---

## ⚙️ Startup Behavior Configuration

**Location**: `DEFAULT_SETTINGS.startupBehavior`

```ts
startupBehavior: {
  type: 'empty' // Available options:
               // - 'empty': Opens new tab page
               // - 'continue': Restores previous session
               // - 'urls': Opens predefined URLs (requires additional config)
}
```

---

## 🔍 Search Engine Configuration

**Location**: `DEFAULT_SEARCH_ENGINES` array

### Default Engines

| Index | Name        | Keyword         | URL Format                                |
|-------|-------------|------------------|-------------------------------------------|
| 0     | DuckDuckGo  | duckduckgo.com   | `https://duckduckgo.com/?q=%s`            |
| 1     | Google      | google.com       | `https://google.com/search?q=%s`          |

### Modifying Default Engine

```ts
// Change this value to match desired engine index
searchEngine: 1 // Defaults to Google (index 1)
```

### Adding New Search Engines

Add a new entry to the `DEFAULT_SEARCH_ENGINES` array:

```ts
{
  name: 'MySearch',
  url: 'https://mysearch.com?query=%s',
  keyword: 'mysearch.com',
  icon: 'data:image/png;base64,...' // Base64 encoded icon
}
```

> **Note**: Update the interface in `src/interfaces/settings.ts` accordingly.

---

## 🔐 Core Settings Reference

### Privacy & Security

```ts
{
  shield: true,             // Enables adblocking and privacy protection
  httpsEnforce: false,      // Force HTTPS connections
  doNotTrack: true,         // Send Do Not Track header
  ignoreCertificate: false  // SSL verification
}
```

### UI Customization

```ts
{
  theme: 'lunarwolf-dark',  // Color theme
  bookmarksBar: false,      // Bookmarks toolbar visibility
  animations: true          // UI animations
}
```

---

## 🛠 Interface Implementation Guide

> **Purpose**: Define setting types before adding them to `constants`

### Add New Property to Interface

```ts
// In src/interfaces/settings.ts
interface ISettings {
  newSetting: boolean; // Type definition
}
```

### Add Default Value in Constants

```ts
// In src/constants/settings.ts
DEFAULT_SETTINGS: ISettings = {
  newSetting: false, // Default value
  // ...existing settings
}
```

---

## ✅ Best Practices

- ✅ Always update **interfaces first**
- 🔁 Maintain **backward compatibility**
- 📝 Document **new settings** in project docs
- 🧪 Test **changes thoroughly**

---