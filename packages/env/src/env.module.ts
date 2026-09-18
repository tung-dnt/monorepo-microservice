import { DynamicModule, Global, Module } from "@nestjs/common";
import {
  ConfigurableModuleClass,
  CustomConfigModuleOptions,
} from "./common/module/config.module-definition.js";
import { EnvService } from "./env.service.js";
@Global()
@Module({})
export class EnvModule extends ConfigurableModuleClass {
  static register(options: CustomConfigModuleOptions): DynamicModule {
    return {
      module: EnvModule,
      imports: [],
      providers: [
        EnvService,
        {
          provide: "CONFIG_OPTIONS",
          useValue: options,
        },
      ],
      exports: [EnvService],
    };
  }
}
