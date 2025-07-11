# UI Layout Constants Reference

## File Location
`src/constants/design.ts`

## Overview
This file contains all major dimensional constants used for the application's UI layout. Modify these values to adjust component positioning and sizing.

```typescript
/**
 * TAB CONFIGURATION
 * Controls the appearance and spacing of browser tabs
 */
export const DEFAULT_TAB_MARGIN_TOP = 4;    // px - Top margin in default view
export const COMPACT_TAB_MARGIN_TOP = 3;    // px - Top margin in compact view
export const DEFAULT_TAB_HEIGHT = 32;       // px - Height in default view
export const COMPACT_TAB_HEIGHT = 32;       // px - Height in compact view

/**
 * TOOLBAR CONFIGURATION 
 * Dimensions for the main navigation toolbar
 */
export const TOOLBAR_HEIGHT = 42;           // px - Total toolbar height
export const TOOLBAR_BUTTON_WIDTH = 36;     // px - Standard button width  
export const TOOLBAR_BUTTON_HEIGHT = 32;    // px - Standard button height
export const ADD_TAB_BUTTON_WIDTH = 28;     // px - 'Add Tab' button width
export const ADD_TAB_BUTTON_HEIGHT = 28;    // px - 'Add Tab' button height

/**
 * TITLEBAR CALCULATIONS
 * Derived heights based on tab configurations
 */
export const DEFAULT_TITLEBAR_HEIGHT =      // px - Default mode total height
  DEFAULT_TAB_MARGIN_TOP + DEFAULT_TAB_HEIGHT;
export const COMPACT_TITLEBAR_HEIGHT =     // px - Compact mode total height
  2 * COMPACT_TAB_MARGIN_TOP + COMPACT_TAB_HEIGHT;

/**
 * VIEW POSITIONING
 * Main content area offsets
 */  
export const VIEW_Y_OFFSET =               // px - Content area vertical offset
  TOOLBAR_HEIGHT + DEFAULT_TITLEBAR_HEIGHT;

/**
 * WINDOW CONTROLS
 * Native window button dimensions
 */
export const WINDOWS_BUTTON_WIDTH = 45;    // px - Min/Max/Close button width

/**
 * MENU DIMENSIONS  
 */
export const MENU_WIDTH = 330;             // px - Dropdown menu width

/**
 * DIALOG SETTINGS
 * Popup dialog configurations
 */
export const DIALOG_MIN_HEIGHT = 130;      // px - Minimum dialog height
export const DIALOG_MARGIN = 16;           // px - Horizontal margin
export const DIALOG_TOP = 0;               // px - Vertical position
export const DIALOG_MARGIN_TOP = 0;        // px - Top margin
```