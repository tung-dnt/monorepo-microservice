import { IsString, IsNumberString, IsUrl, IsDefined, IsEnum } from "class-validator";
import { DatabaseEnv } from "./database.js";

export enum Environment {
  Development = "dev",
  Staging = "staging",
  Production = "dev"
}

export class GlobalEnv {
  @IsDefined()
  db: DatabaseEnv;

  @IsDefined()
  @IsEnum(Environment)
  env: Environment
}
