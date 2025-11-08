import React from "react";
import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface EmployeeHeaderProps {
  isOpenAddModal: boolean;
  setIsOpenAddModal: (v: boolean) => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ isOpenAddModal, setIsOpenAddModal, }) => {
  console.log('isOpenModal', isOpenAddModal)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 16,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Title level={3} style={{ margin: 0 }}>
        Employee Management
      </Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsOpenAddModal(true)}
      >
        Add Employee
      </Button>
    </div>
  );
};

export default EmployeeHeader;
