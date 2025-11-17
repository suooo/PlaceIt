import type { AmenityKey, RoomImage } from '@/services/spaces';

const now = new Date();
const isoNow = now.toISOString();

const dateHelper = (daysFromNow: number, hour: number, minute: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export type MockUser = {
  id: number;
  email: string;
  provider: string;
  providerId: string;
  name: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type MockWorkspace = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  activeInvitationCode: string;
  isActive: boolean;
  superAdminName: string;
};

export type MockWorkspaceUser = {
  id: number;
  workspaceId: number;
  userId: number;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  department: string | null;
  position: string | null;
  joinedAt: string;
  updatedAt: string;
  monthlyReservationCount: number;
  user: MockUser;
};

export type MockSpace = {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  location: string;
  capacity: number;
  requiresApproval: boolean;
  isActive: boolean;
  amenities: AmenityKey[];
  images: RoomImage[];
  monthlyReservationCount: number;
  currentUtilizationRate: number;
  size: number;
};

export type MockReservation = {
  id: number;
  workspaceId: number;
  spaceId: number;
  userId: number;
  attendees: string;
  memo: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  purpose: string;
  createdAt: string;
  updatedAt: string;
};

export type MockGroupMember = {
  id: number;
  groupId: number;
  userId: number;
  role: 'LEADER' | 'MEMBER';
  joinedAt: string;
  updatedAt: string;
};

export type MockGroup = {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  leaderName: string;
  type: 'ADMIN' | 'DEPARTMENT';
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  members: MockGroupMember[];
};

export type MockState = {
  currentUserId: number;
  users: MockUser[];
  workspaces: MockWorkspace[];
  workspaceUsers: Record<number, MockWorkspaceUser[]>;
  spaces: Record<number, MockSpace[]>;
  reservations: Record<number, MockReservation[]>;
  groups: Record<number, MockGroup[]>;
  nextIds: {
    workspace: number;
    workspaceUser: number;
    space: number;
    reservation: number;
    group: number;
    groupMember: number;
  };
};

const users: MockUser[] = [
  {
    id: 1,
    email: 'hannah@placeit.io',
    provider: 'GOOGLE',
    providerId: 'google-1',
    name: '한나 이',
    phone: '010-4321-5555',
    createdAt: isoNow,
    updatedAt: isoNow,
    isActive: true,
  },
  {
    id: 2,
    email: 'minsu@placeit.io',
    provider: 'GOOGLE',
    providerId: 'google-2',
    name: '최민수',
    phone: '010-1111-2222',
    createdAt: isoNow,
    updatedAt: isoNow,
    isActive: true,
  },
  {
    id: 3,
    email: 'yuna@placeit.io',
    provider: 'KAKAO',
    providerId: 'kakao-3',
    name: '윤아 정',
    phone: '010-7777-8888',
    createdAt: isoNow,
    updatedAt: isoNow,
    isActive: true,
  },
  {
    id: 4,
    email: 'jaeho@placeit.io',
    provider: 'GOOGLE',
    providerId: 'google-4',
    name: '이재호',
    phone: '010-9999-0000',
    createdAt: isoNow,
    updatedAt: isoNow,
    isActive: true,
  },
];

const workspaces: MockWorkspace[] = [
  {
    id: 1,
    name: 'PlaceIt HQ',
    description: '플레이스잇 본사 공간',
    imageUrl:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    activeInvitationCode: 'HQ-2025',
    isActive: true,
    superAdminName: '한나 이',
  },
  {
    id: 2,
    name: 'Busan R&D Center',
    description: '연구개발 전용 워크스페이스',
    imageUrl:
      'https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=1200&q=80',
    activeInvitationCode: 'RND-7788',
    isActive: true,
    superAdminName: '최민수',
  },
];

const workspaceUsers: Record<number, MockWorkspaceUser[]> = {
  1: [
    {
      id: 101,
      workspaceId: 1,
      userId: 1,
      role: 'SUPER_ADMIN',
      department: '경영지원',
      position: 'Head of Ops',
      joinedAt: isoNow,
      updatedAt: isoNow,
      monthlyReservationCount: 6,
      user: users[0],
    },
    {
      id: 102,
      workspaceId: 1,
      userId: 2,
      role: 'ADMIN',
      department: '제품기획',
      position: 'Product Lead',
      joinedAt: isoNow,
      updatedAt: isoNow,
      monthlyReservationCount: 4,
      user: users[1],
    },
    {
      id: 103,
      workspaceId: 1,
      userId: 3,
      role: 'MEMBER',
      department: '디자인',
      position: 'UX 디자이너',
      joinedAt: isoNow,
      updatedAt: isoNow,
      monthlyReservationCount: 3,
      user: users[2],
    },
    {
      id: 104,
      workspaceId: 1,
      userId: 4,
      role: 'MEMBER',
      department: '엔지니어링',
      position: '백엔드 개발자',
      joinedAt: isoNow,
      updatedAt: isoNow,
      monthlyReservationCount: 2,
      user: users[3],
    },
  ],
  2: [
    {
      id: 201,
      workspaceId: 2,
      userId: 2,
      role: 'SUPER_ADMIN',
      department: 'R&D',
      position: '센터장',
      joinedAt: isoNow,
      updatedAt: isoNow,
      monthlyReservationCount: 5,
      user: users[1],
    },
    {
      id: 202,
      workspaceId: 2,
      userId: 4,
      role: 'ADMIN',
      department: '플랫폼',
      position: 'Tech Lead',
      joinedAt: isoNow,
      updatedAt: isoNow,
      monthlyReservationCount: 4,
      user: users[3],
    },
  ],
};

const sampleImages: RoomImage[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    imageType: 'PHOTO',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c?auto=format&fit=crop&w=1000&q=80',
    imageType: 'PHOTO',
  },
];

