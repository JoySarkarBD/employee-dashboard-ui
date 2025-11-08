import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import {
  Button,
  Card,
  Col,
  Empty,
  notification,
  Popconfirm,
  Progress,
  Row,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import type { Employee } from "../api";
import { api as apiService } from "../api";

interface Props {
  onEdit: (emp: Employee) => void;
  onRefresh: () => void;
  refreshKey?: number;
  searchTerm?: string;
  departmentFilter?: string;
  statusFilter?: string;
  dateRange?: [string, string];
  showArchived?: boolean;
  viewMode?: "table" | "card";
}

const EmployeeTable: React.FC<Props> = ({
  onEdit,
  onRefresh,
  refreshKey,
  searchTerm = "",
  departmentFilter,
  statusFilter,
  dateRange,
  showArchived = false,
  viewMode = "table",
}) => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  // Sort state with localStorage persistence
  const [sortInfo, setSortInfo] = useState<{
    columnKey?: string;
    order?: "ascend" | "descend";
  }>(() => {
    const saved = localStorage.getItem("employeeTableSort");
    return saved ? JSON.parse(saved) : {};
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const handleTableChange: TableProps<Employee>["onChange"] = (
    paginationInfo,
    filters,
    sorter
  ) => {
    const newSortInfo = {
      columnKey: (sorter as any)?.columnKey,
      order: (sorter as any)?.order,
    };
    setSortInfo(newSortInfo);
    localStorage.setItem("employeeTableSort", JSON.stringify(newSortInfo));
    setPagination({
      ...pagination,
      current: paginationInfo.current || 1,
      pageSize: paginationInfo.pageSize || 5,
    });
  };

  // Render employee card
  const renderEmployeeCard = (employee: Employee) => (
    <Col xs={24} sm={12} md={8} lg={6} key={employee.id}>
      <Card
        title={employee.name}
        extra={
          <Space>
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => onEdit(employee)}
            />
            <Popconfirm
              title='Archive employee?'
              onConfirm={() => handleDelete(employee.id)}>
              <Button type='text' danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        }
        style={{ marginBottom: 16 }}>
        <p>
          <strong>Department:</strong> {employee.department}
        </p>
        <p>
          <strong>Role:</strong> {employee.role}
        </p>
        <p>
          <strong>Joining Date:</strong> {employee.joiningDate}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <Tag
            color={
              employee.status === "Active"
                ? "green"
                : employee.status === "On Leave"
                ? "orange"
                : employee.status === "Archived"
                ? "default"
                : employee.status === "Inactive"
                ? "gray"
                : "red"
            }>
            {employee.status}
          </Tag>
        </p>
        <p>
          <strong>Performance Score:</strong>
        </p>
        <Progress
          percent={employee.performanceScore}
          size='small'
          status={
            employee.performanceScore >= 80
              ? "success"
              : employee.performanceScore >= 60
              ? "normal"
              : "exception"
          }
        />
      </Card>
    </Col>
  );

  // Filter data based on search term and filters
  const filteredData = data.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      employee.name.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower) ||
      employee.role.toLowerCase().includes(searchLower) ||
      employee.status.toLowerCase().includes(searchLower);
    const matchesDepartment =
      !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    const matchesDateRange =
      !dateRange ||
      (new Date(employee.joiningDate) >= new Date(dateRange[0]) &&
        new Date(employee.joiningDate) <= new Date(dateRange[1]));
    const matchesArchiveFilter = showArchived
      ? employee.status === "Archived"
      : employee.status !== "Archived";

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus &&
      matchesDateRange &&
      matchesArchiveFilter
    );
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService
      .getEmployees()
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((err) => {
        notificationApi.error({
          message: "Failed to Load Employees",
          description: `Unable to fetch employee data: ${String(err)}`,
          duration: 4,
          placement: "topRight",
        });
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [refreshKey, notificationApi]);
  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      // mark as Archived instead of deleting
      const emp = data.find((d) => d.id === id);
      if (!emp) throw new Error("Employee not found");
      const payload: Employee = { ...emp, status: "Archived" };
      await apiService.updateEmployee(id, payload);
      notificationApi.success({
        message: "Employee Archived",
        description: "The employee has been moved to Archived.",
        duration: 4,
        placement: "topRight",
      });
      onRefresh();
    } catch (err) {
      notificationApi.error({
        message: "Archive Failed",
        description: `Unable to archive employee: ${String(err)}`,
        duration: 4,
        placement: "topRight",
      });
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
      defaultSortOrder:
        sortInfo.columnKey === "name" ? sortInfo.order : undefined,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      sorter: (a: Employee, b: Employee) =>
        a.department.localeCompare(b.department),
      defaultSortOrder:
        sortInfo.columnKey === "department" ? sortInfo.order : undefined,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      sorter: (a: Employee, b: Employee) => a.role.localeCompare(b.role),
      defaultSortOrder:
        sortInfo.columnKey === "role" ? sortInfo.order : undefined,
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      key: "joiningDate",
      sorter: (a: Employee, b: Employee) =>
        new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime(),
      defaultSortOrder:
        sortInfo.columnKey === "joiningDate" ? sortInfo.order : undefined,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a: Employee, b: Employee) => a.status.localeCompare(b.status),
      render: (status: Employee["status"]) => {
        const color =
          status === "Active"
            ? "green"
            : status === "On Leave"
            ? "orange"
            : status === "Archived"
            ? "default"
            : status === "Inactive"
            ? "gray"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
      defaultSortOrder:
        sortInfo.columnKey === "status" ? sortInfo.order : undefined,
    },
    {
      title: "Performance Score",
      dataIndex: "performanceScore",
      key: "performanceScore",
      sorter: (a: Employee, b: Employee) =>
        a.performanceScore - b.performanceScore,
      render: (score: number) => (
        <Progress
          percent={score}
          size='small'
          status={
            score >= 80 ? "success" : score >= 60 ? "normal" : "exception"
          }
          format={(percent) => `${percent}%`}
        />
      ),
      defaultSortOrder:
        sortInfo.columnKey === "performanceScore" ? sortInfo.order : undefined,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Employee) => (
        <Space>
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={() => {
              onEdit(record);
            }}
          />
          <Popconfirm
            title='Archive employee?'
            onConfirm={() => handleDelete(record.id)}>
            <Button type='text' danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      {viewMode === "table" ? (
        <Table<Employee>
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            ...pagination,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          bordered
          rowKey={(r) => String(r.id)}
          onChange={handleTableChange}
          sortDirections={["ascend", "descend", "ascend"]}
          locale={{
            emptyText: (
              <Empty
                description='No employees match your filters'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.length > 0 ? (
            filteredData.map(renderEmployeeCard)
          ) : (
            <Col span={24}>
              <Empty
                description='No employees match your filters'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Col>
          )}
        </Row>
      )}
    </>
  );
};

export default EmployeeTable;
