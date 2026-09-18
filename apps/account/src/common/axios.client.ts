import axios, {
  AxiosInstance,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios';
import { ConfirmEmailPayload } from './interface.js';

interface IDefaultOptions {
  baseURL: string;
}

export class MailSenderClient {
  private client: AxiosInstance;
  constructor(defaultOptions: IDefaultOptions, options?: CreateAxiosDefaults) {
    this.client = axios.create({
      ...options,
      timeout: 5000,
      baseURL: defaultOptions.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendConfirmation(
    serviceId: string,
    userId: string,
    templateId: string,
    params: ConfirmEmailPayload,
  ) {
    const payload = JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      template_params: {
        code: params.code,
        fullName: params.fullName,
        recepientEmail: params.recepientEmail,
      },
    });
    this.client
      .post('api/v1.0/email/send', payload)
      .then(() => {
        console.log('Successfully send email confirmation');
      })
      .catch((err) => {
        console.log('Error in sending email', err);
      });
  }
}
