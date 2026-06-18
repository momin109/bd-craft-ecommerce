import { IOrder } from "../order/order.interface.js";

export const NotificationTemplates = {
  orderPlaced: (order: IOrder) => {
    return {
      subject: `Order placed: ${order.orderNumber}`,
      message:
        `Dear ${order.shippingAddress.fullName},\n\n` +
        `Your order has been placed successfully.\n` +
        `Order Number: ${order.orderNumber}\n` +
        `Total: ৳${order.totalPayable}\n` +
        `Status: ${order.orderStatus}\n\n` +
        `Thank you for shopping with us.`,
    };
  },

  paymentSuccess: (order: IOrder) => {
    return {
      subject: `Payment successful: ${order.orderNumber}`,
      message:
        `Dear ${order.shippingAddress.fullName},\n\n` +
        `Your payment has been received successfully.\n` +
        `Order Number: ${order.orderNumber}\n` +
        `Paid Amount: ৳${order.totalPayable}\n` +
        `Transaction ID: ${order.transactionId || "N/A"}\n\n` +
        `We will process your order soon.`,
    };
  },

  paymentFailed: (order: IOrder) => {
    return {
      subject: `Payment failed: ${order.orderNumber}`,
      message:
        `Dear ${order.shippingAddress.fullName},\n\n` +
        `Your payment was not completed.\n` +
        `Order Number: ${order.orderNumber}\n\n` +
        `Please try again or contact support.`,
    };
  },

  courierBooked: (order: IOrder) => {
    return {
      subject: `Order shipped: ${order.orderNumber}`,
      message:
        `Dear ${order.shippingAddress.fullName},\n\n` +
        `Your order has been sent to courier.\n` +
        `Order Number: ${order.orderNumber}\n` +
        `Courier: ${order.courier.provider}\n` +
        `Tracking Code: ${order.courier.trackingCode || "N/A"}\n` +
        `Tracking URL: ${order.courier.trackingUrl || "N/A"}\n\n` +
        `Thank you.`,
    };
  },

  orderStatusUpdated: (order: IOrder) => {
    return {
      subject: `Order status updated: ${order.orderNumber}`,
      message:
        `Dear ${order.shippingAddress.fullName},\n\n` +
        `Your order status has been updated.\n` +
        `Order Number: ${order.orderNumber}\n` +
        `Current Status: ${order.orderStatus}\n\n` +
        `Thank you.`,
    };
  },
};
