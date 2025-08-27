import { Store, Employee } from "@/types/cash";

export const STORES: Store[] = [
  {
    id: "los-heroes",
    name: "Los Héroes",
    address: "C.C. Los Heroes, Local #9 San Salvador",
    phone: "2260-5555",
    schedule: "09:00 AM - 08:00 PM"
  },
  {
    id: "plaza-merliot",
    name: "Plaza Merliot", 
    address: "C.C. Plaza Merliot local #108 primer nivel",
    phone: "2278-9999",
    schedule: "09:00 AM - 05:55 PM"
  }
];

export const EMPLOYEES: Employee[] = [
  // Los Héroes
  {
    id: "tito-gomez",
    name: "Tito Gomez",
    role: "Lider de Sucursal",
    stores: ["los-heroes"]
  },
  {
    id: "adonay-torres",
    name: "Adonay Torres", 
    role: "Asistente de Sucursal",
    stores: ["los-heroes"]
  },
  // Plaza Merliot
  {
    id: "irvin-abarca",
    name: "Irvin Abarca",
    role: "Lider de Sucursal", 
    stores: ["plaza-merliot"]
  },
  {
    id: "edenilson-lopez",
    name: "Edenilson López",
    role: "Asistente de Sucursal",
    stores: ["plaza-merliot"]
  },
  // Itinerant (works at both stores)
  {
    id: "jonathan-melara",
    name: "Jonathan Melara",
    role: "Asistente Itinerante",
    stores: ["los-heroes", "plaza-merliot"]
  }
];

export const getEmployeesByStore = (storeId: string): Employee[] => {
  return EMPLOYEES.filter(employee => employee.stores.includes(storeId));
};

export const getStoreById = (storeId: string): Store | undefined => {
  return STORES.find(store => store.id === storeId);
};

export const getEmployeeById = (employeeId: string): Employee | undefined => {
  return EMPLOYEES.find(employee => employee.id === employeeId);
};