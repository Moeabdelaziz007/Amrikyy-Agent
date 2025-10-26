 fix-jest-esm-config
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-react"
  ],
  env: {
    test: {
      plugins: ["@babel/plugin-transform-modules-commonjs"]
    }
  }
};
=======
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-transform-runtime'
    ],
  };
};
 main
