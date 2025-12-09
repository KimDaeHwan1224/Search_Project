// src/components/admin/AdminSidebar.jsx
import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

const Sidebar = styled.aside`
  width: 220px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #2b65f6;
  padding: 0 20px 20px 20px;
`;

const MenuItem = styled(NavLink)`
  padding: 10px 20px;
  margin: 0 12px;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  text-decoration: none;

  &.active {
    background: #e8efff;
    color: #2b65f6;
    font-weight: 600;
  }

  &:hover {
    background: #f0f4ff;
    color: #2b65f6;
  }
`;

function AdminSidebar() {
  return (
    <Sidebar>
      <Title>관리자 메뉴</Title>
      <MenuItem to="/admin/dashboard">📊 대시보드</MenuItem>
      <MenuItem to="/admin/users">👤 회원 관리</MenuItem>
      <MenuItem to="/admin/roles">🔑 권한 관리</MenuItem>
      <MenuItem to="/admin/refresh">🔄 데이터 갱신</MenuItem>
      <MenuItem to="/admin/logs">📜 활동 로그</MenuItem>
    </Sidebar>
  );
}

export default AdminSidebar;
