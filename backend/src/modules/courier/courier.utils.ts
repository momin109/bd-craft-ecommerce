import { TNormalizedDeliveryStatus } from "./courier.interface.js";

export const normalizeCourierStatus = (
  statusText?: string,
): TNormalizedDeliveryStatus => {
  const status = String(statusText || "").toLowerCase();

  if (!status) return "UNKNOWN";

  if (
    status.includes("delivered") ||
    status.includes("complete") ||
    status.includes("completed")
  ) {
    return "DELIVERED";
  }

  if (status.includes("partial") || status.includes("partial delivered")) {
    return "PARTIAL_DELIVERED";
  }

  if (
    status.includes("return") ||
    status.includes("returned") ||
    status.includes("rto")
  ) {
    return "RETURNED";
  }

  if (status.includes("cancel") || status.includes("cancelled")) {
    return "CANCELLED";
  }

  if (status.includes("pickup") || status.includes("picked")) {
    return "PICKED_UP";
  }

  if (
    status.includes("transit") ||
    status.includes("processing") ||
    status.includes("on the way") ||
    status.includes("assigned")
  ) {
    return "IN_TRANSIT";
  }

  if (status.includes("pending") || status.includes("created")) {
    return "PENDING";
  }

  return "UNKNOWN";
};
