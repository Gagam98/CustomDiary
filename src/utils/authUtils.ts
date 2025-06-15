// 인증 관련 유틸리티 함수들

// 사용자 데이터 타입 정의
export interface UserData {
  email: string;
  name?: string;
}

// 로그인 상태 확인
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem("user");
  return user !== null;
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): UserData | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user) as UserData;
  } catch (error) {
    console.error("사용자 정보 파싱 오류:", error);
    return null;
  }
};

// 로그아웃
export const logout = (): void => {
  localStorage.removeItem("user");
  // 페이지 새로고침하여 로그인 페이지로 리디렉션
  window.location.href = "/login";
};

// 사용자 정보 저장
export const saveUser = (userData: UserData): void => {
  localStorage.setItem("user", JSON.stringify(userData));
};
