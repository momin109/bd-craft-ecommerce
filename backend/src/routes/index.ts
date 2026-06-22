import { Router } from "express";
import { healthRoutes } from "./health.route.js";
import { authRoutes } from "../modules/auth/auth.route.js";
import { categoryRoutes } from "../modules/category/category.route.js";
import { productRoutes } from "../modules/product/product.route.js";
import { cartRoutes } from "../modules/cart/cart.route.js";
import { wishlistRoutes } from "../modules/wishlist/wishlist.route.js";
import { orderRoutes } from "../modules/order/order.route.js";
import { paymentRoutes } from "../modules/payment/payment.route.js";
import { courierRoutes } from "../modules/courier/courier.route.js";
import { notificationRoutes } from "../modules/notification/notification.route.js";

import { couponRoutes } from "../modules/coupon/coupon.route.js";
import { offerRoutes } from "../modules/offer/offer.route.js";
import { reviewRoutes } from "../modules/review/review.route.js";
import { reportRoutes } from "../modules/report/report.route.js";
import { userRoutes } from "../modules/user/user.route.js";

import { abandonedCartRoutes } from "../modules/abandonedCart/abandonedCart.route.js";
import { referralRoutes } from "../modules/referral/referral.route.js";
import { facebookCapiRoutes } from "../modules/facebookCapi/facebookCapi.route.js";
import { invoiceRoutes } from "../modules/invoice/invoice.route.js";

import { aiRoutes } from "../modules/ai/ai.route.js";
import { uploadRoutes } from "../modules/upload/upload.route.js";
import { inventoryRoutes } from "../modules/inventory/inventory.route.js";
import { returnRoutes } from "../modules/return/return.route.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/couriers", courierRoutes);
router.use("/notifications", notificationRoutes);
router.use("/coupons", couponRoutes);
router.use("/offers", offerRoutes);
router.use("/reviews", reviewRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);

router.use("/abandoned-carts", abandonedCartRoutes);
router.use("/referrals", referralRoutes);
router.use("/facebook-capi", facebookCapiRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/ai", aiRoutes);
router.use("/uploads", uploadRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/returns", returnRoutes);

export const apiRoutes = router;

// import { Router } from "express";
// import { healthRoutes } from "./health.route.js";
// import { authRoutes } from "../modules/auth/auth.route.js";
// import { categoryRoutes } from "../modules/category/category.route.js";
// import { productRoutes } from "../modules/product/product.route.js";

// const router = Router();

// router.use("/health", healthRoutes);
// router.use("/auth", authRoutes);
// router.use("/categories", categoryRoutes);
// router.use("/products", productRoutes);

// export const apiRoutes = router;
