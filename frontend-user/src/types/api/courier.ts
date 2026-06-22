export type CourierProvider = "STEADFAST" | "PATHAO";
export type ShipmentStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "CANCELLED";

export interface BookCourierPayload {
  provider: CourierProvider;
  itemWeight?: number;
  itemDescription?: string;
  specialInstruction?: string;
}

export interface ApiShipment {
  _id?: string;
  id?: string;
  orderId: string;
  provider: CourierProvider;
  consignmentId?: string;
  trackingCode?: string;
  status: ShipmentStatus;
  createdAt: string;
}
