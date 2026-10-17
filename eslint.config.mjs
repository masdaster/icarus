import js from '@eslint/js'
import pluginReact from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        fetch: 'readonly',
        WebSocket: 'readonly',
        CustomEvent: 'readonly',
        IntersectionObserver: 'readonly',
        navigator: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
        Buffer: 'readonly',
        global: 'readonly',
        // Common patterns
        FormData: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    plugins: {
      react: pluginReact
    },
    rules: {
      'react/jsx-indent': 'off',
      'react/jsx-closing-tag-location': 'off',
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'none',
        varsIgnorePattern: '^[A-Z]|^_|^e$|^i$'
      }],
      'no-unsafe-optional-chaining': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-empty': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      '.next/**',
      'out/**',
      'dist/**',
      'src/client/.next/**',
      '**/node_modules/**',
      '**/.next/**'
    ]
  }
]
