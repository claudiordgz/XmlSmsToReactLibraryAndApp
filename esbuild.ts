import * as chokidar from "chokidar";
import { loadEnvironmentVariables } from "./esbuild/envVars";
import {
  generateApp,
  generateDefinitions,
  generateLibraries,
} from "./esbuild/builds";

const watchAndBuildLibraries = (envVars) =>
  chokidar
    .watch(["./lib", "./sms"], {
      ignored: /public|node_modules|.git|esbuild|.vscode/,
      ignoreInitial: true,
    })
    .on("ready", async () => {
      await generateDefinitions();
      await generateLibraries(envVars);
      watchAndBuildApp();
    })
    .on("all", () => generateLibraries(envVars));

const watchAndBuildApp = () =>
  chokidar
    .watch("./src", {
      ignored: /public|node_modules|.git|esbuild|.vscode/,
      ignoreInitial: true,
    })
    .on("ready", () => generateApp())
    .on("all", () => generateApp());

function main() {
  chokidar
    .watch(".env", {
      ignored: /public|node_modules|.git|esbuild|.vscode/,
      ignoreInitial: true,
    })
    .on("ready", async () => {
      const envVars = await loadEnvironmentVariables();
      watchAndBuildLibraries(envVars);
    })
    .on("all", async () => {
      const envVars = await loadEnvironmentVariables(true);
      console.log(envVars);
      await generateLibraries(envVars);
      generateApp();
    });
}

main();
