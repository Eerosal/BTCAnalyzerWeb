module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        "airbnb-base",
    ],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
        quotes: [2, "double", { avoidEscape: true }],
        indent: ["error", 4],
        "max-len": ["error", { code: 120 }],
        "no-param-reassign": [2, { props: false }],
        "import/extensions": "off",
        "no-alert": "off",
    },
};
