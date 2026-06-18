export const generateOrderNumber = (): string => {
  const date = new Date();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `ORD-${yyyy}${mm}${dd}-${random}`;
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `INV-${yyyy}${mm}${dd}-${random}`;
};
