import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Project ini sengaja menyimpan beberapa helper route/context di file yang
      // sama dengan component. Rule ini hanya memengaruhi Fast Refresh saat dev.
      'react-refresh/only-export-components': 'off',
      // Banyak form/dialog perlu sync state saat data server atau prop edit berubah.
      // Untuk scope skripsi ini, warning rule React 19 terlalu noisy dibanding manfaatnya.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
