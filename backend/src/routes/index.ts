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
