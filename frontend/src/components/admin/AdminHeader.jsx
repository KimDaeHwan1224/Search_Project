// src/components/admin/AdminHeader.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Header = styled.header`
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Profile = styled.div`
  position: relative;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 32px;
  right: 0;
  width: 150px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  button {
    width: 100%;
    background: white;
    border: none;
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background: #f5f5f5;
    }

    &.logout {
      color: #dc3545;
    }
  }
`;

function AdminHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const name = user?.fullName || user?.email || "관리자";

  const handleLogout = () => {
    localStorage.clear();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <Header>
      <Profile onClick={() => setOpen((prev) => !prev)}>
        {name} 님 ▼
        {open && (
          <Dropdown>
            <button onClick={() => navigate("/admin/dashboard")}>
              관리자 홈
            </button>
            <button className="logout" onClick={handleLogout}>
              로그아웃
            </button>
          </Dropdown>
        )}
      </Profile>
    </Header>
  );
}

export default AdminHeader;
