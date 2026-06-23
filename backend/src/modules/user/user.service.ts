import { QueryFilter } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { normalizeBangladeshiMobile } from "../auth/auth.utils.js";
import { Order } from "../order/order.model.js";

import { IUser } from "./user.interface.js";
import { User } from "./user.model.js";

type TUpdateProfilePayload = {
  name?: string;
  email?: string;
  avatar?: string;
  address?: {
    district?: string;
    city?: string;
    area?: string;
    addressLine?: string;
  };
};

type TCustomerQuery = {
  search?: string;
  status?: "ACTIVE" | "BLOCKED" | "DELETED";
  codAllowed?: "true" | "false";
  minSuccessRate?: string;
  maxSuccessRate?: string;
  page?: string;
  limit?: string;
};

const getSafeUserSelect = "-password";

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId).select(getSafeUserSelect);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: TUpdateProfilePayload,
) => {
  if (payload.email) {
    const existingEmail = await User.findOne({
      email: payload.email,
      _id: {
        $ne: userId,
      },
    });

    if (existingEmail) {
      throw new AppError(httpStatus.CONFLICT, "Email already used");
    }
  }

  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select(getSafeUserSelect);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const changePassword = async (
  userId: string,
  payload: {
    currentPassword: string;
    newPassword: string;
  },
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatched = await user.comparePassword(payload.currentPassword);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
  }

  user.password = payload.newPassword;
  await user.save();

  return {
    message: "Password changed successfully",
  };
};

const getAllCustomersForAdmin = async (query: TCustomerQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: QueryFilter<IUser> = {
    role: "CUSTOMER",
    status: {
      $ne: "DELETED",
    },
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.codAllowed === "true") {
    filter.codAllowed = true;
  }

  if (query.codAllowed === "false") {
    filter.codAllowed = false;
  }

  if (query.minSuccessRate || query.maxSuccessRate) {
    filter["orderStats.successRate"] = {};

    if (query.minSuccessRate) {
      filter["orderStats.successRate"].$gte = Number(query.minSuccessRate);
    }

    if (query.maxSuccessRate) {
      filter["orderStats.successRate"].$lte = Number(query.maxSuccessRate);
    }
  }

  if (query.search) {
    filter.$or = [
      {
        name: new RegExp(query.search, "i"),
      },
      {
        mobile: new RegExp(query.search, "i"),
      },
      {
        email: new RegExp(query.search, "i"),
      },
    ];
  }

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select(getSafeUserSelect)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: customers,
  };
};

const getCustomerDetailsForAdmin = async (customerId: string) => {
  const customer = await User.findOne({
    _id: customerId,
    role: "CUSTOMER",
  }).select(getSafeUserSelect);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  const [recentOrders, orderSummary, productSummary] = await Promise.all([
    Order.find({
      customer: customerId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .select(
        "orderNumber invoiceNumber orderStatus paymentStatus paymentMethod totalPayable courier createdAt",
      ),

    Order.aggregate([
      {
        $match: {
          customer: customer._id,
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
          totalAmount: {
            $sum: "$totalPayable",
          },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          customer: customer._id,
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
          totalSpent: {
            $sum: "$items.itemTotal",
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
    ]),
  ]);

  return {
    customer,
    summary: {
      orderSummary,
      topPurchasedProducts: productSummary,
    },
    recentOrders,
  };
};

const getCustomerOrdersForAdmin = async (
  customerId: string,
  query: {
    status?: string;
    page?: string;
    limit?: string;
  },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    customer: customerId,
  };

  if (query.status) {
    filter.orderStatus = query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: orders,
  };
};

const updateCustomerCodAccess = async (
  customerId: string,
  payload: {
    codAllowed: boolean;
    adminNote?: string;
  },
) => {
  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "CUSTOMER",
    },
    {
      codAllowed: payload.codAllowed,
      adminNote: payload.adminNote,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select(getSafeUserSelect);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return customer;
};

const updateCustomerStatus = async (
  customerId: string,
  payload: {
    status: "ACTIVE" | "BLOCKED";
    adminNote?: string;
  },
) => {
  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "CUSTOMER",
    },
    {
      status: payload.status,
      adminNote: payload.adminNote,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select(getSafeUserSelect);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return customer;
};

const updateCustomerNote = async (
  customerId: string,
  payload: {
    adminNote: string;
  },
) => {
  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "CUSTOMER",
    },
    {
      adminNote: payload.adminNote,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select(getSafeUserSelect);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return customer;
};

const updateCustomerByAdmin = async (
  customerId: string,
  payload: Partial<TUpdateProfilePayload> & {
    mobile?: string;
    adminNote?: string;
  },
) => {
  const updateData: Record<string, unknown> = {
    ...payload,
  };

  if (payload.mobile) {
    const mobile = normalizeBangladeshiMobile(payload.mobile);

    const existingMobile = await User.findOne({
      mobile,
      _id: {
        $ne: customerId,
      },
    });

    if (existingMobile) {
      throw new AppError(httpStatus.CONFLICT, "Mobile already used");
    }

    updateData.mobile = mobile;
  }

  if (payload.email) {
    const existingEmail = await User.findOne({
      email: payload.email,
      _id: {
        $ne: customerId,
      },
    });

    if (existingEmail) {
      throw new AppError(httpStatus.CONFLICT, "Email already used");
    }
  }

  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "CUSTOMER",
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).select(getSafeUserSelect);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return customer;
};

const softDeleteCustomer = async (customerId: string) => {
  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "CUSTOMER",
    },
    {
      status: "DELETED",
    },
    {
      new: true,
    },
  ).select(getSafeUserSelect);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return customer;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getAllCustomersForAdmin,
  getCustomerDetailsForAdmin,
  getCustomerOrdersForAdmin,
  updateCustomerCodAccess,
  updateCustomerStatus,
  updateCustomerNote,
  updateCustomerByAdmin,
  softDeleteCustomer,
};
