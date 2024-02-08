// const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
	"root": true,
	"env": { "browser": true, "node": true },
	"parser": "@typescript-eslint/parser",
	"plugins": ["@typescript-eslint", "mocha"],
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:mocha/recommended"
	],

	"rules": {
		/* typescript */
		"@typescript-eslint/member-delimiter-style": ["off", {
			"multiline": {
				"delimiter": "semi",
				"requireLast": false
			},
			"singleline": {
				"delimiter": "semi",
				"requireLast": false
			}
		}],
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-empty-function": "warn",

		/* general */
		"no-var": "warn",
		"no-console": "off",
		// "no-unused-vars": "error",
		"no-unused-expressions": "error",
		"no-unused-labels": "error",
		"no-await-in-loop": "error",
		"no-irregular-whitespace": "error",
		"no-unexpected-multiline": "error",
		"no-template-curly-in-string": "error",
		"no-unsafe-negation": "error",
		"require-atomic-updates": "error",
		"no-import-assign": "error",
		"no-unreachable": "error",
		"init-declarations": ["error", "always"],
		"no-shadow": "error",
		"no-undef-init": "off",

		/* code style */
		"semi": ["error", "never"],
		"brace-style": ["warn", "stroustrup"],
		"camelcase": ["error", { "properties": "always", "ignoreImports": true }],
		"block-spacing": ["error", "always"],
		"indent": ["warn", "tab"]
	}
}