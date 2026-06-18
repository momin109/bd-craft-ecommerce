import { FilterQuery } from "mongoose";

import { Order } from "../order/order.model.js";
import { IOrder } from "../order/order.interface.js";

import {
  convertToCsv,
  getCurrentMonthRange,
  getDateRange,
  getGroupExpression,
  getTodayRange,
  TGroupBy,
} from "./report.utils.js";

type TReportQuery = {
  fromDate?: string;
  toDate?: string;
  groupBy?: TGroupBy;
  status?: string;
  paymentMethod?: string;
  provider?: string;
  page?: string;
  limit?: string;
};

const getDashboardSummary = async () => {
  const today = getTodayRange();
  const currentMonth = getCurrentMonthRange();

  const [
    todaySales,
    monthlySales,
    pendingOrders,
    deliveredOrders,
    returnedOrders,
    topProducts,
    topCustomers,
    revenueGraph,
  ] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today.start,
            $lte: today.end,
          },
          orderStatus: {
            $ne: "CANCELLED",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: {
            $sum: 1,
          },
          totalSales: {
            $sum: "$totalPayable",
          },
          totalProfit: {
            $sum: "$totalProfit",
          },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: currentMonth.start,
            $lte: currentMonth.end,
          },
          orderStatus: {
            $ne: "CANCELLED",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: {
            $sum: 1,
          },
          totalSales: {
            $sum: "$totalPayable",
          },
          totalProfit: {
            $sum: "$totalProfit",
          },
        },
      },
    ]),

    Order.countDocuments({
      orderStatus: "PENDING",
    }),

    Order.countDocuments({
      orderStatus: "DELIVERED",
    }),

    Order.countDocuments({
      orderStatus: "RETURNED",
    }),

    Order.aggregate([
      {
        $match: {
          orderStatus: "DELIVERED",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          productName: {
            $first: "$items.name",
          },
          totalQuantity: {
            $sum: "$items.quantity",
          },
          totalSales: {
            $sum: "$items.itemTotal",
          },
          totalProfit: {
            $sum: "$items.profit",
          },
        },
      },
      {
        $sort: {
          totalQuantity: -1,
          totalSales: -1,
        },
      },
      {
        $limit: 5,
      },
    ]),

    Order.aggregate([
      {
        $match: {
          orderStatus: "DELIVERED",
        },
      },
      {
        $group: {
          _id: "$customer",
          totalOrders: {
            $sum: 1,
          },
          totalSpent: {
            $sum: "$totalPayable",
          },
        },
      },
      {
        $sort: {
          totalSpent: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          customerId: "$_id",
          name: "$customer.name",
          mobile: "$customer.mobile",
          totalOrders: 1,
          totalSpent: 1,
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate() - 30,
            ),
          },
          orderStatus: "DELIVERED",
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
          },
          totalSales: {
            $sum: "$totalPayable",
          },
          totalProfit: {
            $sum: "$totalProfit",
          },
          totalOrders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]),
  ]);

  return {
    todaySales: todaySales[0] || {
      totalOrders: 0,
      totalSales: 0,
      totalProfit: 0,
    },

    monthlySales: monthlySales[0] || {
      totalOrders: 0,
      totalSales: 0,
      totalProfit: 0,
    },

    orderCounts: {
      pendingOrders,
      deliveredOrders,
      returnedOrders,
    },

    topProducts,
    topCustomers,
    revenueGraph,
  };
};

const buildBaseOrderFilter = (query: TReportQuery) => {
  const { fromDate, toDate } = getDateRange(query);

  const filter: FilterQuery<IOrder> = {
    createdAt: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  if (query.status) {
    filter.orderStatus = query.status;
  }

  if (query.paymentMethod) {
    filter.paymentMethod = query.paymentMethod;
  }

  if (query.provider) {
    filter["courier.provider"] = query.provider;
  }

  return filter;
};

const getSalesReport = async (query: TReportQuery) => {
  const groupBy = query.groupBy || "day";
  const filter = buildBaseOrderFilter(query);

  const result = await Order.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: getGroupExpression(groupBy),
        totalOrders: {
          $sum: 1,
        },
        subtotal: {
          $sum: "$subtotal",
        },
        shippingCharge: {
          $sum: "$shippingCharge",
        },
        totalDiscount: {
          $sum: "$discount",
        },
        couponDiscount: {
          $sum: "$couponDiscount",
        },
        offerDiscount: {
          $sum: "$offerDiscount",
        },
        totalSales: {
          $sum: "$totalPayable",
        },
        totalProfit: {
          $sum: "$totalProfit",
        },
        deliveredOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "DELIVERED"],
              },
              1,
              0,
            ],
          },
        },
        returnedOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "RETURNED"],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.week": 1,
        "_id.day": 1,
      },
    },
  ]);

  return result;
};

