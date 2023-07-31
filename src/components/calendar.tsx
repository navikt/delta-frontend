import { format } from "date-fns";
import { nb } from "date-fns/locale";

type CalendarProps = { dateString: string, displayTime: boolean };

export default function Calendar({ dateString, displayTime }: CalendarProps) {
  const month = format(new Date(dateString), "MMM", { locale: nb })
    .substring(0, 3)
    .toUpperCase();
  const day = format(new Date(dateString), "d");

  const time = format(new Date(dateString), "HH:mm");


  return (
    <div className="flex flex-col w-fit rounded border border-border-default">
      <div className="bg-red-600 text-white flex justify-center">{month}</div>
      <div className="flex flex-col items-center">
        <div className="font-semibold text-3xl px-2">{day}</div>
        {displayTime &&
            <div className="border-t px-2">{time}</div>
        }
      </div>
    </div>
  );
}
