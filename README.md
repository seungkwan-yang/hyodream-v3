# HyoDream v3

효드림 온라인 제사상 주문/관리 사이트입니다. 프론트엔드는 React + Vite, API는 Express 로컬 서버와 Cloudflare Pages Functions/Worker 런타임을 함께 지원합니다.

## 주요 구성

- Frontend: React, TypeScript, Vite
- Local API: `server.js`
- Cloudflare API: `functions/api/[[path]].js` -> `src/worker.js`
- Database: Neon PostgreSQL
- Payments: Toss Payments
- Image uploads: Cloudflare R2 권장, R2 미설정 시 임시로 DB inline data URL 저장

## 로컬 실행

의존성 설치:

```bash
npm install
```

프론트와 로컬 Express API를 함께 실행:

```bash
npm run dev:all
```

프론트만 실행:

```bash
npm run dev
```

로컬 API만 실행:

```bash
npm run start
```

## 빌드

타입 체크와 Vite 빌드:

```bash
npm run build
```

빌드 결과물은 `dist/`에 생성됩니다.

## Cloudflare 배포

Cloudflare Pages 배포:

```bash
npm run cf:pages:deploy
```

Cloudflare Worker 방식 배포:

```bash
npm run cf:deploy
```

Cloudflare 로컬 Worker 실행:

```bash
npm run cf:dev
```

현재 Pages 배포는 `dist/`를 업로드하고, `functions/api/[[path]].js`가 `/api/*` 요청을 `src/worker.js`로 전달합니다.

## 환경변수

로컬 개발은 `.env`에 값을 넣습니다. 실제 운영 비밀 값은 Git에 커밋하지 마세요.

필수/권장 값:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# 빈 DB에 기본 샘플 메뉴 데이터를 자동 생성할 때만 true
ENABLE_DEFAULT_SEED="false"

# Toss Payments
# Cloudflare Pages Functions/Worker는 런타임에서 TOSS_* 값을 읽습니다.
# Secret 값에 VITE_ prefix를 붙이지 마세요.
TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."
TOSS_SECURITY_TOKEN=""
TOSS_WEBHOOK_SECRET=""
TOSS_MERCHANT_NAME="효드림"
TOSS_ENVIRONMENT="test"
```

중요:

- `TOSS_CLIENT_KEY`와 `TOSS_SECRET_KEY`는 같은 Toss 상점의 키 쌍이어야 합니다.
- Cloudflare Dashboard에 값을 넣을 때 따옴표 없이 입력하세요.
- `.env`는 로컬에서만 자동 로드됩니다. Cloudflare Pages 운영 환경에는 Dashboard에서 별도로 환경변수를 등록해야 합니다.
- `VITE_TOSS_SECRET_KEY` 같은 값은 만들지 마세요. `VITE_` 값은 브라우저 번들에 노출될 수 있습니다.

## Cloudflare Pages 환경변수 설정

Cloudflare Dashboard에서:

```text
Workers & Pages
-> hyodream-v3
-> Settings
-> Environment variables
```

Production에 최소 아래 값을 등록합니다.

```text
DATABASE_URL
ENABLE_DEFAULT_SEED
TOSS_CLIENT_KEY
TOSS_SECRET_KEY
TOSS_SECURITY_TOKEN
TOSS_WEBHOOK_SECRET
TOSS_MERCHANT_NAME
TOSS_ENVIRONMENT
```

Preview 배포에서도 같은 기능을 테스트하려면 Preview 환경에도 동일하게 등록합니다.

환경변수를 수정한 뒤에는 반드시 다시 배포해야 적용됩니다.

```bash
npm run cf:pages:deploy
```

## R2 이미지 업로드 설정

후기/관리자 이미지 업로드는 Cloudflare R2 사용을 권장합니다.

R2를 켜지 않으면 현재 코드는 임시 fallback으로 이미지를 `data:image/...;base64,...` 문자열로 만들어 DB의 `image_url` 컬럼에 저장합니다. 이 방식은 바로 동작하지만, 이미지가 많아지면 DB 용량과 조회 응답이 커질 수 있습니다.

### 1. R2 활성화

Cloudflare Dashboard에서:

```text
R2 Object Storage
-> Get started / Enable R2
```

### 2. 버킷 생성

Dashboard에서 직접 만들거나 CLI로 생성합니다.

```bash
npx wrangler r2 bucket create hyodream-uploads
```

### 3. Pages Functions에 R2 바인딩 추가

Cloudflare Dashboard에서:

```text
Workers & Pages
-> hyodream-v3
-> Settings
-> Functions
-> R2 bucket bindings
-> Add binding
```

아래 값으로 추가합니다.

```text
Variable name: UPLOADS_BUCKET
R2 bucket: hyodream-uploads
```

Production에서 사용하려면 Production에 바인딩해야 합니다. Preview 배포에서 테스트하려면 Preview에도 추가하세요.

### 4. 재배포

```bash
npm run cf:pages:deploy
```

R2 바인딩 후 새로 업로드되는 이미지는 R2에 저장되고, DB에는 `/uploads/...` 경로만 저장됩니다. 기존에 DB inline data URL로 저장된 이미지는 자동으로 R2로 이전되지 않습니다.

## Toss Payments

결제 흐름:

1. 프론트에서 `/api/payments/toss/config`를 호출해 client key를 가져옵니다.
2. Toss Payments SDK로 결제창을 엽니다.
3. 결제 성공 redirect 후 `/api/payments/toss/confirm`에서 secret key로 결제를 승인합니다.
4. 승인된 주문은 Toss `orderId`를 우리 DB 주문번호로 저장합니다.
5. 관리자 주문 상세에서 `주문취소`로 저장하면 `/v1/payments/{paymentKey}/cancel`을 호출해 실제 Toss 결제도 취소합니다.

진단 URL:

```text
/api/payments/toss/config
/api/payments/toss/debug
```

`debug` 응답은 실제 secret을 노출하지 않고 prefix/suffix와 설정 여부만 보여줍니다.

Toss 테스트 결제 로그:

```text
https://developers.tosspayments.com/1704695/accounts/2369331/phases/test/payment-logs
```

관리자 결제/주문 내역 화면에도 위 페이지를 여는 버튼이 있습니다.

## DB 관련 참고

Cloudflare Worker는 `DATABASE_URL` 또는 `HYPERDRIVE` 바인딩을 사용합니다.

`/api/db-info`에서 현재 연결된 DB host, database, username 등을 확인할 수 있습니다. DB 연결이 되지만 데이터가 다르면 Cloudflare Pages 환경변수의 `DATABASE_URL`이 로컬 `.env`와 다른 DB를 가리키는지 확인하세요.

`ENABLE_DEFAULT_SEED`는 운영에서 보통 `false`로 둡니다. `true`이면 비어 있는 DB에 샘플 메뉴 데이터가 생성될 수 있습니다.

## 자주 쓰는 확인 명령

```bash
node --check src\worker.js
node --check server.js
npx tsc -b
npm run build
npm run cf:pages:deploy
```

## 주의사항

- `.env`의 실제 DB 비밀번호, Toss secret key는 저장소에 커밋하지 마세요.
- Cloudflare Pages의 환경변수와 R2 바인딩은 Dashboard에서 별도로 설정해야 합니다.
- 이미지 업로드를 장기 운영하려면 R2 바인딩을 반드시 사용하는 것이 좋습니다.
- Toss 결제 취소는 실제 테스트 결제 로그에도 반영됩니다. 관리자에서 주문취소 저장 시 확인창을 보고 진행하세요.
