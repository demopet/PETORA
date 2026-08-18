import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selected?: Date;
  onSelect?: (_date: Date | undefined) => void;
  disabled?: (_date: Date) => boolean;
  className?: string;
  mode?: "single" | "range";
  fromDate?: Date;
  toDate?: Date;
}

function Calendar({ selected, onSelect, disabled, className, fromDate, toDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const base = selected || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (disabled && disabled(date)) return true;
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;
    return false;
  };

  const days: Array<{ day: number; empty: boolean }> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: 0, empty: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ day, empty: false });
  }

  return (
    <div className={cn("w-72 rounded-lg border border-slate-200 bg-white p-3", className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md p-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-medium text-slate-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((item, index) => {
          if (item.empty) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const disabled = isDisabled(item.day);
          const selected = isSelected(item.day);
          const todayFlag = isToday(item.day);

          return (
            <button
              key={item.day}
              type="button"
              disabled={disabled}
              onClick={() =>
                onSelect?.(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), item.day))
              }
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                selected
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "text-slate-700 hover:bg-slate-100",
                disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                todayFlag && !selected && "border border-primary-500"
              )}
              aria-label={`${item.day} ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
