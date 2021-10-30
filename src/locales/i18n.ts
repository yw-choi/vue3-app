import { createI18n } from "vue-i18n";

function loadLocaleMessages() {
  const locales = require.context("./", true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

// 2. Create i18n instance with options
const i18n = createI18n({
  locale: "en", // set locale
  fallbackLocale: "en", // set fallback locale
  globalInjection: true,
  messages: loadLocaleMessages()
  // If you need to specify other options, you can set other options
  // ...
});

export default i18n;
