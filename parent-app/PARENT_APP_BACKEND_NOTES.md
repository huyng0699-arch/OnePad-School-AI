# Parent App backend-required patch

- Frontend không còn phụ thuộc file mock data.
- Tất cả màn Parent App gọi backend qua `lib/api.ts`.
- Khi backend chưa chạy, màn hình hiển thị empty state an toàn thay vì dữ liệu giả.
- `DEFAULT_STUDENT_ID` đọc từ `NEXT_PUBLIC_PARENT_STUDENT_ID`.
- `PARENT_USER_ID` gửi qua header `x-parent-user-id`.
