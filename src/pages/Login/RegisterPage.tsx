import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../utils/authUtils";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>(""); // API 에러 메시지용
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // API 에러 메시지 초기화
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "이름은 최소 2자 이상이어야 합니다.";
    }

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
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
      // authUtils의 registerUser 함수 사용
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("회원가입 성공:", result);

      // 성공 메시지 표시
      alert("회원가입에 성공했습니다! 자동으로 로그인됩니다.");

      // 회원가입 성공 후 홈으로 리디렉션 (이미 로그인 상태)
      navigate("/", { replace: true });
    } catch (error: unknown) {
      console.error("회원가입 실패:", error);

      // Error 타입 체크
      if (error instanceof Error) {
        setApiError(error.message);
      } else if (typeof error === "string") {
        setApiError(error);
      } else {
        setApiError("회원가입에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          회원가입
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 w-full px-3 py-2 border ${
                errors.name ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`mt-1 w-full px-3 py-2 border ${
                errors.confirmPassword ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
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
            {isLoading ? "회원가입 중..." : "회원가입"}
          </button>

          <div className="text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