const getProductWiseSalesReport = async (query: TReportQuery) => {
  const filter = buildBaseOrderFilter({
    ...query,
    status: query.status || "DELIVERED",
  });

  const result = await Order.aggregate([
    {
      $match: filter,
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: {
          product: "$items.product",
          sku: "$items.sku",
        },
        productName: {
          $first: "$items.name",
        },
        sku: {
          $first: "$items.sku",
        },
        size: {
          $first: "$items.size",
        },
        color: {
          $first: "$items.color",
        },
        totalQuantity: {
          $sum: "$items.quantity",
        },
        totalSales: {
          $sum: "$items.itemTotal",
        },
        totalPurchaseCost: {
          $sum: {
            $multiply: ["$items.purchasePrice", "$items.quantity"],
          },
        },
        totalProfit: {
          $sum: "$items.profit",
        },
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
  ]);

  return result;
};

const getCustomerWiseSalesReport = async (query: TReportQuery) => {
  const filter = buildBaseOrderFilter(query);

  const result = await Order.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: "$customer",
        totalOrders: {
          $sum: 1,
        },
        deliveredOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "DELIVERED"],
              },
              1,
              0,
            ],
          },
        },
        returnedOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "RETURNED"],
              },
              1,
              0,
            ],
          },
        },
        totalSpent: {
          $sum: "$totalPayable",
        },
        totalProfit: {
          $sum: "$totalProfit",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $project: {
        customerId: "$_id",
        name: "$customer.name",
        mobile: "$customer.mobile",
        email: "$customer.email",
        orderStats: "$customer.orderStats",
        codAllowed: "$customer.codAllowed",
        totalOrders: 1,
        deliveredOrders: 1,
        returnedOrders: 1,
        totalSpent: 1,
        totalProfit: 1,
      },
    },
    {
      $sort: {
        totalSpent: -1,
      },
    },
  ]);

  return result;
};

const getCourierWiseReport = async (query: TReportQuery) => {
  const filter = buildBaseOrderFilter(query);

  const result = await Order.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: "$courier.provider",
        totalOrders: {
          $sum: 1,
        },
        deliveredOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "DELIVERED"],
              },
              1,
              0,
            ],
          },
        },
        returnedOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "RETURNED"],
              },
              1,
              0,
            ],
          },
        },
        cancelledOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$orderStatus", "CANCELLED"],
              },
              1,
              0,
            ],
          },
        },
        totalSales: {
          $sum: "$totalPayable",
        },
        totalProfit: {
          $sum: "$totalProfit",
        },
      },
    },
    {
      $project: {
        provider: "$_id",
        totalOrders: 1,
        deliveredOrders: 1,
        returnedOrders: 1,
        cancelledOrders: 1,
        totalSales: 1,
        totalProfit: 1,
        deliverySuccessRate: {
          $cond: [
            {
              $eq: ["$totalOrders", 0],
            },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$deliveredOrders", "$totalOrders"],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
      },
    },
    {
      $sort: {
        totalOrders: -1,
      },
    },
  ]);

  return result;
};

const getReturnReport = async (query: TReportQuery) => {
  const filter = buildBaseOrderFilter({
    ...query,
    status: "RETURNED",
  });

  const result = await Order.find(filter)
    .populate("customer", "name mobile email orderStats codAllowed")
    .sort({
      createdAt: -1,
    })
    .select(
      "orderNumber invoiceNumber customer totalPayable totalProfit courier orderStatus statusLogs createdAt",
    );

  return result;
};

