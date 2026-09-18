import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service.js';
import {
  ConfirmEmailPayload,
  ConfirmRegisterPayload,
  LoginPayload,
  RegisterPayload,
} from './common/interface.js';
import { TokenIntrospectionDto } from './common/dto.js';

@Controller('account')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('roles')
  getRoles() {
    return this.appService.findRoles();
  }

  @Post('register')
  register(@Body() payload: RegisterPayload) {
    return this.appService.register(payload);
  }

  @Post('verify')
  async verify(@Body() payload: ConfirmRegisterPayload) {
    return await this.appService.confirmRegistration(payload);
  }

  @Post('login')
  login(
    @Body() payload: LoginPayload,
    @Query('callbackUri') callbackUri: string,
  ) {
    return this.appService.login(payload, callbackUri);
  }

  // @Post('introspection')
  // async validateToken(@Body() payload: TokenIntrospectionDto) {
  //   return this.appService.introspectToken(payload);
  // }
}
