export const tossClientConfig = {
  clientKey: import.meta.env.VITE_TOSS_CLIENT_KEY || '',
  customerKey: import.meta.env.VITE_TOSS_CUSTOMER_KEY || '',
  merchantName: import.meta.env.VITE_TOSS_MERCHANT_NAME || '효드림',
  environment: import.meta.env.VITE_TOSS_ENVIRONMENT || 'test',
};

export const isTossClientConfigured = Boolean(tossClientConfig.clientKey);

export const TOSS_PENDING_ORDER_KEY = 'hyodream_toss_pending_order';
