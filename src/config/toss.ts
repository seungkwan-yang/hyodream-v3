export const cleanEnvValue = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
};

export const DEFAULT_TOSS_MERCHANT_NAME = '효드림';
export const TOSS_PENDING_ORDER_KEY = 'hyodream_toss_pending_order';

export type TossRuntimeConfig = {
  clientKey: string;
  merchantName: string;
  environment: string;
  enabled: boolean;
  serverConfigured: boolean;
  webhookConfigured: boolean;
};

export const getTossRuntimeConfig = async (): Promise<TossRuntimeConfig> => {
  const response = await fetch(`/api/payments/toss/config?t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('application/json')) {
    throw new Error('Toss Payments 설정을 불러오지 못했습니다.');
  }
  const config = await response.json();
  return {
    ...config,
    clientKey: cleanEnvValue(config.clientKey),
    merchantName: cleanEnvValue(config.merchantName) || DEFAULT_TOSS_MERCHANT_NAME,
    environment: cleanEnvValue(config.environment) || 'test',
  };
};
