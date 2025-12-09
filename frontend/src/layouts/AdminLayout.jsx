// src/layouts/AdminLayout.jsx
import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const Layout = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PageContent = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

function AdminLayout() {
  return (
    <Layout>
      <AdminSidebar />
      <ContentArea>
        <AdminHeader />
        <PageContent>
          <Outlet />  {/* ⭐ 자식 라우트를 여기서 렌더링 */}
        </PageContent>
      </ContentArea>
    </Layout>
  );
}

export default AdminLayout;