const getProfitReport = async (query: TReportQuery) => {
  const filter = buildBaseOrderFilter(query);

  const result = await Order.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,
        totalOrders: {
          $sum: 1,
        },
        subtotal: {
          $sum: "$subtotal",
        },
        shippingCharge: {
          $sum: "$shippingCharge",
        },
        totalDiscount: {
          $sum: "$discount",
        },
        couponDiscount: {
          $sum: "$couponDiscount",
        },
        offerDiscount: {
          $sum: "$offerDiscount",
        },
        totalRevenue: {
          $sum: "$totalPayable",
        },
        totalPurchaseCost: {
          $sum: "$totalPurchaseCost",
        },
        totalProfit: {
          $sum: "$totalProfit",
        },
      },
    },
    {
      $project: {
        totalOrders: 1,
        subtotal: 1,
        shippingCharge: 1,
        totalDiscount: 1,
        couponDiscount: 1,
        offerDiscount: 1,
        totalRevenue: 1,
        totalPurchaseCost: 1,
        totalProfit: 1,
        profitMargin: {
          $cond: [
            {
              $eq: ["$totalRevenue", 0],
            },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$totalProfit", "$totalRevenue"],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalOrders: 0,
      subtotal: 0,
      shippingCharge: 0,
      totalDiscount: 0,
      couponDiscount: 0,
      offerDiscount: 0,
      totalRevenue: 0,
      totalPurchaseCost: 0,
      totalProfit: 0,
      profitMargin: 0,
    }
  );
};

const exportReportToCsv = async (
  type: "sales" | "products" | "customers" | "couriers" | "profit",
  query: TReportQuery,
) => {
  let rows: Record<string, unknown>[] = [];
  let headers: string[] = [];

  if (type === "sales") {
    rows = await getSalesReport(query);
    rows = rows.map((row: any) => ({
      period: JSON.stringify(row._id),
      totalOrders: row.totalOrders,
      subtotal: row.subtotal,
      shippingCharge: row.shippingCharge,
      totalDiscount: row.totalDiscount,
      couponDiscount: row.couponDiscount,
      offerDiscount: row.offerDiscount,
      totalSales: row.totalSales,
      totalProfit: row.totalProfit,
      deliveredOrders: row.deliveredOrders,
      returnedOrders: row.returnedOrders,
    }));

    headers = [
      "period",
      "totalOrders",
      "subtotal",
      "shippingCharge",
      "totalDiscount",
      "couponDiscount",
      "offerDiscount",
      "totalSales",
      "totalProfit",
      "deliveredOrders",
      "returnedOrders",
    ];
  }

  if (type === "products") {
    rows = await getProductWiseSalesReport(query);
    rows = rows.map((row: any) => ({
      productName: row.productName,
      sku: row.sku,
      size: row.size,
      color: row.color,
      totalQuantity: row.totalQuantity,
      totalSales: row.totalSales,
      totalPurchaseCost: row.totalPurchaseCost,
      totalProfit: row.totalProfit,
    }));

    headers = [
      "productName",
      "sku",
      "size",
      "color",
      "totalQuantity",
      "totalSales",
      "totalPurchaseCost",
      "totalProfit",
    ];
  }

  if (type === "customers") {
    rows = await getCustomerWiseSalesReport(query);
    rows = rows.map((row: any) => ({
      name: row.name,
      mobile: row.mobile,
      email: row.email,
      totalOrders: row.totalOrders,
      deliveredOrders: row.deliveredOrders,
      returnedOrders: row.returnedOrders,
      totalSpent: row.totalSpent,
      totalProfit: row.totalProfit,
      codAllowed: row.codAllowed,
    }));

    headers = [
      "name",
      "mobile",
      "email",
      "totalOrders",
      "deliveredOrders",
      "returnedOrders",
      "totalSpent",
      "totalProfit",
      "codAllowed",
    ];
  }

  if (type === "couriers") {
    rows = await getCourierWiseReport(query);
    rows = rows.map((row: any) => ({
      provider: row.provider,
      totalOrders: row.totalOrders,
      deliveredOrders: row.deliveredOrders,
      returnedOrders: row.returnedOrders,
      cancelledOrders: row.cancelledOrders,
      deliverySuccessRate: row.deliverySuccessRate,
      totalSales: row.totalSales,
      totalProfit: row.totalProfit,
    }));

    headers = [
      "provider",
      "totalOrders",
      "deliveredOrders",
      "returnedOrders",
      "cancelledOrders",
      "deliverySuccessRate",
      "totalSales",
      "totalProfit",
    ];
  }

  if (type === "profit") {
    const profit = await getProfitReport(query);

    rows = [profit as Record<string, unknown>];

    headers = [
      "totalOrders",
      "subtotal",
      "shippingCharge",
      "totalDiscount",
      "couponDiscount",
      "offerDiscount",
      "totalRevenue",
      "totalPurchaseCost",
      "totalProfit",
      "profitMargin",
    ];
  }

  return convertToCsv(rows, headers);
};

export const ReportService = {
  getDashboardSummary,
  getSalesReport,
  getProductWiseSalesReport,
  getCustomerWiseSalesReport,
  getCourierWiseReport,
  getReturnReport,
  getProfitReport,
  exportReportToCsv,
};
