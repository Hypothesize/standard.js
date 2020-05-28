#!/usr/bin/env -S node -r "ts-node/register"

import * as shell from 'shelljs'

shell.rm('-rf', "./dist")
shell.exec('npx tsc')

console.log(`\x1b[32mSuccess\x1b[0m\n`)

