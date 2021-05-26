import { build, BuildResult } from "esbuild";
import { externalGlobalPlugin } from "esbuild-plugin-external-global";

async function BuildIntegrationApp(): Promise<BuildResult> {
  const b = await build({
    entryPoints: ["./src/index.tsx"],
    outdir: "./public/bundle",
    external: ["react", "react-dom", "lib-esm/*"],
    minify: false,
    bundle: true,
    sourcemap: true,
    tsconfig: "./tsconfig.json",
    loader: { ".svg": "dataurl", ".png": "dataurl" },
    define: {
      NODE_ENV: "'production'",
    },
    plugins: [
      externalGlobalPlugin({
        react: "window.React",
        "react-dom": "window.ReactDOM",
      }),
      {
        name: "add-js",
        setup(build) {
          // Append .js extension for all dynamic imports (esm modules)
          build.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind === "dynamic-import") {
              return {
                namespace: "modules",
                path: "./" + args.path + ".js",
                external: true,
              };
            }
            return null;
          });
        },
      },
    ],
  });
  return b;
}

async function BuildEsmLibrary({ outdir, sourcemap }) {
  const defineLibrary = {};
  for (const k in process.env) {
    if (k.indexOf("LIBRARY_") !== -1) {
      const varName = k.split("LIBRARY_")[1];
      defineLibrary[varName] = JSON.stringify(process.env[k]);
    }
  }
  const b = await build({
    entryPoints: ["./lib/FileRenderer.tsx"],
    outdir,
    minify: true,
    bundle: true,
    sourcemap,
    format: "esm",
    tsconfig: "./tsconfig.definitions.json",
    external: ["react", "react-dom"],
    watch: true,
    define: defineLibrary,
    plugins: [
      externalGlobalPlugin({
        react: "window.React",
        "react-dom": "window.ReactDOM",
      }),
    ],
  });
  return b;
}

async function handleBuild(
  buildName: string,
  build: () => Promise<BuildResult>
) {
  try {
    const b = await build();
    if (b.errors.length === 0 && b.warnings.length === 0) {
      console.log(`[${buildName}]: successful build`);
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export const GenerateIntegrationApp = (buildName: string) =>
  handleBuild(buildName, () => BuildIntegrationApp());

export const GenerateEsmLibrary = (buildName: string, { outdir, sourcemap }) =>
  handleBuild(buildName, () => BuildEsmLibrary({ outdir, sourcemap }));
