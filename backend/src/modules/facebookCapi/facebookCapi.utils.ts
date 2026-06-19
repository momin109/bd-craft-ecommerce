import crypto from "crypto";

export const generateMetaEventId = (prefix: string) => {
  const random = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${Date.now()}_${random}`;
};

export const sha256Hash = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
};

export const normalizePhoneForHash = (phone?: string) => {
  if (!phone) {
    return undefined;
  }

  return phone.replace(/\D/g, "");
};

export const getCookieValue = (
  cookieHeader: string | undefined,
  name: string,
) => {
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  const target = cookies.find((cookie) => {
    return cookie.startsWith(`${name}=`);
  });

  if (!target) {
    return undefined;
  }

  return decodeURIComponent(target.split("=")[1]);
};
