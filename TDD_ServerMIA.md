TDD - serverMIA (Admin Frontend)
Role: Super Admin Portal Tech Stack: React (Vite), TypeScript, ShadCN UI, Tailwind Port: 5175 (แยกจาก Client Portal: 5174) Base: Forked from ProjectMIAFrontend

1. Configuration (vite.config.ts & .env)
Port: 5175

Proxy: /api -> http://localhost:8002 (ชี้ไป Server C)

Auth: ใช้ Firebase Project เดิม แต่เพิ่ม Logic เช็ค Email หรือ Custom Claim ว่าเป็น Admin หรือไม่

2. Sitemap & UI Components
/login: หน้า Login (Design เดิม แต่เปลี่ยน Logo/Wording เป็น Admin Console)

/dashboard (All Shops View)

Table: แสดงรายชื่อร้านค้าทั้งหมด

Columns:

Shop Name

Owner (Email)

Plan (Badge สีต่างกัน: Free, Pro)

LINE Status (✅ Connected / ❌ Disconnected)

Action: ปุ่ม "Manage"

/shops/:shopId (Shop Detail)

Tab 1: Overview: ข้อมูลพื้นฐาน, สถิติ (ดึงจาก Server C ในอนาคต)

Tab 2: Integration: (Copy StoreIntegration.tsx มาปรับ)

ฟอร์มกรอก LINE Keys

เปลี่ยน: จากที่เคยดึง store.id จาก Context ตัวเอง -> ให้ใช้ shopId จาก URL Params แทน

Tab 3: Plan & Billing: Dropdown เปลี่ยน Tier

3. Core Logic Changes (Refactoring)
useStore.ts:

เดิม: เก็บ store ของตัวเอง

ใหม่: ไม่ต้องเก็บ store (เพราะ Admin ดูได้หลายร้าน) แต่เก็บ adminProfile แทน

api.ts:

ชี้ไปที่ Endpoints ของ Server C (/admin/...)