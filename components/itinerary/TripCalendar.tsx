"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
// Custom calendar styles wrapper
import "./calendar-overrides.css"; 
// We will create the CSS overrides in a moment or inline them

import { ActivityModal } from "./ActivityModal";
import { Plus, Loader2 } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface Activity {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  location?: string;
  description?: string;
}

interface TripCalendarProps {
  itineraryId: string;
}

export function TripCalendar({ itineraryId }: TripCalendarProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [itineraryId]);

  const events = activities.map(act => {
    let start = parse(act.date, 'yyyy-MM-dd', new Date());
    let end = parse(act.date, 'yyyy-MM-dd', new Date());

    if (act.startTime) {
      const [hours, minutes] = act.startTime.split(':').map(Number);
      start.setHours(hours, minutes);
    }
    if (act.endTime) {
      const [hours, minutes] = act.endTime.split(':').map(Number);
      end.setHours(hours, minutes);
    } else if (act.startTime) {
      // Default 1 hour duration if only start time exists
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }

    return {
      id: act.id,
      title: act.title,
      start,
      end,
      resource: act,
    };
  });

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
    setModalOpen(true);
  };

  const getEventPropGetter = (event: any) => {
    const type = event.resource.type;
    let backgroundColor = "#6366f1"; // Indigo default
    
    switch(type) {
      case "flight": backgroundColor = "#0ea5e9"; break; // Sky
      case "hotel": backgroundColor = "#f59e0b"; break; // Amber
      case "sightseeing": backgroundColor = "#10b981"; break; // Emerald
      case "dining": backgroundColor = "#ec4899"; break; // Pink
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 6px',
        fontWeight: 500
      }
    };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Trip Calendar</h2>
        <button
          onClick={() => { setSelectedDate(new Date()); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </button>
      </div>

      <div className="h-[600px] w-full calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'agenda']}
          defaultView={Views.MONTH}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={getEventPropGetter}
          popup
          className="font-sans"
        />
      </div>

      <ActivityModal
        itineraryId={itineraryId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        onSave={fetchActivities}
      />
    </div>
  );
}
