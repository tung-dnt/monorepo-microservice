import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientSchema } from '../common/schema/account/index.js';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OAuthService {
  generateToken(
    payload: { accountId: string; role?: string },
    clientConfig: ClientSchema,
  ) {
    const accessToken = jwt.sign(
      { accountId: payload.accountId, role: payload.role }, // Only include necessary data
      clientConfig.clientSecret,
      {
        issuer: clientConfig.redirectUris,
        audience: clientConfig.clientId,
        subject: payload.accountId,
        expiresIn: `${clientConfig.accessTimeout}s`,
      },
    );

    const refreshToken = jwt.sign(
      { accountId: payload.accountId },
      clientConfig.clientSecret,
      {
        issuer: clientConfig.redirectUris,
        audience: clientConfig.clientId,
        subject: payload.accountId,
        expiresIn: `${clientConfig.refreshTimeout}s`,
      },
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string, clientConfig: ClientSchema) {
    try {
      return jwt.verify(token, clientConfig.clientSecret, {
        audience: clientConfig.clientId,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
