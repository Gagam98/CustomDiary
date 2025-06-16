// Canvas.tsx - 이제 Index.tsx에서 모든 기능을 처리하므로 이 파일은 제거하거나
// 특별한 경우에만 사용하는 단순한 래퍼로 유지할 수 있습니다.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Index from "./Index";

const Canvas: React.FC = () => {
  const navigate = useNavigate();

  // Canvas 컴포넌트로 직접 접근한 경우 Index로 리다이렉트
  useEffect(() => {
    // 만약 특별한 라우팅 로직이 필요하지 않다면 Index 컴포넌트를 직접 사용
    // 또는 이 컴포넌트를 완전히 제거하고 라우터에서 Index를 직접 사용
  }, [navigate]);

  return <Index />;
};

export default Canvas;

// 또는 이 파일을 완전히 제거하고 라우터 설정에서 Index 컴포넌트를 직접 사용하는 것을 권장합니다.
