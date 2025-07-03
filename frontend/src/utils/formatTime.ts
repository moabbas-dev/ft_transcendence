import { formatInTimeZone } from "date-fns-tz";

export const formatTimestamp = (timestamp: string) => {
  const isoString = timestamp.replace(' ', 'T') + 'Z';
console.log(isoString);

  return formatInTimeZone(
    new Date(isoString),
    'Asia/Beirut',
    'yyyy-MM-dd HH:mm:ss'
  );
};
