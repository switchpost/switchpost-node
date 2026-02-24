// Copyright 2026 SwitchPost Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
