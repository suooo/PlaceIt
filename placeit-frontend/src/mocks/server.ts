import { AxiosError } from 'axios';
import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import { mockState, type MockGroup, type MockReservation, type MockSpace } from './data';

function buildResponse(
  config: AxiosRequestConfig,
  status: number,
  data: unknown
): AxiosResponse {
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: {},
    config,
    request: undefined,
  };
}

function success(
  config: AxiosRequestConfig,
  status: number,
  data: unknown
): Promise<AxiosResponse> {
  return Promise.resolve(buildResponse(config, status, data));
}

function failure(
  config: AxiosRequestConfig,
  status: number,
  message: string,
  data: unknown = { message }
): Promise<never> {
  const response = buildResponse(config, status, data);
  const error = new AxiosError(message, undefined, config, undefined, response);
  return Promise.reject(error);
}

function parseBody(data: unknown) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

function getUrlParts(config: AxiosRequestConfig) {
  const base = config.baseURL ?? 'https://mock.placeit';
  const raw = config.url ?? '';
  const url = new URL(raw, base);
  return {
    path: url.pathname.replace(/\/+$/, '') || '/',
    query: url.searchParams,
  };
}

function getWorkspaceUsers(workspaceId: number) {
  if (!mockState.workspaceUsers[workspaceId]) {
    mockState.workspaceUsers[workspaceId] = [];
  }
  return mockState.workspaceUsers[workspaceId];
}

function getSpaces(workspaceId: number) {
  if (!mockState.spaces[workspaceId]) {
    mockState.spaces[workspaceId] = [];
  }
  return mockState.spaces[workspaceId];
}

function getReservations(workspaceId: number) {
  if (!mockState.reservations[workspaceId]) {
    mockState.reservations[workspaceId] = [];
  }
  return mockState.reservations[workspaceId];
}

function getGroups(workspaceId: number) {
  if (!mockState.groups[workspaceId]) {
    mockState.groups[workspaceId] = [];
  }
  return mockState.groups[workspaceId];
}

function attachWorkspaceMeta(ws: (typeof mockState.workspaces)[number]) {
  const users = getWorkspaceUsers(ws.id);
  const myRole =
    users.find(u => u.userId === mockState.currentUserId)?.role ?? 'MEMBER';
  return {
    ...ws,
    userRole: myRole,
    workspaceUsers: users,
    userCount: users.length,
  };
}

function withSpaceMeta(space: MockSpace) {
  return {
    ...space,
    deleted: false,
    monthlyReservationCount: space.monthlyReservationCount,
    currentUtilizationRate: space.currentUtilizationRate,
  };
}

function reservationPayload(reservation: MockReservation) {
  const spaces = getSpaces(reservation.workspaceId);
  const space = spaces.find(s => s.id === reservation.spaceId);
  const user = mockState.users.find(u => u.id === reservation.userId);
  return {
    ...reservation,
    space,
    user,
  };
}

function groupSummaryPayload(group: MockGroup) {
  const memberCount = group.members.length;
  const isAdmin = group.type === 'ADMIN';
  return {
    ...group,
    memberCount,
    isAdmin,
  };
}

function findGroupById(groupId: number) {
  for (const wsId of Object.keys(mockState.groups)) {
    const list = mockState.groups[Number(wsId)] ?? [];
    const target = list.find(g => g.id === groupId);
    if (target) return target;
  }
  return null;
}

function removeGroupById(groupId: number) {
  for (const wsId of Object.keys(mockState.groups)) {
    const list = mockState.groups[Number(wsId)] ?? [];
    const idx = list.findIndex(g => g.id === groupId);
    if (idx >= 0) {
      list.splice(idx, 1);
      return true;
    }
  }
  return false;
}

function computeAvailableSlots(spaceId: number, date: string) {
  const dayStart = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dayStart.getTime())) return [];
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  const workspaceId = Object.keys(mockState.spaces).find(id =>
    (mockState.spaces[Number(id)] ?? []).some(s => s.id === spaceId)
  );
  if (!workspaceId) {
    return [
      { startTime: new Date(dayStart).toISOString(), endTime: new Date(dayEnd).toISOString() },
    ];
  }
  const reservations = getReservations(Number(workspaceId)).filter(
    r => r.spaceId === spaceId
  );
  const ranges = reservations
    .filter(r => r.status === 'APPROVED' || r.status === 'PENDING')
    .map(r => ({
      start: new Date(r.startTime).getTime(),
      end: new Date(r.endTime).getTime(),
    }))
    .filter(r => !Number.isNaN(r.start) && !Number.isNaN(r.end))
    .sort((a, b) => a.start - b.start);
  const slots: { startTime: string; endTime: string }[] = [];
  let cursor = dayStart.getTime() + 9 * 60 * 60 * 1000; // 09:00
  const closing = dayStart.getTime() + 20 * 60 * 60 * 1000; // 20:00
  for (const range of ranges) {
    if (range.start > cursor) {
      slots.push({ startTime: new Date(cursor).toISOString(), endTime: new Date(Math.min(range.start, closing)).toISOString() });
    }
    cursor = Math.max(cursor, range.end);
  }
  if (cursor < closing) {
    slots.push({ startTime: new Date(cursor).toISOString(), endTime: new Date(closing).toISOString() });
  }
  return slots;
}

