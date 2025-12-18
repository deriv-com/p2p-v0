# Localization Guide

This P2P application now supports multiple languages: English, Spanish, and Italian.

## Architecture

The localization system is built using:
- **Zustand** for state management (language preference)
- **Custom translation hook** (`useTranslations`) for accessing translations
- **JSON translation files** for each supported language

## Supported Languages

- **English (en)** - Default
- **Spanish (es)** - Español
- **Italian (it)** - Italiano

## File Structure

```
lib/i18n/
├── config.ts                 # Language configuration
├── use-translations.ts       # Translation hook
└── translations/
    ├── en.json              # English translations
    ├── es.json              # Spanish translations
    └── it.json              # Italian translations

stores/
└── language-store.ts         # Language state management

components/
└── language-selector.tsx     # Language switcher UI
```

## Usage

### Using Translations in Components

```tsx
import { useTranslations } from "@/lib/i18n/use-translations"

export function MyComponent() {
  const { t } = useTranslations()
  
  return (
    <div>
      <h1>{t("common.buy")}</h1>
      <p>{t("market.loadingAds")}</p>
    </div>
  )
}
```

### Using Translations with Parameters

```tsx
const { t } = useTranslations()

// Translation with parameters
const message = t("order.orderLimitError", {
  min: "10.00",
  max: "1000.00",
  currency: "USD"
})
// Result: "Order limit: 10.00 - 1000.00 USD"
```

### Changing Language

Users can change the language using the `LanguageSelector` component in the header:

```tsx
import { LanguageSelector } from "@/components/language-selector"

<LanguageSelector />
```

The language preference is automatically persisted in localStorage.

## Adding New Translations

1. Add the translation key to all language files (`en.json`, `es.json`, `it.json`)
2. Use the translation in your component with the `t()` function
3. Test in all supported languages

Example:

```json
// en.json
{
  "myFeature": {
    "title": "My New Feature",
    "description": "This is a new feature"
  }
}

// es.json
{
  "myFeature": {
    "title": "Mi Nueva Función",
    "description": "Esta es una nueva función"
  }
}

// it.json
{
  "myFeature": {
    "title": "La Mia Nuova Funzione",
    "description": "Questa è una nuova funzione"
  }
}
```

## Adding a New Language

1. Update `lib/i18n/config.ts`:
```typescript
export const locales = ['en', 'es', 'it', 'fr'] as const // Add 'fr'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
  fr: 'Français', // Add French
}
```

2. Create a new translation file: `lib/i18n/translations/fr.json`

3. Import it in `lib/i18n/use-translations.ts`:
```typescript
import fr from "./translations/fr.json"

const translations = {
  en,
  es,
  it,
  fr, // Add French
}
```

4. Update `lib/local-variables.ts` to include the new language code

## Translation Keys Structure

Translations are organized by feature/domain:

- `common.*` - Common UI elements (buttons, actions)
- `navigation.*` - Navigation items
- `market.*` - Market/trading page
- `order.*` - Order creation and details
- `paymentMethod.*` - Payment method management
- `balance.*` - Balance and wallet
- `filter.*` - Filtering and sorting
- `chat.*` - Chat functionality
- `orderDetails.*` - Order details view
- `errors.*` - Error messages
- `validation.*` - Form validation messages

## Best Practices

1. **Always use translation keys** - Never hardcode user-facing text
2. **Keep keys organized** - Group related translations together
3. **Use descriptive keys** - Make keys self-documenting
4. **Provide fallbacks** - The system falls back to English if a key is missing
5. **Test all languages** - Verify translations in all supported languages
6. **Consider text length** - Some languages are longer than others (e.g., German)

## Current Implementation Status

### ✅ Fully Translated
- Navigation (header, sidebar, mobile footer)
- Language selector component

### 🚧 Partially Translated
- Market page (structure ready, needs component updates)
- Order sidebar (structure ready, needs component updates)

### ⏳ To Be Translated
- All other pages and components throughout the app

## Next Steps

To complete the localization:

1. Update each component to use the `useTranslations` hook
2. Replace hardcoded strings with `t()` calls
3. Add missing translation keys to all language files
4. Test thoroughly in all languages
5. Consider adding more languages based on user demand
