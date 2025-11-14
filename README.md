# 🏢 PlaceIt  
**회사의 회의실·공용 공간을 한 눈에 관리하는 공간 예약 플랫폼**

쉽고 빠른 공간 예약 관리 시스템으로  
회의실과 공용 공간을 효율적으로 관리하세요.

🔗 **Demo**  
https://placeit-client-332546556871.asia-northeast1.run.app/

---

## 📌 프로젝트 소개

**PlaceIt**은 여러 개의 회사를 한 계정에서 관리할 수 있는  
**멀티 워크스페이스 기반 공간 예약 관리 서비스**입니다.

운영자는 회의실과 공용 공간을 등록 및 승인/거절하고,  
구성원들은 웹에서 쉽고 직관적으로 예약·조회할 수 있습니다.

> “별도의 매뉴얼 없이도 직관적으로 사용할 수 있는 서비스” — 프로그래머스 CTO 리뷰 中

---
## ✨ 주요 기능

### 👥 워크스페이스 & 멤버 관리
<div style="display: flex; gap: 10px; align-items: flex-start;">
  <img 
    src="https://github.com/user-attachments/assets/a329e9d3-f78b-4cef-b762-db5b21eaaa32" 
    style="width: 48%; height: 260px; object-fit: cover; object-position: top;" 
  />
  <img 
    src="https://github.com/user-attachments/assets/6042159f-3b4b-4fc0-9199-85cde55ba6dc"
    style="width: 48%; height: 260px; object-fit: cover; object-position: top;" 
  />
</div>

- 여러 회사를 **워크스페이스 단위**로 분리하여 관리
- 초대 코드로 워크스페이스 참여 가능, 코드가 없으면 새로운 워크스페이스 생성
- 역할 기반 권한 설정 (`SUPER_ADMIN`, `ADMIN`, `MEMBER`)
- 워크스페이스 전환 기능으로 **멀티 조직 환경** 지원


### 🔐 OAuth 기반 인증 (로그인 & 회원가입)
<div style="display: flex; gap: 10px; align-items: flex-start;">
  <img 
    src="https://github.com/user-attachments/assets/b92ab988-8457-4341-ba13-dcdcba96b522"
    style="width: 23%; height: 280px; object-fit: cover; object-position: top;"
  />
  <img 
    src="https://github.com/user-attachments/assets/51cc2843-80dd-48f8-b197-37b814db9700"
    style="width: 23%; height: 280px; object-fit: cover; object-position: top;"
  />
  <img 
    src="https://github.com/user-attachments/assets/2716943a-de6a-4c2e-a31c-92c9aac8b527"
    style="width: 23%; height: 280px; object-fit: cover; object-position: top;"
  />
</div>

- **Google / Kakao OAuth** 간편 로그인/회원가입
- 최초 로그인 시 자동 프로필 생성
- JWT 기반 토큰 구조로 **세션 유지 및 자동 재발급**


### 🏢 공간(회의실) 관리
<div style="display: flex; gap: 10px; align-items: flex-start;">
  <img 
    src="https://github.com/user-attachments/assets/61b553a6-2c7d-4e45-91b7-31c50f97d46c" 
    style="width: 50%; height: 280px; object-fit: cover; object-position: top;"
  />
  <img 
    src="https://github.com/user-attachments/assets/e02c0b0e-3ca0-4647-b5a2-c9f90a8eabf9" 
    style="width: 20%; height: 280px; object-fit: cover; object-position: top;"
  />
</div>

- **자유 예약 공간 / 승인 필요 공간** 두 유형의 회의실 관리
- 공간 이미지, 편의시설 아이콘, 수용 인원 설정
- 상단의 **공간 통계 / 검색 / 필터**
  

### 📅 예약 관리
<div style="display: flex; gap: 10px; align-items: flex-start;">
  <img 
    src="https://github.com/user-attachments/assets/58d426f2-d9ea-4999-803c-9f202204811e"
    style="width: 48%; height: 280px; object-fit: cover; object-position: top;"
  />
  <img 
    src="https://github.com/user-attachments/assets/544eb533-cf10-49ee-9177-83d8c88ee9e5"
    style="width: 48%; height: 280px; object-fit: cover; object-position: top;"
  />
</div>

- 일/주/월 단위 캘린더
- 예약 상태(`PENDING`, `APPROVED`, `REJECTED`) 표시
- 중복 예약 자동 방지 & 시각적 중첩 처리
- 예약 통계, 검색, 필터 제공


### 👤 사용자 & 그룹 관리
<div style="display: flex; gap: 10px; align-items: flex-start;">
  <img 
    src="https://github.com/user-attachments/assets/68b37a77-afa0-41ec-acad-1a570f1bb823"
    style="width: 49%; height: 280px; object-fit: cover; object-position: top;"
  />
  <img 
    src="https://github.com/user-attachments/assets/f2ae681f-d208-43a2-9205-e9dd9b5b6dca"
    style="width: 49%; height: 280px; object-fit: cover; object-position: top;"
  />
</div>

- 사용자 목록 조회 및 역할 변경
- 그룹 생성/관리, 그룹별 멤버 운영

---

## 🛠 기술 스택

### 🎨 Frontend
- **Framework & Language:** Next.js, React, TypeScript  
- **UI/UX:** TailwindCSS, shadcn/ui  
- **State Management:** Zustand  
- **API & Utility:** Axios  
- **Design System / 문서화:** Storybook  

### 🧱 Backend
- **Framework:** Nest.js  
- **ORM / Database:** TypeORM, MySQL  
- **API 문서화:** Swagger  
- **Infra & DevOps:** Docker, Google Cloud (Cloud Run / SQL 등)



### 기타

- 폰트: **Pretendard** (한글 가독성 최적화)
- 배포: Google Cloud Run
- 형상관리: Git / GitHub, Git Flow 브랜치 전략
