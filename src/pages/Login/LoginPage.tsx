import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../../utils/authLogin";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>(""); // API 에러 메시지용
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 후 이동할 경로 (기본값: 홈)
  const from = location.state?.from?.pathname || "/";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // API 에러 메시지 초기화
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      // authUtils의 loginUser 함수 사용
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      console.log("로그인 성공:", result);

      // 성공 메시지 표시 (선택사항)
      // alert("로그인에 성공했습니다.");

      // 원래 접근하려던 페이지로 이동
      navigate(from, { replace: true });
    } catch (error: unknown) {
      console.error("로그인 실패:", error);

      // Error 타입 체크
      if (error instanceof Error) {
        setApiError(error.message);
      } else if (typeof error === "string") {
        setApiError(error);
      } else {
        setApiError("로그인에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 장식용 배경 요소 */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative z-10">
        <div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-slate-900">
            환영합니다 👋
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500 font-medium">
            계정에 로그인하시고 계속 진행해주세요
          </p>
        </div>

        {/* API 에러 메시지 표시 */}
        {apiError && (
          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-medium text-red-600 text-center">{apiError}</p>
          </div>
        )}

        <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 ml-1 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3.5 bg-white/50 border ${
                  errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                } rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 text-sm`}
                placeholder="이메일을 입력하세요"
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-500 mt-2 ml-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 ml-1 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3.5 bg-white/50 border ${
                  errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                } rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 text-sm`}
                placeholder="비밀번호를 입력하세요"
              />
              {errors.password && (
                <p className="text-sm font-medium text-red-500 mt-2 ml-1 animate-in fade-in slide-in-from-top-1">{errors.password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-8 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 ${
              isLoading
                ? "bg-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
            }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="text-center text-sm font-medium text-slate-500 pt-2">
            계정이 없으신가요?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline underline-offset-4 transition-all"
            >
              회원가입하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
