import * as chokidar from "chokidar";
import {
  GenerateEsmLibrary,
  GenerateIntegrationApp,
} from "./esbuild/utilities";
import { execSync } from "child_process";
import { config } from "dotenv";

const configuration = {
  lib: {
    builds: [
      {
        name: "LocalEsmModules",
        opts: {
          outdir: "./node_modules/lib-esm",
          sourcemap: false,
        },
      },
      {
        name: "DistEsmModules",
        opts: {
          outdir: "./public/bundle/lib-esm",
          sourcemap: false,
        },
      },
    ],
  },
  app: {
    builds: [{ name: "IntegrationApp" }],
  },
};

const buildDefinitions = () => {
  let res;
  try {
    res = execSync("pnpm run build:definitions", { encoding: "utf8" });
  } catch (e) {
    console.log(e.message);
    if (e.output && e.output.length !== 0) {
      console.log(e.output.join("\n"));
    }
  }
  if (res) {
    console.log(`[EsmDefinitions]: successful build`);
  }
  return Promise.resolve(true);
};

const buildLibraries = () =>
  Promise.all([
    ...configuration.lib.builds.map(({ name, opts }) =>
      GenerateEsmLibrary(name, opts)
    ),
    buildDefinitions(),
  ]);

const listenAndBuildApp = () =>
  chokidar
    .watch("./src", {
      ignored: /public|node_modules|.git|esbuild|.vscode/,
      ignoreInitial: true,
    })
    .on("ready", () =>
      configuration.app.builds.forEach(({ name }) =>
        GenerateIntegrationApp(name)
      )
    )
    .on("all", () =>
      configuration.app.builds.forEach(({ name }) =>
        GenerateIntegrationApp(name)
      )
    );

function main() {
  const result = config();
  if (result.error) {
    throw result.error;
  }
  console.log("[EnvironmentVariables]: successfully loaded.");

  chokidar
    .watch("./lib", {
      ignored: /public|node_modules|.git|esbuild|.vscode/,
      ignoreInitial: true,
    })
    .on("ready", async () => {
      await buildLibraries();
      listenAndBuildApp();
    })
    .on("all", () => buildLibraries());
}

main();