const spaces: Record<number, MockSpace[]> = {
  1: [
    {
      id: 301,
      workspaceId: 1,
      name: '알파룸',
      description: '최대 10명 수용, 화상 회의 장비 구비',
      location: 'HQ 3층',
      capacity: 10,
      requiresApproval: false,
      isActive: true,
      amenities: ['wifi', 'projector', 'whiteboard'],
      images: sampleImages,
      monthlyReservationCount: 34,
      currentUtilizationRate: 72,
      size: 28,
    },
    {
      id: 302,
      workspaceId: 1,
      name: '브라보룸',
      description: '임원 미팅 전용 회의실',
      location: 'HQ 4층',
      capacity: 14,
      requiresApproval: true,
      isActive: true,
      amenities: ['wifi', 'projector', 'speaker'],
      images: sampleImages,
      monthlyReservationCount: 18,
      currentUtilizationRate: 61,
      size: 32,
    },
    {
      id: 303,
      workspaceId: 1,
      name: '포커스룸',
      description: '1:1 미팅/화상 회의에 적합',
      location: 'HQ 2층',
      capacity: 4,
      requiresApproval: false,
      isActive: true,
      amenities: ['wifi', 'monitor'],
      images: sampleImages,
      monthlyReservationCount: 40,
      currentUtilizationRate: 88,
      size: 12,
    },
  ],
  2: [
    {
      id: 401,
      workspaceId: 2,
      name: '블루라운지',
      description: '연구팀 협업 공간',
      location: 'R&D 5층',
      capacity: 8,
      requiresApproval: false,
      isActive: true,
      amenities: ['wifi', 'whiteboard', 'projector'],
      images: sampleImages,
      monthlyReservationCount: 12,
      currentUtilizationRate: 54,
      size: 20,
    },
  ],
};

const reservations: Record<number, MockReservation[]> = {
  1: [
    {
      id: 501,
      workspaceId: 1,
      spaceId: 301,
      userId: 1,
      attendees: '민수, 윤아',
      memo: '신규 온보딩',
      startTime: dateHelper(0, 10, 0),
      endTime: dateHelper(0, 11, 0),
      status: 'APPROVED',
      purpose: '팀 온보딩',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    {
      id: 502,
      workspaceId: 1,
      spaceId: 302,
      userId: 2,
      attendees: '임원진',
      memo: '월간 전략',
      startTime: dateHelper(1, 15, 0),
      endTime: dateHelper(1, 16, 30),
      status: 'PENDING',
      purpose: '월간 경영회의',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    {
      id: 503,
      workspaceId: 1,
      spaceId: 303,
      userId: 3,
      attendees: '디자인팀',
      memo: 'UI 리뷰',
      startTime: dateHelper(0, 13, 0),
      endTime: dateHelper(0, 14, 0),
      status: 'APPROVED',
      purpose: 'UI 리뷰',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
  ],
  2: [
    {
      id: 601,
      workspaceId: 2,
      spaceId: 401,
      userId: 2,
      attendees: 'R&D',
      memo: '신규 센서 실험',
      startTime: dateHelper(2, 9, 30),
      endTime: dateHelper(2, 11, 0),
      status: 'APPROVED',
      purpose: '실험 준비',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
  ],
};

const groups: Record<number, MockGroup[]> = {
  1: [
    {
      id: 701,
      workspaceId: 1,
      name: 'HQ 운영위원회',
      description: '워크스페이스 운영 담당자 그룹',
      leaderName: '한나 이',
      type: 'ADMIN',
      maxMembers: 10,
      createdAt: isoNow,
      updatedAt: isoNow,
      members: [
        { id: 801, groupId: 701, userId: 1, role: 'LEADER', joinedAt: isoNow, updatedAt: isoNow },
        { id: 802, groupId: 701, userId: 2, role: 'MEMBER', joinedAt: isoNow, updatedAt: isoNow },
      ],
    },
    {
      id: 702,
      workspaceId: 1,
      name: '디자인팀',
      description: '브랜드/UX 전담',
      leaderName: '윤아 정',
      type: 'DEPARTMENT',
      maxMembers: 15,
      createdAt: isoNow,
      updatedAt: isoNow,
      members: [
        { id: 803, groupId: 702, userId: 3, role: 'LEADER', joinedAt: isoNow, updatedAt: isoNow },
        { id: 804, groupId: 702, userId: 1, role: 'MEMBER', joinedAt: isoNow, updatedAt: isoNow },
      ],
    },
  ],
  2: [
    {
      id: 8010,
      workspaceId: 2,
      name: '부산 연구기획',
      description: 'R&D 주요 의사결정 그룹',
      leaderName: '최민수',
      type: 'ADMIN',
      maxMembers: 12,
      createdAt: isoNow,
      updatedAt: isoNow,
      members: [
        { id: 901, groupId: 8010, userId: 2, role: 'LEADER', joinedAt: isoNow, updatedAt: isoNow },
        { id: 902, groupId: 8010, userId: 4, role: 'MEMBER', joinedAt: isoNow, updatedAt: isoNow },
      ],
    },
  ],
};

export const mockState: MockState = {
  currentUserId: 1,
  users,
  workspaces,
  workspaceUsers,
  spaces,
  reservations,
  groups,
  nextIds: {
    workspace: 3,
    workspaceUser: 300,
    space: 1000,
    reservation: 2000,
    group: 9000,
    groupMember: 12000,
  },
};

export const mockDateHelper = dateHelper;
