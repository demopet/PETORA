import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

type ViewMode = "day" | "week" | "month";

const statusColors: Record<AppointmentStatus, string> = {
  WAITING: "border-l-blue-500 bg-blue-50",
  IN_PROGRESS: "border-l-yellow-500 bg-yellow-50",
  DONE: "border-l-green-500 bg-green-50",
  CANCELLED: "border-l-gray-400 bg-gray-50",
};

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (_appointment: Appointment) => void;
}

export function AppointmentCalendar({
  appointments,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [viewMode, setViewMode] = React.useState<ViewMode>("week");

  const dayAppointments = React.useMemo(() => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.appointment_date), selectedDate),
    );
  }, [appointments, selectedDate]);

  const weekAppointments = React.useMemo(() => {
    const weekStart = startOfWeek(selectedDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        appointments: appointments.filter((apt) =>
          isSameDay(new Date(apt.appointment_date), date),
        ),
      };
    });
  }, [appointments, selectedDate]);

  const monthAppointments = React.useMemo(() => {
    const days = getDaysInMonth(selectedDate);
    return days.map((date) => ({
      date,
      appointments: appointments.filter((apt) =>
        isSameDay(new Date(apt.appointment_date), date),
      ),
    }));
  }, [appointments, selectedDate]);

  const handlePrev = () => {
    if (viewMode === "day") {
      setSelectedDate((d) => addDays(d, -1));
    } else if (viewMode === "week") {
      setSelectedDate((d) => addDays(d, -7));
    } else {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      setSelectedDate((d) => addDays(d, 1));
    } else if (viewMode === "week") {
      setSelectedDate((d) => addDays(d, 7));
    } else {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            &lt;
          </Button>
          <span className="text-sm font-medium text-slate-700">
            {viewMode === "day" && formatDateLong(selectedDate)}
            {viewMode === "week" &&
              `${formatDateShort(startOfWeek(selectedDate))} - ${formatDateShort(addDays(startOfWeek(selectedDate), 6))}`}
            {viewMode === "month" && formatMonthYear(selectedDate)}
          </span>
          <Button variant="outline" size="sm" onClick={handleNext}>
            &gt;
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {viewMode === "day" && (
        <DayView
          appointments={dayAppointments}
          onAppointmentClick={onAppointmentClick}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          days={weekAppointments}
          onAppointmentClick={onAppointmentClick}
        />
      )}
      {viewMode === "month" && (
        <MonthView
          days={monthAppointments}
          onAppointmentClick={onAppointmentClick}
          selectedDate={selectedDate}
        />
      )}
    </Card>
  );
}

function DayView({
  appointments,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  onAppointmentClick?: (_apt: Appointment) => void;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <div className="grid grid-cols-[80px_1fr] gap-2">
      <div className="space-y-4">
        {hours.map((hour) => (
          <div key={hour} className="text-right text-xs text-slate-500">
            {hour.toString().padStart(2, "0")}:00
          </div>
        ))}
      </div>
      <div className="space-y-4 border-l border-slate-200 pl-4">
        {hours.map((hour) => {
          const hourAppointments = appointments.filter((apt) => {
            const [h] = apt.appointment_time.split(":").map(Number);
            return h === hour;
          });

          return (
            <div key={hour} className="min-h-[60px]">
              {hourAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onAppointmentClick?.(apt)}
                  className={`mb-2 w-full rounded-lg border-l-4 p-3 text-left transition-colors hover:shadow-md ${statusColors[apt.status]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      #{apt.queue_number || "-"}
                    </span>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {apt.appointment_time}
                  </p>
                </button>
              ))}
            </div>
          );
        })}
        {appointments.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            No appointments for this day
          </div>
        )}
      </div>
    </div>
  );
}

function WeekView({
  days,
  onAppointmentClick,
}: {
  days: { date: Date; appointments: Appointment[] }[];
  onAppointmentClick?: (_apt: Appointment) => void;
}) {
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(({ date, appointments: dayApts }) => (
        <div
          key={date.toISOString()}
          className={`rounded-lg border border-slate-200 p-2 ${isSameDay(date, today) ? "bg-blue-50" : "bg-white"}`}
        >
          <div className="mb-2 text-center">
            <div className="text-xs text-slate-500">{formatDayShort(date)}</div>
            <div
              className={`text-lg font-semibold ${isSameDay(date, today) ? "text-primary-600" : "text-slate-900"}`}
            >
              {formatDayNumber(date)}
            </div>
          </div>
          <div className="space-y-1">
            {dayApts.map((apt) => (
              <button
                key={apt.id}
                onClick={() => onAppointmentClick?.(apt)}
                className={`w-full rounded-md border-l-4 p-2 text-left ${statusColors[apt.status]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900">
                    #{apt.queue_number || "-"}
                  </span>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {apt.appointment_time}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthView({
  days,
  onAppointmentClick,
  selectedDate,
}: {
  days: { date: Date; appointments: Appointment[] }[];
  onAppointmentClick?: (_apt: Appointment) => void;
  selectedDate: Date;
}) {
  const today = new Date();
  const weeks: { date: Date; appointments: Appointment[] }[][] = [];
  let currentWeek: { date: Date; appointments: Appointment[] }[] = [];

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(), appointments: [] });
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-slate-200">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div
          key={day}
          className="bg-white p-2 text-center text-xs font-medium text-slate-500"
        >
          {day}
        </div>
      ))}
      {weeks.flat().map(({ date, appointments: dayApts }) => (
        <div
          key={date.toISOString()}
          className={`min-h-[100px] bg-white p-2 ${isSameDay(date, today) ? "bg-blue-50" : ""} ${!isSameMonth(date, selectedDate) ? "opacity-50" : ""}`}
        >
          <div
            className={`mb-1 text-sm font-medium ${isSameDay(date, today) ? "text-primary-600" : "text-slate-700"}`}
          >
            {formatDayNumber(date)}
          </div>
          <div className="space-y-1">
            {dayApts.slice(0, 3).map((apt) => (
              <button
                key={apt.id}
                onClick={() => onAppointmentClick?.(apt)}
                className={`w-full rounded-md border-l-4 p-1 text-left ${statusColors[apt.status]}`}
              >
                <span className="block truncate text-xs font-medium text-slate-900">
                  #{apt.queue_number || "-"}{" "}
                  {formatTimeShort(apt.appointment_time)}
                </span>
              </button>
            ))}
            {dayApts.length > 3 && (
              <div className="text-xs text-slate-500">
                +{dayApts.length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1),
  );
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDayNumber(date: Date): string {
  return date.getDate().toString();
}

function formatTimeShort(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}
