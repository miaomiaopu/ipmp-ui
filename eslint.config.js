import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default [
  { ignores: ['dist/', 'node_modules/', '*.d.ts'] },
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: tsParser } },
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
  },
]
