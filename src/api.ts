export interface Employee {
  id?: number;
  name: string;
  department: string;
  role: string;
  joiningDate: string; // YYYY-MM-DD
  status: "Active" | "On Leave" | "Resigned" | "Archived" | "Inactive";
  performanceScore: number; // 1-100
}

const BASE = "http://localhost:3000";
const EMP = `${BASE}/employees`;

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  async getEmployees() {
    const res = await fetch(EMP);
    return handleResponse(res);
  },

  async getEmployee(id: number) {
    const res = await fetch(`${EMP}/${id}`);
    return handleResponse(res);
  },

  async addEmployee(payload: Employee) {
    const res = await fetch(EMP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateEmployee(id: number, payload: Employee) {
    const res = await fetch(`${EMP}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteEmployee(id: number) {
    const res = await fetch(`${EMP}/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
};
