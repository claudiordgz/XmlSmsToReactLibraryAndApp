import { loadEnvironmentVariables } from "./esbuild/envVars";
import {
  generateApp,
  generateDefinitions,
  generateLibraries,
} from "./esbuild/builds";
import { copyFileSync } from "fs";

async function main() {
  try {
    const envVars = await loadEnvironmentVariables();
    await generateLibraries(envVars, {
      builds: [
        {
          name: "LocalEsmModules",
          opts: {
            outdir: "./docs/bundle/lib-esm",
            sourcemap: false,
          },
        },
      ],
    });
    await generateApp({
      builds: [
        {
          name: "IntegrationApp",
          opts: {
            outdir: "./docs/bundle",
            sourcemap: false,
          },
        },
      ],
    });
    copyFileSync("./public/404.html", "./docs/404.html");
    copyFileSync("./public/index.html", "./docs/index.html");
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}

main();
