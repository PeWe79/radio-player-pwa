module.exports = {
  presets: [
		["@babel/env", {
				"modules": false
		}],
    '@vue/app'
  ],
	sourceType: 'unambiguous',
	plugins : [
		"@babel/transform-async-to-generator"
	],
  env: {
    production: {
      plugins: ["transform-remove-console" ]
    },
		development:{
			plugins: ["dynamic-import-node"]
		}
  }
}
