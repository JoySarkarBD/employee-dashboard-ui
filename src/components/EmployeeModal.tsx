import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  notification,
  Select,
  Space,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import type { Employee } from "../api";
import { api as apiService } from "../api";

const { Option } = Select;

interface Props {
  isOpenAddModal: boolean;
  setIsOpenAddModal: (v: boolean) => void;
  selectedEmployee?: Employee | null;
  onSaved?: (opts?: { keepOpen?: boolean; employee?: Employee }) => void;
}

const EmployeeModal: React.FC<Props> = ({
  isOpenAddModal,
  setIsOpenAddModal,
  selectedEmployee = null,
  onSaved,
}) => {
  const [form] = Form.useForm();
  const [notificationApi, contextHolder] = notification.useNotification();

  // populate form when selectedEmployee changes
  React.useEffect(() => {
    if (selectedEmployee) {
      form.setFieldsValue({
        ...selectedEmployee,
        joiningDate: selectedEmployee.joiningDate
          ? dayjs(selectedEmployee.joiningDate)
          : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [selectedEmployee, form]);

  const doSave = async (values: Record<string, unknown>, keepOpen = false) => {
    const v = values as Record<string, unknown>;
    const joiningDateVal = v.joiningDate as
      | { format?: (fmt: string) => string }
      | undefined;
    let formattedDate = "";
    if (joiningDateVal && typeof joiningDateVal.format === "function") {
      formattedDate = joiningDateVal.format("YYYY-MM-DD");
    }

    const payload: Employee = {
      name: String(v.name ?? ""),
      department: String(v.department ?? ""),
      role: String(v.role ?? ""),
      joiningDate: formattedDate,
      status: String(v.status ?? "") as Employee["status"],
      performanceScore: Number(v.performanceScore ?? 50),
    };

    try {
      let result = null;
      if (selectedEmployee && selectedEmployee.id) {
        result = await apiService.updateEmployee(selectedEmployee.id, payload);
        notificationApi.success({
          message: "Employee Updated",
          description: `${payload.name} has been successfully updated.`,
          duration: 4,
          placement: "topRight",
        });
      } else {
        result = await apiService.addEmployee(payload);
        notificationApi.success({
          message: "Employee Added",
          description: `${payload.name} has been successfully added.`,
          duration: 4,
          placement: "topRight",
        });
      }
      if (onSaved) onSaved({ keepOpen, employee: result });
      if (!keepOpen) setIsOpenAddModal(false);
      // if keepOpen, populate form with returned employee (useful for new creates)
      if (keepOpen && result) {
        form.setFieldsValue({
          ...result,
          joiningDate: result.joiningDate
            ? dayjs(result.joiningDate)
            : undefined,
        });
      }
    } catch (err) {
      notificationApi.error({
        message: "Operation Failed",
        description: `Failed to ${
          selectedEmployee ? "update" : "add"
        } employee: ${String(err)}`,
        duration: 4,
        placement: "topRight",
      });
    }
  };

  const handleSaveContinue = async () => {
    const vals = await form.validateFields();
    await doSave(vals, true);
  };

  return (
    <>
      {contextHolder}
      <Drawer
        onClose={() => setIsOpenAddModal(false)}
        title={selectedEmployee ? "Edit Employee" : "Add Employee"}
        open={isOpenAddModal}
        width={640}>
        <Form form={form} layout='vertical'>
          <Form.Item
            label='Name'
            name='name'
            rules={[
              { required: true, message: "Please enter employee name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}>
            <Input placeholder='Enter employee name' />
          </Form.Item>
          <Form.Item
            label='Department'
            name='department'
            rules={[{ required: true, message: "Please select department" }]}>
            <Select placeholder='Select department'>
              <Option value='Engineering'>Engineering</Option>
              <Option value='HR'>HR</Option>
              <Option value='Finance'>Finance</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='Role'
            name='role'
            rules={[
              { required: true, message: "Please enter employee role" },
              { min: 2, message: "Role must be at least 2 characters" },
            ]}>
            <Input placeholder='Enter employee role' />
          </Form.Item>
          <Form.Item
            label='Joining Date'
            name='joiningDate'
            rules={[
              { required: true, message: "Please select joining date" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const selectedDate = dayjs(value);
                  const today = dayjs();
                  if (selectedDate.isAfter(today)) {
                    return Promise.reject(
                      new Error("Joining date cannot be in the future")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label='Status'
            name='status'
            rules={[{ required: true, message: "Please select status" }]}>
            <Select placeholder='Select status'>
              <Option value='Active'>Active</Option>
              <Option value='On Leave'>On Leave</Option>
              <Option value='Resigned'>Resigned</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='Performance Score (1-100)'
            name='performanceScore'
            rules={[
              { required: true, message: "Please enter performance score" },
              {
                type: "number",
                min: 1,
                max: 100,
                message: "Score must be between 1 and 100",
              },
            ]}>
            <InputNumber
              min={1}
              max={100}
              placeholder='Enter performance score'
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Space
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => setIsOpenAddModal(false)}>Cancel</Button>
              <Button type='primary' onClick={handleSaveContinue}>
                Save & Continue
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default EmployeeModal;
