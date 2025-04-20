export default function SharedSection() {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <img
          src="/shared-placeholder.png"
          alt="No shared files"
          className="mx-auto mb-4 w-48 h-48 opacity-50"
        />
        <h2 className="text-xl font-medium text-gray-700 mb-2">
          공유된 파일이 없습니다
        </h2>
        <p className="text-gray-500">
          다른 사용자와 공유된 파일이 여기에 표시됩니다
        </p>
      </div>
    </div>
  );
}
