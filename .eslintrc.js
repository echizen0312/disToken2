module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'vue/no-use-v-if-with-v-for': 'off',
        'vue/valid-v-model': 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
