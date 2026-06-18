type TDateQuery = {
  fromDate?: string;
  toDate?: string;
};

export type TGroupBy = "day" | "week" | "month";

export const getDateRange = (query: TDateQuery) => {
  const now = new Date();

  const fromDate = query.fromDate
    ? new Date(query.fromDate)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

  const toDate = query.toDate ? new Date(query.toDate) : now;

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return {
    fromDate,
    toDate,
  };
};

export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

export const getCurrentMonthRange = () => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

export const getGroupExpression = (groupBy: TGroupBy) => {
  if (groupBy === "month") {
    return {
      year: {
        $year: "$createdAt",
      },
      month: {
        $month: "$createdAt",
      },
    };
  }

  if (groupBy === "week") {
    return {
      year: {
        $isoWeekYear: "$createdAt",
      },
      week: {
        $isoWeek: "$createdAt",
      },
    };
  }

  return {
    year: {
      $year: "$createdAt",
    },
    month: {
      $month: "$createdAt",
    },
    day: {
      $dayOfMonth: "$createdAt",
    },
  };
};

export const formatCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).replace(/"/g, '""');

  return `"${stringValue}"`;
};

export const convertToCsv = (
  rows: Record<string, unknown>[],
  headers: string[],
) => {
  const csvHeaders = headers.map(formatCsvValue).join(",");

  const csvRows = rows.map((row) => {
    return headers
      .map((header) => {
        return formatCsvValue(row[header]);
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};
