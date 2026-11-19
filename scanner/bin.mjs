#!/usr/bin/env node
// rescue-scanner bin: Node 24+ runs the TypeScript sources directly
// (type stripping is on by default), so the CLI needs no build step.
import { main } from "./src/cli.ts";
process.exit(main(process.argv.slice(2)));
