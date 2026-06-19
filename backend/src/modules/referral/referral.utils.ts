export const generateReferralCode = (name?: string) => {
  const prefix = String(name || "USER")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}${random}`;
};

export const generateReferralRewardCouponCode = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REF${random}`;
};
