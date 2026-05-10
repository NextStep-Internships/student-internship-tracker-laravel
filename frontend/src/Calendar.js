import { useEffect, useState } from "react";
import api from "./services/api";
import Sidebar from "./Sidebar";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", type: "GENERAL" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/deadlines")

      .then((res) => setEvents(res.data.events || []))
      .catch(() => {
        // fallback: use report dates as events
        api.get("/rapports").then((res) => {
          const reports = res.data.rapports || res.data || [];
          setEvents(reports.map((r) => ({
            id: r.id,
            title: r.titre || `Report #${r.id}`,
            date: r.created_at?.split("T")[0] || r.date,
            type: "REPORT",
            description: `Status: ${r.statut}`,
          })));
        }).catch(() => {});
      });
  }, []);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date?.startsWith(dateStr));
  };

  const handleDayClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setForm({ title: "", description: "", type: "GENERAL" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    try {
      const res = await api.post("/deadlines", { ...form, date: selectedDate });
      setEvents((prev) => [...prev, res.data.event]);
      setShowModal(false);
    } catch {
      // Simulate adding locally if backend not ready
      setEvents((prev) => [...prev, { id: Date.now(), ...form, date: selectedDate }]);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await api.delete(`/deadlines/${eventId}`);
    } catch {}
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const typeColor = (type) => {
    switch (type) {
      case "REPORT": return "#2563eb";
      case "DEADLINE": return "#dc2626";
      case "MEETING": return "#7c3aed";
      default: return "#16a34a";
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const upcomingEvents = events
    .filter((e) => e.date >= today.toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="pro-dashboard">
      <Sidebar activePage="calendar" />
      <div className="pro-main-wrapper">
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">Calendar</h1>
            <p className="pro-page-sub">Track your internship schedule and deadlines</p>
          </div>
          <div className="pro-topbar-right">
            <button className="pro-topbar-btn"><i className="bi bi-bell"></i></button>
            <button className="pro-topbar-btn"><i className="bi bi-gear"></i></button>
            <div className="pro-topbar-avatar">
              {JSON.parse(localStorage.getItem("user") || "{}").nom?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <main className="pro-content">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px" }}>
            {/* Calendar */}
            <section className="pro-card">
              <div className="pro-card-header">
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={prevMonth}><i className="bi bi-chevron-left"></i></button>
                  <h3 style={{ margin: 0 }}>{MONTHS[currentMonth]} {currentYear}</h3>
                  <button className="cal-nav-btn" onClick={nextMonth}><i className="bi bi-chevron-right"></i></button>
                </div>
              </div>
              <div className="pro-card-body">
                <div className="cal-grid-header">
                  {DAYS.map((d) => <div key={d} className="cal-day-label">{d}</div>)}
                </div>
                <div className="cal-grid">
                  {cells.map((day, idx) => {
                    const isToday = day && day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                    const dayEvents = day ? getEventsForDate(day) : [];
                    return (
                      <div
                        key={idx}
                        className={`cal-cell ${day ? "cal-cell-active" : ""} ${isToday ? "cal-cell-today" : ""}`}
                        onClick={() => day && handleDayClick(day)}
                      >
                        {day && <span className="cal-cell-num">{day}</span>}
                        {dayEvents.slice(0, 2).map((e) => (
                          <div key={e.id} className="cal-event-dot" style={{ background: typeColor(e.type) }} title={e.title}></div>
                        ))}
                        {dayEvents.length > 2 && <span className="cal-more">+{dayEvents.length - 2}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="pro-card">
              <div className="pro-card-header">
                <h3><i className="bi bi-calendar-event-fill"></i> Upcoming</h3>
              </div>
              <div className="pro-card-body" style={{ padding: 0 }}>
                {upcomingEvents.length === 0 ? (
                  <div className="pro-reports-empty" style={{ padding: "32px 16px" }}>
                    <i className="bi bi-calendar-x"></i>
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="cal-upcoming-list">
                    {upcomingEvents.map((e) => (
                      <div key={e.id} className="cal-upcoming-item">
                        <div className="cal-upcoming-dot" style={{ background: typeColor(e.type) }}></div>
                        <div className="cal-upcoming-info">
                          <span className="cal-upcoming-title">{e.title}</span>
                          <span className="cal-upcoming-date">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                        <button className="cal-del-btn" onClick={() => handleDelete(e.id)}><i className="bi bi-x"></i></button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ padding: "16px" }}>
                  <button className="pro-action-btn pro-action-primary" style={{ width: "100%" }} onClick={() => { setSelectedDate(today.toISOString().split("T")[0]); setForm({ title: "", description: "", type: "GENERAL" }); setShowModal(true); }}>
                    <i className="bi bi-plus-circle"></i>
                    <div className="pro-action-text">
                      <span className="pro-action-title">Add Event</span>
                    </div>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Event — {selectedDate}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            {error && <div className="doc-alert doc-alert-error" style={{ margin: "0 0 12px" }}><i className="bi bi-exclamation-circle-fill"></i>{error}</div>}
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="GENERAL">General</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="MEETING">Meeting</option>
                  <option value="REPORT">Report</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cal-nav { display: flex; align-items: center; gap: 16px; }
        .cal-nav-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
          background: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all 0.15s;
        }
        .cal-nav-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
        .cal-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
        .cal-day-label { text-align: center; font-size: 12px; font-weight: 600; color: var(--muted); padding: 8px 0; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .cal-cell {
          min-height: 72px; border-radius: 10px; padding: 6px; cursor: default;
          border: 1px solid transparent; transition: all 0.15s;
          display: flex; flex-direction: column; gap: 2px;
        }
        .cal-cell-active { cursor: pointer; }
        .cal-cell-active:hover { background: var(--primary-soft); border-color: var(--primary); }
        .cal-cell-today { background: var(--primary-soft); border-color: var(--primary); }
        .cal-cell-today .cal-cell-num { background: var(--primary); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
        .cal-cell-num { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .cal-event-dot { height: 6px; border-radius: 999px; width: 100%; }
        .cal-more { font-size: 10px; color: var(--muted); }
        .cal-upcoming-list { display: flex; flex-direction: column; }
        .cal-upcoming-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-bottom: 1px solid var(--border);
        }
        .cal-upcoming-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .cal-upcoming-info { flex: 1; }
        .cal-upcoming-title { display: block; font-size: 13px; font-weight: 600; color: var(--dark); }
        .cal-upcoming-date { font-size: 12px; color: var(--muted); }
        .cal-del-btn { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 14px; padding: 4px; border-radius: 4px; }
        .cal-del-btn:hover { color: #dc2626; background: #fef2f2; }
        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-box {
          background: white; border-radius: 20px; width: 460px; max-width: 95vw;
          box-shadow: var(--premium-shadow);
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .modal-header h3 { margin: 0; font-size: 17px; }
        .modal-close { background: none; border: none; cursor: pointer; font-size: 18px; color: var(--muted); }
        .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 13px; font-weight: 600; color: var(--dark); }
        .form-input {
          padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px;
          font-size: 14px; font-family: inherit; outline: none; transition: border 0.15s;
          background: var(--light-bg);
        }
        .form-input:focus { border-color: var(--primary); background: white; }
        .modal-btn-cancel {
          padding: 10px 20px; border-radius: 10px; border: 1.5px solid var(--border);
          background: white; cursor: pointer; font-size: 14px; font-weight: 600;
        }
        .modal-btn-save {
          padding: 10px 20px; border-radius: 10px; border: none;
          background: var(--primary); color: white; cursor: pointer; font-size: 14px; font-weight: 600;
        }
        .modal-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .doc-alert { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
        .doc-alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
      `}</style>
    </div>
  );
}

export default Calendar;