import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ConfirmEmailPayload,
  ConfirmRegisterPayload,
  LoginPayload,
  RegisterPayload,
} from './common/interface.js';
import {
  RoleModel,
  RoleSchema,
  AccountModel,
  AccountSchema,
} from './common/schema/user/index.js';
import { InjectModel } from '@nestjs/sequelize';
import { MailSenderClient } from './common/axios.client.js';
import { EnvService } from '@nhl/env';
import { Env } from './common/env.js';
import { AuthCodeService } from './auth/auth-code.service.js';
import { TemplateEnum } from './common/constant.js';
import { ClientService } from './auth/client.service.js';
import { OAuthService } from './auth/oauth.service.js';
import { hashPassword, verifyPassword } from './common/utils.js';

@Injectable()
export class AppService {
  mailSenderClient: MailSenderClient;
  constructor(
    private readonly config: EnvService<Env>,
    @InjectModel(RoleSchema) private readonly roleRepo: RoleModel,
    @InjectModel(AccountSchema) private readonly userRepo: AccountModel,
    private readonly authCodeService: AuthCodeService,
    private readonly clientService: ClientService,
    private readonly oauthService: OAuthService,
  ) {
    this.mailSenderClient = new MailSenderClient({
      baseURL: this.config.get('mailjs.url'),
    });
  }

  async login(payload: LoginPayload, callbackUri: string) {
    const { email, password, clientId } = payload;
    const redirectTo = decodeURIComponent(callbackUri);

    console.log('redirect', redirectTo);

    // 🔍 Find user in DB
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 🔒 Compare password using argon2
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 🆔 Get client config (Replace with your real client fetching logic)
    const configs = await this.clientService.findAll();
    const [clientConfig] = configs.filter((c) => c.clientId === clientId);
    if (!clientConfig) throw new ForbiddenException();

    // 🔑 Generate tokens
    const tokens = this.oauthService.generateToken(
      { accountId: user.id.toString(), role: user.role.toString() },
      clientConfig,
    );

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(payload: RegisterPayload) {
    const { email, fullName, password, role } = payload;

    // Check if user already exists
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already in use');

    // Encrypt password
    const hashedPassword = await hashPassword(password);

    // Generate 3-digit confirmation code
    const confirmationCode = this.authCodeService.generateAuthCode();

    // Create new user with status 0 (inactive)
    const newUser = await this.userRepo.create({
      fullName,
      email,
      role,
      password: hashedPassword,
      status: 0, // Inactive until email confirmation
    });

    // Store confirmation code in DB
    await this.authCodeService.create({
      code: confirmationCode,
      accountId: newUser.id,
      codeType: TemplateEnum.register,
      expiresAt: Date.now() + 10 * 60 * 1000, // Expires in 10 minutes
    });

    // Send email (replace with actual email service)
    await this.sendEmail(
      {
        recepientEmail: newUser.email,
        fullName: newUser.fullName,
        code: confirmationCode,
      },
      TemplateEnum.register,
    );

    return newUser;
  }

  async confirmRegistration({
    code,
    email,
  }: ConfirmRegisterPayload): Promise<string> {
    // Find user by email
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // Check if the user is already activated
    if (user.status === 1) return 'User already verified';

    // Query the latest valid verification code
    const authCode = await this.authCodeService.findOne({
      accountId: user.id,
      codeType: TemplateEnum.register,
    });

    if (!authCode || authCode.code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Update user status to active (1)
    await user.update({ status: 1 });

    return 'Account verified successfully!';
  }

  async sendEmail(payload: ConfirmEmailPayload, type: TemplateEnum) {
    const templateId =
      type === TemplateEnum.login
        ? this.config.get('mailjs.template.login')
        : this.config.get('mailjs.template.register');

    return await this.mailSenderClient.sendConfirmation(
      this.config.get('mailjs.serviceId'),
      this.config.get('mailjs.userId'),
      templateId,
      payload,
    );
  }

  findRoles() {
    return this.roleRepo.findAndCountAll();
  }
}