function ensureMemberInGroup(group: MockGroup, userId: number) {
  const exists = group.members.find(m => m.userId === userId);
  if (exists) return exists;
  const member = {
    id: mockState.nextIds.groupMember++,
    groupId: group.id,
    userId,
    role: 'MEMBER' as const,
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  group.members.push(member);
  return member;
}

export const mockAdapter: AxiosAdapter = async config => {
  const method = (config.method ?? 'get').toUpperCase();
  const { path, query } = getUrlParts(config);
  const body = parseBody(config.data);

  // Authentication helpers
  if (method === 'POST' && path === '/auth/refresh') {
    return success(config, 200, { accessToken: 'mock-access-token' });
  }
  if (method === 'POST' && path === '/auth/signout') {
    return success(config, 200, { ok: true });
  }

  if (method === 'GET' && path === '/users/me') {
    const user = mockState.users.find(u => u.id === mockState.currentUserId);
    return success(config, 200, user ?? null);
  }

  if (method === 'GET' && path === '/workspaces/my') {
    const payload = mockState.workspaces.map(attachWorkspaceMeta);
    return success(config, 200, { workspaces: payload });
  }

  const workspaceIdMatch = path.match(/^\/workspaces\/(\d+)$/);
  if (workspaceIdMatch) {
    const id = Number(workspaceIdMatch[1]);
    const workspace = mockState.workspaces.find(w => w.id === id);
    if (!workspace) {
      return failure(config, 404, 'Workspace not found');
    }
    if (method === 'GET') {
      return success(config, 200, attachWorkspaceMeta(workspace));
    }
    if (method === 'PATCH') {
      Object.assign(workspace, body);
      return success(config, 200, attachWorkspaceMeta(workspace));
    }
    if (method === 'DELETE') {
      const idx = mockState.workspaces.findIndex(w => w.id === id);
      if (idx >= 0) mockState.workspaces.splice(idx, 1);
      delete mockState.workspaceUsers[id];
      delete mockState.spaces[id];
      delete mockState.reservations[id];
      delete mockState.groups[id];
      return success(config, 200, { ok: true });
    }
  }

  const workspaceActionMatch = path.match(/^\/workspaces\/(\d+)\/(activate|deactivate)$/);
  if (workspaceActionMatch && method === 'PATCH') {
    const id = Number(workspaceActionMatch[1]);
    const workspace = mockState.workspaces.find(w => w.id === id);
    if (!workspace) return failure(config, 404, 'Workspace not found');
    workspace.isActive = workspaceActionMatch[2] === 'activate';
    return success(config, 200, attachWorkspaceMeta(workspace));
  }

  if (method === 'POST' && path === '/workspaces') {
    const nextId = mockState.nextIds.workspace++;
    const newWorkspace = {
      id: nextId,
      name: body?.name ?? `Workspace ${nextId}`,
      description: body?.description ?? '',
      imageUrl: body?.imageUrl ?? mockState.workspaces[0]?.imageUrl ?? '',
      activeInvitationCode: body?.code ?? `WS-${nextId}`,
      isActive: true,
      superAdminName: mockState.users.find(u => u.id === mockState.currentUserId)?.name ?? '관리자',
    };
    mockState.workspaces.unshift(newWorkspace);
    mockState.workspaceUsers[nextId] = [
      {
        id: mockState.nextIds.workspaceUser++,
        workspaceId: nextId,
        userId: mockState.currentUserId,
        role: 'SUPER_ADMIN',
        department: '운영',
        position: '워크스페이스 관리자',
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        monthlyReservationCount: 0,
        user: mockState.users.find(u => u.id === mockState.currentUserId)!,
      },
    ];
    return success(config, 201, attachWorkspaceMeta(newWorkspace));
  }

  if (method === 'POST' && path === '/workspaces/join') {
    const code = String(body?.code ?? '');
    const workspace = mockState.workspaces.find(w => w.activeInvitationCode === code);
    if (!workspace) return failure(config, 404, '초대 코드를 찾을 수 없습니다.');
    const members = getWorkspaceUsers(workspace.id);
    if (!members.some(m => m.userId === mockState.currentUserId)) {
      members.push({
        id: mockState.nextIds.workspaceUser++,
        workspaceId: workspace.id,
        userId: mockState.currentUserId,
        role: 'MEMBER',
        department: '합류 팀',
        position: '구성원',
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        monthlyReservationCount: 0,
        user: mockState.users.find(u => u.id === mockState.currentUserId)!,
      });
    }
    return success(config, 200, attachWorkspaceMeta(workspace));
  }

  const leaveMatch = path.match(/^\/workspaces\/(\d+)\/leave$/);
  if (leaveMatch && method === 'DELETE') {
    const workspaceId = Number(leaveMatch[1]);
    const members = getWorkspaceUsers(workspaceId);
    const idx = members.findIndex(m => m.userId === mockState.currentUserId);
    if (idx >= 0) members.splice(idx, 1);
    return success(config, 200, { ok: true });
  }

  const workspaceUsersMatch = path.match(/^\/workspaces\/(\d+)\/users$/);
  if (workspaceUsersMatch) {
    const workspaceId = Number(workspaceUsersMatch[1]);
    if (method === 'GET') {
      return success(config, 200, getWorkspaceUsers(workspaceId));
    }
  }

  const workspaceUserDeleteMatch = path.match(/^\/workspaces\/(\d+)\/users\/(\d+)$/);
  if (workspaceUserDeleteMatch && method === 'DELETE') {
    const workspaceId = Number(workspaceUserDeleteMatch[1]);
    const userId = Number(workspaceUserDeleteMatch[2]);
    const members = getWorkspaceUsers(workspaceId);
    const idx = members.findIndex(m => m.userId === userId);
    if (idx >= 0) members.splice(idx, 1);
    return success(config, 200, { ok: true });
  }

  const workspaceRoleMatch = path.match(/^\/workspaces\/(\d+)\/users\/role$/);
  if (workspaceRoleMatch && method === 'PATCH') {
    const workspaceId = Number(workspaceRoleMatch[1]);
    const userId = Number(body?.userId);
    const role = (body?.role as string)?.toUpperCase();
    const members = getWorkspaceUsers(workspaceId);
    const target = members.find(m => m.userId === userId);
    if (!target) return failure(config, 404, '사용자를 찾을 수 없습니다.');
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MEMBER') {
      target.role = role as typeof target.role;
    }
    return success(config, 200, target);
  }

  const mePatchMatch = path.match(/^\/workspaces\/(\d+)\/me$/);
  if (mePatchMatch && method === 'PATCH') {
    const workspaceId = Number(mePatchMatch[1]);
    const members = getWorkspaceUsers(workspaceId);
    const target = members.find(m => m.userId === mockState.currentUserId);
    if (target) {
      if (body?.department !== undefined) target.department = body.department;
      if (body?.position !== undefined) target.position = body.position;
      target.updatedAt = new Date().toISOString();
    }
    return success(config, 200, target ?? null);
  }

  const spacesMatch = path.match(/^\/workspaces\/(\d+)\/spaces$/);
  if (spacesMatch) {
    const workspaceId = Number(spacesMatch[1]);
    if (method === 'GET') {
      const list = getSpaces(workspaceId).map(withSpaceMeta);
      return success(config, 200, { spaces: list, total: list.length });
    }
    if (method === 'POST') {
      const nextId = mockState.nextIds.space++;
      const newSpace: MockSpace = {
        id: nextId,
        workspaceId,
        name: body?.name ?? `회의실 ${nextId}`,
        description: body?.description ?? '',
        location: body?.location ?? '미정',
        capacity: Number(body?.capacity ?? 6),
        requiresApproval: Boolean(body?.requiresApproval),
        isActive: true,
        amenities: Array.isArray(body?.amenities) ? body.amenities : [],
        images: Array.isArray(body?.images) ? body.images : [],
        monthlyReservationCount: 0,
        currentUtilizationRate: 0,
        size: Number(body?.size ?? 20),
      };
      getSpaces(workspaceId).unshift(newSpace);
      return success(config, 201, withSpaceMeta(newSpace));
    }
  }

  const spaceDetailMatch = path.match(/^\/workspaces\/(\d+)\/spaces\/(\d+)$/);
  if (spaceDetailMatch) {
    const workspaceId = Number(spaceDetailMatch[1]);
    const spaceId = Number(spaceDetailMatch[2]);
    const list = getSpaces(workspaceId);
    const space = list.find(s => s.id === spaceId);
    if (!space) return failure(config, 404, '회의실을 찾을 수 없습니다.');
    if (method === 'GET') {
      return success(config, 200, withSpaceMeta(space));
    }
    if (method === 'PATCH') {
      Object.assign(space, body);
      return success(config, 200, withSpaceMeta(space));
    }
    if (method === 'DELETE') {
      const idx = list.findIndex(s => s.id === spaceId);
      if (idx >= 0) list.splice(idx, 1);
      return success(config, 200, { ok: true });
    }
  }

  const spaceToggleMatch = path.match(
    /^\/workspaces\/(\d+)\/spaces\/(\d+)\/(activate|deactivate)$/
  );
  if (spaceToggleMatch && method === 'PATCH') {
    const workspaceId = Number(spaceToggleMatch[1]);
    const spaceId = Number(spaceToggleMatch[2]);
    const list = getSpaces(workspaceId);
    const space = list.find(s => s.id === spaceId);
    if (!space) return failure(config, 404, '회의실을 찾을 수 없습니다.');
    space.isActive = spaceToggleMatch[3] === 'activate';
    return success(config, 200, withSpaceMeta(space));
  }

  const reservationsMatch = path.match(/^\/workspaces\/(\d+)\/reservations$/);
  if (reservationsMatch) {
    const workspaceId = Number(reservationsMatch[1]);
    if (method === 'GET') {
      const list = getReservations(workspaceId).map(reservationPayload);
      return success(config, 200, { reservations: list, total: list.length });
    }
  }

  if (method === 'GET' && path === '/reservations/my') {
    const list: MockReservation[] = Object.values(mockState.reservations).flat();
    const mine = list.filter(r => r.userId === mockState.currentUserId);
    return success(config, 200, { reservations: mine.map(reservationPayload) });
  }

  if (method === 'POST' && path === '/reservations') {
    const spaceId = Number(body?.spaceId);
    const resolvedSpaceEntry = Object.entries(mockState.spaces).find(([, list]) =>
      list.some(s => s.id === spaceId)
    );
    const resolvedWorkspaceId = resolvedSpaceEntry
      ? Number(resolvedSpaceEntry[0])
      : Number(body?.workspaceId ?? mockState.workspaces[0]?.id ?? 1);
    const reservations = getReservations(resolvedWorkspaceId);
    const newReservation: MockReservation = {
      id: mockState.nextIds.reservation++,
      workspaceId: resolvedWorkspaceId,
      spaceId,
      userId: mockState.currentUserId,
      attendees: body?.attendees ?? '',
      memo: body?.memo ?? '',
      startTime: body?.startTime ?? new Date().toISOString(),
      endTime: body?.endTime ?? new Date().toISOString(),
      status: 'PENDING',
      purpose: body?.purpose ?? '예약',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    return success(config, 201, reservationPayload(newReservation));
  }

  const reservationIdMatch = path.match(/^\/reservations\/(\d+)$/);
  if (reservationIdMatch) {
    const id = Number(reservationIdMatch[1]);
    const reservation = Object.values(mockState.reservations)
      .flat()
      .find(r => r.id === id);
    if (!reservation) return failure(config, 404, '예약을 찾을 수 없습니다.');
    if (method === 'PATCH') {
      Object.assign(reservation, body);
      reservation.updatedAt = new Date().toISOString();
      return success(config, 200, reservationPayload(reservation));
    }
    if (method === 'DELETE') {
      for (const list of Object.values(mockState.reservations)) {
        const idx = list.findIndex(r => r.id === id);
        if (idx >= 0) {
          list.splice(idx, 1);
          break;
        }
      }
      return success(config, 200, { ok: true });
    }
  }

  const reservationActionMatch = path.match(
    /^\/reservations\/(\d+)\/(approve|reject)$/
  );
  if (reservationActionMatch && method === 'POST') {
    const id = Number(reservationActionMatch[1]);
    const reservation = Object.values(mockState.reservations)
      .flat()
      .find(r => r.id === id);
    if (!reservation) return failure(config, 404, '예약을 찾을 수 없습니다.');
    reservation.status =
      reservationActionMatch[2] === 'approve' ? 'APPROVED' : 'REJECTED';
    reservation.updatedAt = new Date().toISOString();
    return success(config, 200, reservationPayload(reservation));
  }

  if (method === 'GET' && path === '/reservations/available-times') {
    const spaceId = Number(query.get('spaceId') ?? body?.spaceId ?? 0);
    const date = query.get('date') ?? body?.date ?? new Date().toISOString().slice(0, 10);
    const slots = computeAvailableSlots(spaceId, date);
    return success(config, 200, { availableSlots: slots });
  }

  if (method === 'GET' && path === '/groups') {
    const list = Object.values(mockState.groups).flat();
    return success(config, 200, list.map(groupSummaryPayload));
  }

  const groupsWorkspaceMatch = path.match(/^\/groups\/workspace\/(\d+)$/);
  if (groupsWorkspaceMatch && method === 'GET') {
    const workspaceId = Number(groupsWorkspaceMatch[1]);
    const list = getGroups(workspaceId).map(groupSummaryPayload);
    return success(config, 200, list);
  }

  if (method === 'POST' && path === '/groups') {
    const workspaceId = Number(body?.workspaceId ?? 1);
    const group: MockGroup = {
      id: mockState.nextIds.group++,
      workspaceId,
      name: body?.name ?? '새 그룹',
      description: body?.description ?? '',
      leaderName: body?.leaderName ?? '리더',
      type: (body?.type as string)?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'DEPARTMENT',
      maxMembers: Number(body?.maxMembers ?? 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [],
    };
    getGroups(workspaceId).unshift(group);
    return success(config, 201, groupSummaryPayload(group));
  }

  const groupDetailMatch = path.match(/^\/groups\/(\d+)$/);
  if (groupDetailMatch) {
    const groupId = Number(groupDetailMatch[1]);
    const group = findGroupById(groupId);
    if (!group) return failure(config, 404, '그룹을 찾을 수 없습니다.');
    if (method === 'PATCH') {
      Object.assign(group, {
        name: body?.name ?? group.name,
        description: body?.description ?? group.description,
        maxMembers: body?.maxMembers ?? group.maxMembers,
        type: (body?.type as string)?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'DEPARTMENT',
        leaderName: body?.leader ?? body?.leaderName ?? group.leaderName,
        updatedAt: new Date().toISOString(),
      });
      return success(config, 200, groupSummaryPayload(group));
    }
    if (method === 'DELETE') {
      removeGroupById(groupId);
      return success(config, 200, { ok: true });
    }
  }

  const workspaceGroupDeleteMatch = path.match(
    /^\/workspaces\/(\d+)\/groups\/(\d+)$/
  );
  if (workspaceGroupDeleteMatch && method === 'DELETE') {
    const groupId = Number(workspaceGroupDeleteMatch[2]);
    removeGroupById(groupId);
    return success(config, 200, { ok: true });
  }

  const groupMembersMatch = path.match(/^\/groups\/(\d+)\/members$/);
  if (groupMembersMatch && method === 'GET') {
    const groupId = Number(groupMembersMatch[1]);
    const group = findGroupById(groupId);
    if (!group) return failure(config, 404, '그룹을 찾을 수 없습니다.');
    const members = group.members.map(member => ({
      ...member,
      user: mockState.users.find(u => u.id === member.userId),
    }));
    return success(config, 200, members);
  }

  const groupMemberAddMatch = path.match(/^\/groups\/(\d+)\/members\/(\d+)$/);
  if (groupMemberAddMatch) {
    const groupId = Number(groupMemberAddMatch[1]);
    const userId = Number(groupMemberAddMatch[2]);
    const group = findGroupById(groupId);
    if (!group) return failure(config, 404, '그룹을 찾을 수 없습니다.');
    if (method === 'POST') {
      const member = ensureMemberInGroup(group, userId);
      return success(config, 200, {
        ...member,
        user: mockState.users.find(u => u.id === userId),
      });
    }
    if (method === 'DELETE') {
      const idx = group.members.findIndex(m => m.userId === userId);
      if (idx >= 0) group.members.splice(idx, 1);
      return success(config, 200, { ok: true });
    }
  }

  const groupJoinMatch = path.match(/^\/groups\/(\d+)\/join$/);
  if (groupJoinMatch && method === 'POST') {
    const group = findGroupById(Number(groupJoinMatch[1]));
    if (!group) return failure(config, 404, '그룹을 찾을 수 없습니다.');
    ensureMemberInGroup(group, mockState.currentUserId);
    return success(config, 200, groupSummaryPayload(group));
  }

  const groupLeaveMatch = path.match(/^\/groups\/(\d+)\/leave$/);
  if (groupLeaveMatch && method === 'DELETE') {
    const group = findGroupById(Number(groupLeaveMatch[1]));
    if (!group) return failure(config, 404, '그룹을 찾을 수 없습니다.');
    const idx = group.members.findIndex(m => m.userId === mockState.currentUserId);
    if (idx >= 0) group.members.splice(idx, 1);
    return success(config, 200, { ok: true });
  }

  return failure(config, 404, `Mock route not found: ${method} ${path}`);
};
