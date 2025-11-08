import {
  AppstoreOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Tooltip,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface EmployeeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentFilter?: string;
  onDepartmentChange: (value: string | undefined) => void;
  statusFilter?: string;
  onStatusChange: (value: string | undefined) => void;
  dateRange?: [string, string];
  onDateRangeChange: (dates: [string, string] | undefined) => void;
  onReset: () => void;
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
  showArchived?: boolean;
  onShowArchivedChange?: (v: boolean) => void;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onReset,
  viewMode,
  onViewModeChange,
  showArchived = false,
  onShowArchivedChange,
}) => {
  // Use antd Form instance to manage reset behavior and controlled fields
  const [form] = Form.useForm();

  // sync incoming props into the form when they change
  React.useEffect(() => {
    form.setFieldsValue({
      search: searchTerm || undefined,
      department: departmentFilter || undefined,
      status: statusFilter || undefined,
      dateRange: dateRange
        ? ([dayjs(dateRange[0]), dayjs(dateRange[1])] as Dayjs[])
        : undefined,
      showArchived,
    });
  }, [
    searchTerm,
    departmentFilter,
    statusFilter,
    dateRange,
    showArchived,
    form,
  ]);

  const handleFormValuesChange = (
    _: Record<string, unknown>,
    all: Record<string, unknown>
  ) => {
    if (Object.prototype.hasOwnProperty.call(all, "search")) {
      onSearchChange((all.search as string) || "");
    }
    if (Object.prototype.hasOwnProperty.call(all, "department")) {
      onDepartmentChange((all.department as string) || undefined);
    }
    if (Object.prototype.hasOwnProperty.call(all, "status")) {
      onStatusChange((all.status as string) || undefined);
    }
    if (Object.prototype.hasOwnProperty.call(all, "dateRange")) {
      const dr = all.dateRange as Dayjs[] | undefined;
      if (dr && dr[0] && dr[1]) {
        onDateRangeChange([
          dr[0].format("YYYY-MM-DD"),
          dr[1].format("YYYY-MM-DD"),
        ]);
      } else {
        onDateRangeChange(undefined);
      }
    }
    if (
      Object.prototype.hasOwnProperty.call(all, "showArchived") &&
      onShowArchivedChange
    ) {
      onShowArchivedChange(Boolean(all.showArchived));
    }
  };

  return (
    <Form
      form={form}
      layout='inline'
      style={{ marginBottom: 16, width: "100%" }}
      onValuesChange={handleFormValuesChange}
      initialValues={{
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter,
        showArchived,
      }}>
      <Row style={{ width: "100%" }} gutter={12} align='middle'>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name='search' label='Search' style={{ marginBottom: 0 }}>
            <Input
              placeholder='Search employees...'
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>

        <Col xs={12} sm={6} md={5} lg={4}>
          <Form.Item
            name='department'
            label='Department'
            style={{ marginBottom: 0 }}>
            <Select
              placeholder='All'
              allowClear
              suffixIcon={<FilterOutlined />}>
              <Option value='Engineering'>Engineering</Option>
              <Option value='HR'>HR</Option>
              <Option value='Finance'>Finance</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={12} sm={6} md={5} lg={4}>
          <Form.Item name='status' label='Status' style={{ marginBottom: 0 }}>
            <Select
              placeholder='All'
              allowClear
              suffixIcon={<FilterOutlined />}>
              <Option value='Active'>Active</Option>
              <Option value='On Leave'>On Leave</Option>
              <Option value='Resigned'>Resigned</Option>
              <Option value='Inactive'>Inactive</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item
            name='dateRange'
            label='Joining Date'
            style={{ marginBottom: 0 }}>
            <RangePicker
              style={{ width: "100%" }}
              placeholder={["Start date", "End date"]}
            />
          </Form.Item>
        </Col>

        <Col xs={12} sm={6} md={3} lg={2}>
          <Form.Item
            name='showArchived'
            label='Archived'
            valuePropName='checked'
            style={{ marginBottom: 0 }}>
            <Switch checkedChildren='Archived' unCheckedChildren='Active' />
          </Form.Item>
        </Col>

        <Col xs={12} sm={6} md={3} lg={2} style={{ display: "flex", gap: 8 }}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Tooltip
              title={
                viewMode === "table"
                  ? "Switch to Card View"
                  : "Switch to Table View"
              }>
              <Button
                icon={
                  viewMode === "table" ? (
                    <AppstoreOutlined />
                  ) : (
                    <TableOutlined />
                  )
                }
                onClick={() =>
                  onViewModeChange(viewMode === "table" ? "card" : "table")
                }
              />
            </Tooltip>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default EmployeeFilters;
