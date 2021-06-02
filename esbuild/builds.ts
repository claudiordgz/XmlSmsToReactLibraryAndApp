import {
  GenerateEsmLibrary,
  GenerateIntegrationApp,
} from "./libraryAndAppBuild";
import { execSync } from "child_process";

export interface Config {
  lib: AssetConfig;
  app: AssetConfig;
}
export interface AssetConfig {
  builds?: BuildsEntity[] | null;
}
export interface BuildsEntity {
  name: string;
  opts: Opts;
}
export interface Opts {
  outdir?: any;
  sourcemap?: any;
  define?: any;
}

const defaultConfiguration: Config = {
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
    builds: [
      {
        name: "IntegrationApp",
        opts: {
          outdir: "./public/bundle",
        },
      },
    ],
  },
};

export const buildDefinitions = () => {
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

export const generateLibraries = (envVars, config?: AssetConfig) => {
  const defineLibrary = {};
  for (const k in envVars) {
    if (k.indexOf("LIBRARY_") !== -1) {
      const varName = k.split("LIBRARY_")[1];
      defineLibrary[varName] = JSON.stringify(envVars[k]);
    }
  }
  const cfg = config ? config : defaultConfiguration.lib;
  return Promise.all(
    cfg.builds.map(({ name, opts }) =>
      GenerateEsmLibrary(name, { ...opts, define: defineLibrary })
    )
  );
};

export const generateDefinitions = () => buildDefinitions();

export const generateApp = (config?: AssetConfig) => {
  const cfg = config ? config : defaultConfiguration.app;
  return Promise.all(
    cfg.builds.map(({ name, opts }) =>
      GenerateIntegrationApp(name, { ...opts })
    )
  );
};
