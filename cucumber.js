module.exports = {
	default: {
		paths: ["../switchpost-spec/features/**/*.feature"],
		require: ["e2e/step-definitions/**/*.ts", "e2e/support/**/*.ts"],
		requireModule: ["ts-node/register"],
		format: ["progress-bar", "html:reports/cucumber-report.html"],
		formatOptions: { snippetInterface: "async-await" },
	},
};

// ts-node configuration is picked up via TS_NODE_PROJECT env var or
// the "ts-node" key in tsconfig.e2e.json. The test:e2e npm script should
// set TS_NODE_PROJECT=tsconfig.e2e.json before running cucumber-js.
