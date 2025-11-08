import { Col, Layout, Row } from "antd";
import React, { useEffect, useState } from "react";

import type { Employee } from "../api";
import EmployeeFilters from "../components/EmployeeFilters";
import EmployeeHeader from "../components/EmployeeHeader";
import EmployeeModal from "../components/EmployeeModal";
import EmployeeTable from "../components/EmployeeTable";

const { Content } = Layout;

const EmployeeDashboard: React.FC = () => {
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<
    string | undefined
  >();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showArchived, setShowArchived] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter(undefined);
    setStatusFilter(undefined);
    setDateRange(undefined);
    setShowArchived(false);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "24px",
      }}>
      {/* === Header === */}
      <EmployeeHeader
        isOpenAddModal={isOpenAddModal}
        setIsOpenAddModal={setIsOpenAddModal}
      />

      {/* === Main Content === */}
      <Content style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <EmployeeFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onReset={handleResetFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showArchived={showArchived}
              onShowArchivedChange={setShowArchived}
            />
          </Col>

          <Col span={24}>
            <EmployeeTable
              onEdit={(emp) => {
                setSelectedEmployee(emp);
                setIsOpenAddModal(true);
              }}
              onRefresh={triggerRefresh}
              refreshKey={refreshKey}
              searchTerm={debouncedSearchTerm}
              departmentFilter={departmentFilter}
              statusFilter={statusFilter}
              dateRange={dateRange}
              showArchived={showArchived}
              viewMode={viewMode}
            />
          </Col>
        </Row>
      </Content>

      {/* === Modal === */}
      <EmployeeModal
        isOpenAddModal={isOpenAddModal}
        setIsOpenAddModal={(v) => {
          if (!v) setSelectedEmployee(null);
          setIsOpenAddModal(v);
        }}
        selectedEmployee={selectedEmployee}
        onSaved={(opts?: { keepOpen?: boolean; employee?: Employee }) => {
          // opts?: { keepOpen?: boolean; employee?: Employee }
          triggerRefresh();
          if (!opts || !opts.keepOpen) {
            setIsOpenAddModal(false);
            setSelectedEmployee(null);
          } else if (opts.employee) {
            // keep drawer open and switch to editing the returned employee
            setSelectedEmployee(opts.employee);
            setIsOpenAddModal(true);
          }
        }}
      />
    </Layout>
  );
};

export default EmployeeDashboard;
