import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../../utils/authUtils";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>

        {/* API 에러 메시지 표시 */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 w-full px-3 py-2 border ${
                errors.email ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="이메일을 입력하세요"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`mt-1 w-full px-3 py-2 border ${
                errors.password ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="text-center text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
