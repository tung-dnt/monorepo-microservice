import { Injectable, Inject } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { Path, PathValue } from "@nestjs/config";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CustomConfigModuleOptions } from "./common/module/config.module-definition.js";
@Injectable()
export class EnvService<T extends object> {
  private readonly env: T;

  constructor(
    @Inject("CONFIG_OPTIONS") private options: CustomConfigModuleOptions
  ) {
    const rawJson = this.load(this.options.path);

    // validate config
    this.env = this.validate(
      this.options.class as unknown as ClassConstructor<T>,
      rawJson
    );

    console.log("Load file success", this.env);
  }

  // Returns the value AT the given path, e.g. get('db.sqlUrl') is a string.
  // Without the explicit PathValue return type this inferred `any` under TS 4.x and
  // `T` under TS 6, so every call site was either unchecked or wrongly typed as T.
  get<K extends Path<T>>(key: K): PathValue<T, K> {
    return key
      .split(".")
      .reduce<any>((value, segment) => value?.[segment], this.env);
  }

  private load(path: string): T {
    // Managed platforms (Vercel et al.) have no config/ directory to read: the whole
    // config blob arrives as a single env var instead. Preferred whenever it is set,
    // so it works in production too, not just under NODE_ENV=staging.
    if (process.env.CONFIG_JSON || process.env.NODE_ENV === "staging") {
      return this.loadFromEnv();
    }

    // get root apps path
    const configPath = [process.cwd(), path].join("/");

    if (!fs.existsSync(configPath)) throw new Error("Not exist config");

    // read json file (local and global)
    const jsonFile = fs.readFileSync(configPath, "utf-8");

    return JSON.parse(jsonFile || "{}");
  }

  private loadFromEnv(): T {
    const configJson = process.env.CONFIG_JSON;

    if (!configJson) throw new Error("CONFIG_JSON is required in the environment");

    try {
      return JSON.parse(configJson) as T;
    } catch {
      throw new Error("CONFIG_JSON must contain valid JSON");
    }
  }

  private validate(cls: ClassConstructor<T>, config: T) {
    const validatedConfig = plainToInstance(cls, config, {
      enableImplicitConversion: true,
    });

    if (typeof validatedConfig !== "object") {
      throw new Error("Validated config must be an Object");
    }

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
    return validatedConfig;
  }
}
