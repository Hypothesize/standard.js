#!/usr/bin/env -S node -r "ts-node/register"

import * as shell from 'shelljs'

let output = shell.exec("TESTING='on' npm run build && npx mocha ./lib/*.js")
//console.log(`\x1b[32mSuccess\x1b[0m\n`)
