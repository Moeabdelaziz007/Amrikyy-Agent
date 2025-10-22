// WebStorm IDE Configuration for UI Development
module.exports = {
  // Enable Tailwind CSS IntelliSense
  tailwindcss: {
    config: './tailwind.config.js',
    classAttributes: ['class', 'className', 'tw'],
    functionNames: ['clsx', 'cn', 'cva']
  },
  
  // React/TypeScript settings
  react: {
    version: '18.2.0',
    runtime: 'automatic'
  },
  
  // File watchers for live reload
  watchers: {
    tailwind: {
      files: ['./src/**/*.{ts,tsx}', './tailwind.config.js'],
      options: '--watch'
    }
  },
  
  // Code style preferences
  codeStyle: {
    typescript: {
      semicolons: true,
      trailingComma: 'es5',
      singleQuote: true
    }
  }
};