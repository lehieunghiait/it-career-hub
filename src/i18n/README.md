# Đa ngôn ngữ (i18next)

Ngôn ngữ: **vi** (mặc định), **en**, **ja**. Người dùng đổi bằng nút 🌐 ở header (client và admin);
lựa chọn được lưu trong `localStorage` (`lang`). Lần đầu truy cập lấy theo ngôn ngữ trình duyệt.

## Cấu trúc
```
src/i18n/
  index.ts               # khởi tạo i18next, tự nạp mọi JSON trong locales/<lang>/**
  AppLocaleProvider.tsx  # đồng bộ locale antd + dayjs, render lại app khi đổi ngôn ngữ
  locales/{vi,en,ja}/
    app.json             # toàn bộ text giao diện (sinh bởi scripts/i18n), key theo đường dẫn file
    header.client.json, about.json, ...  # namespace cũ (dùng với useTranslation('header')...)
```

## Viết text mới
```tsx
import i18next from 'i18next';
<Button>{i18next.t('app:common.save')}</Button>
message.success(i18next.t('app:pages.job.index.saved', { v0: name }));   // "Đã lưu {{v0}}"
```
Thêm key vào **cả 3 file** `locales/{vi,en,ja}/app.json`. Text dùng chung: nhóm `common`.

Trong object khai báo ngoài component (danh sách, option...), dùng getter để text dịch lúc render:
```ts
export const STATUS = [{ value: 'NEW', get label() { return i18next.t('app:...'); } }];
```

## Công cụ (scripts/i18n)
- `extract.cjs`  – thống kê chuỗi còn hard-code: `TS_PATH=node_modules/typescript node scripts/i18n/extract.cjs src`
- `codemod.cjs`  – tự thay chuỗi bằng `i18next.t(...)` (chạy không `--write` để xem trước)
- `merge.cjs` + `tr/*.tsv` – ghép bản dịch thành `app.json`

## Thêm ngôn ngữ mới
1. Tạo `locales/<code>/` với cùng các file JSON.
2. Thêm vào `SUPPORTED_LANGUAGES` trong `index.ts` và locale antd/dayjs trong `AppLocaleProvider.tsx`.
