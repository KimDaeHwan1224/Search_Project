// src/pages/admin/AdminRefreshPage.jsx
import React from "react";

function AdminRefreshPage() {
  return (
    <div>
      <h1>🔄 뉴스/감성 분석 수동 갱신</h1>
      <button>뉴스 수집 실행</button>
      <button style={{ marginLeft: 8 }}>감성 분석 실행</button>
    </div>
  );
}

export default AdminRefreshPage;
