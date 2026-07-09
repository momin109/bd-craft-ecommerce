"use client";

import { useEffect, useState } from "react";

type Props = {
  endDate: string;
};

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();

  if (diff <= 0) {
    return {
      expired: true,
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    expired: false,
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function CountdownTimer({ endDate }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return <span className="text-xs font-semibold text-red-600">Expired</span>;
  }

  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <span className="px-2 py-1 rounded-lg bg-gray-900 text-white">
        {timeLeft.hours}
      </span>
      <span>:</span>
      <span className="px-2 py-1 rounded-lg bg-gray-900 text-white">
        {timeLeft.minutes}
      </span>
      <span>:</span>
      <span className="px-2 py-1 rounded-lg bg-gray-900 text-white">
        {timeLeft.seconds}
      </span>
    </div>
  );
}
