import { readFile } from "fs";
import { config, parse } from "dotenv";
import { join } from "path";

export const readFileAsync = function (filename): Promise<Buffer> {
  return new Promise(function (resolve, reject) {
    readFile(filename, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

export async function loadEnvironmentVariables(reload?: boolean) {
  if (reload) {
    const envVarFile = join(__dirname, ".env");
    const file = await readFileAsync(envVarFile);
    console.log(`Force reloading .env vars from ${envVarFile}`);
    console.log(file.toString());
    const envConfig = parse(file);
    return envConfig;
  } else {
    const result = config();
    if (result.error) {
      throw result.error;
    }
    console.log("[EnvironmentVariables]: successfully loaded.");
    return result.parsed;
  }
}
