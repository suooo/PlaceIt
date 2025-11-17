'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/axios';
import { USE_MOCK } from '@/config/env';
import { mockState, type MockUser } from '@/mocks/data';
import { useUserStore } from '@/stores/userStore';

// const SERVER = process.env.NEXT_PUBLIC_API_BASE_URL!;
const SERVER = 'https://placeit-server-332546556871.asia-northeast1.run.app';

const MOCK_TOKEN = 'mock-access-token';

function getMockMembership(userId: number) {
  for (const [workspaceId, members] of Object.entries(
    mockState.workspaceUsers
  )) {
    const membership = members.find(member => member.userId === userId);
    if (membership) {
      const workspace = mockState.workspaces.find(
        ws => ws.id === Number(workspaceId)
      );
      if (workspace) {
        return { workspace, membership };
      }
    }
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useUserStore();
  const [mockLoadingId, setMockLoadingId] = useState<number | null>(null);

  const handleKakaoLogin = () => {
    window.location.href = `${SERVER}/auth/kakao`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${SERVER}/auth/google`;
  };

  const handleMockLogin = async (user: MockUser) => {
    if (!USE_MOCK) return;
    try {
      setMockLoadingId(user.id);
      mockState.currentUserId = user.id;
      localStorage.setItem('accessToken', MOCK_TOKEN);

      const { data: me } = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` },
      });
      setAuth({ user: me, accessToken: MOCK_TOKEN });

      const membership = getMockMembership(user.id);
      router.replace(membership ? '/dashboard' : '/invite-check');
    } catch (error) {
      console.error('[mock-login] failed', error);
    } finally {
      setMockLoadingId(null);
    }
  };

  const mockUsers = USE_MOCK ? mockState.users : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50/30">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="brand-logo">
              <Image
                src="/icon.svg"
                alt="PlaceIt Icon"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <Image
                src="/logo.svg"
                alt="PlaceIt"
                width={120}
                height={24}
                className="h-6"
              />
            </div>
          </div>
          <p className="text-lg text-gray-600">
            워크스페이스 회의실 예약 시스템
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                시작하기
              </CardTitle>
              <CardDescription className="text-gray-600">
                소셜 계정으로 간편하게 로그인하세요
              </CardDescription>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-6">
              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                  Google로 계속하기
                </div>
              </Button>

              {/* Kakao Login */}
              <Button
                onClick={handleKakaoLogin}
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-yellow-400 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">K</span>
                  </div>
                  카카오로 계속하기
                </div>
              </Button>
            </div>

            {USE_MOCK && (
              <div className="mt-10">
                <div className="text-center mb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Mock 데이터로 바로 체험하기
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    워크스페이스 참여 여부에 따라 대시보드 또는 초대코드 화면으로 이동합니다
                  </CardDescription>
                </div>
                <div className="space-y-3">
                  {mockUsers.map(user => {
                    const membership = getMockMembership(user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleMockLogin(user)}
                        disabled={mockLoadingId === user.id}
                        className={`w-full text-left border rounded-lg p-4 transition-all ${
                          mockLoadingId === user.id
                            ? 'bg-gray-100 cursor-not-allowed opacity-70'
                            : 'hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              membership
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {membership ? '워크스페이스 참여중' : '신규 로그인'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {membership
                            ? `${membership.workspace.name} · ${membership.membership.role}`
                            : '초대코드 입력 또는 워크스페이스 생성 플로우로 이동합니다'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          로그인하시면
          <a href="#" className="text-blue-600 hover:underline">
            서비스 약관
          </a>
          과{' '}
          <a href="#" className="text-blue-600 hover:underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </div>
      </div>
    </div>
  );
}
