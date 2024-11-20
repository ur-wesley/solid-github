import { exists, BaseDirectory, writeTextFile, readTextFile, mkdir } from '@tauri-apps/plugin-fs';

type Config = {
  token: string | null;
}

export async function createBaseDir() {
  if (!(await exists("config", { baseDir: BaseDirectory.AppLocalData, }))) {
    await mkdir("config", { baseDir: BaseDirectory.AppLocalData });
  }
}

export async function writeConfig(config: Config) {
  if (!config.token) return;
  await writeTextFile("token", config.token, { baseDir: BaseDirectory.AppLocalData });
}

export async function readConfig(): Promise<Config> {
  const tokenExists = await exists("token", { baseDir: BaseDirectory.AppLocalData });
  if (!tokenExists) return { token: null };
  const token = await readTextFile("token", { baseDir: BaseDirectory.AppLocalData });
  return { token };

}