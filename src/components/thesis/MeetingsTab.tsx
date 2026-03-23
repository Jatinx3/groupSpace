"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, X, Check, FileText, Video, Loader2, AlertCircle, CalendarDays, RefreshCw, User } from "lucide-react";
import { createClientSupabase } from "../../lib/supabase-client";

export type MeetingStatus = 'pending' | 'accepted' | 'rejected' | 'rescheduled';

export interface Meeting {
  id: string;
  thesis_id: string;
  requester_id: string;
  professor_id: string;
  meeting_date: string;
  meeting_time: string;
  agenda: string;
  message: string | null;
  status: MeetingStatus;
  proposed_date: string | null;
  proposed_time: string | null;
  meeting_link?: string | null;
  created_at: string;
  professor?: { first_name: string; last_name: string } | null;
  requester?: { first_name: string; last_name: string } | null;
}

interface Props {
  role: "student" | "professor";
  thesisId: string;
  meetings: Meeting[];
  professorId?: string; // Required for student to request meeting
  participantName: string;
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  switch (status) {
    case 'accepted':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><Check className="w-3 h-3" /> Accepted</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"><X className="w-3 h-3" /> Rejected</span>;
    case 'rescheduled':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"><RefreshCw className="w-3 h-3" /> Rescheduled</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"><Clock className="w-3 h-3" /> Pending</span>;
  }
}

export default function MeetingsTab({ role, thesisId, meetings, professorId, participantName }: Props) {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [agenda, setAgenda] = useState("");
  const [message, setMessage] = useState("");

  // Propose Time State
  const [proposeModalId, setProposeModalId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Accept with Link State
  const [acceptModalId, setAcceptModalId] = useState<string | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState("");

  const handleRequestSubmission = async () => {
    if (!date || !time || !agenda.trim() || !professorId) return;
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await supabase.from("thesis_meetings").insert({
        thesis_id: thesisId,
        requester_id: userData.user.id,
        professor_id: professorId,
        meeting_date: date,
        meeting_time: time,
        agenda: agenda.trim(),
        message: message.trim() || null,
        status: 'pending'
      });
      setShowRequestModal(false);
      setAgenda("");
      setMessage("");
      setDate("");
      setTime("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: MeetingStatus) => {
    setActioningId(id);
    try {
      await supabase.from("thesis_meetings").update({ status }).eq("id", id);
      router.refresh();
    } finally {
      setActioningId(null);
    }
  };

  const handleProposeTime = async () => {
    if (!proposeModalId || !newDate || !newTime) return;
    setSubmitting(true);
    try {
      await supabase.from("thesis_meetings").update({
        status: 'rescheduled',
        proposed_date: newDate,
        proposed_time: newTime
      }).eq("id", proposeModalId);
      setProposeModalId(null);
      setNewDate("");
      setNewTime("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptWithLink = async () => {
    if (!acceptModalId) return;
    setSubmitting(true);
    try {
      await supabase.from("thesis_meetings").update({
        status: 'accepted',
        meeting_link: meetingLinkInput.trim() || null
      }).eq("id", acceptModalId);
      setAcceptModalId(null);
      setMeetingLinkInput("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  // Sort: Upcoming (Accepted) first, then pending, then others. Within limits sort by date inline.
  const upcoming = meetings.filter(m => m.status === 'accepted' || m.status === 'rescheduled');
  const pastOrOther = meetings.filter(m => m.status === 'pending' || m.status === 'rejected');

  const isReceiver = (m: Meeting) => (role === "student" && m.requester_id === professorId) || (role === "professor" && m.requester_id !== professorId);

  const containerClass = "bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm dark:hover:shadow-none transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
            Meetings
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {role === "student" ? "Request a quick sync with your supervisor." : "Manage meeting requests from your student."}
          </p>
        </div>
        {professorId && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm dark:shadow-none shrink-0"
          >
            <CalendarDays className="w-4 h-4" />
            Request Meeting
          </button>
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest pl-1">
            Upcoming Meetings
          </h3>
          <div className="space-y-4">
            {upcoming.map(meeting => (
              <div key={meeting.id} className={containerClass}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <StatusBadge status={meeting.status} />
                      {meeting.status === 'rescheduled' && (
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(meeting.meeting_date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })} at {meeting.meeting_time}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-zinc-200">
                      {meeting.agenda}
                    </h3>
                    {meeting.message && (
                      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 italic">
                        "{meeting.message}"
                      </p>
                    )}
                    {meeting.status === 'rescheduled' && meeting.proposed_date && (
                      <div className="mt-3 inline-block bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-400">
                        <strong>New Proposed Time:</strong> {new Date(meeting.proposed_date).toLocaleDateString()} at {meeting.proposed_time}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      With {participantName}
                    </p>
                    {meeting.meeting_link && (
                      <div className="mt-3">
                        <a 
                          href={meeting.meeting_link.startsWith('http') ? meeting.meeting_link : `https://${meeting.meeting_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs font-semibold shadow-sm transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {isReceiver(meeting) && meeting.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setAcceptModalId(meeting.id)}
                        disabled={actioningId === meeting.id}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProposeModalId(meeting.id)}
                        disabled={actioningId === meeting.id}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-zinc-300 transition text-xs font-semibold"
                      >
                        Propose Diff Time
                      </button>
                      <button
                        onClick={() => updateStatus(meeting.id, "rejected")}
                        disabled={actioningId === meeting.id}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {!isReceiver(meeting) && meeting.status === "rescheduled" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setAcceptModalId(meeting.id)}
                        disabled={actioningId === meeting.id}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition text-xs font-semibold"
                      >
                        Accept New Time
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pastOrOther.length > 0 && <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest pl-1 mt-6">Requests</h3>}
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">No meetings scheduled.</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              {role === "student" ? "Go ahead and request some time." : "No requests received yet."}
            </p>
          </div>
        ) : (
          pastOrOther.map(meeting => (
            <div key={meeting.id} className={containerClass}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <StatusBadge status={meeting.status} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(meeting.meeting_date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })} at {meeting.meeting_time}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-zinc-200">
                    {meeting.agenda}
                  </h3>
                  {meeting.message && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 italic">
                      "{meeting.message}"
                    </p>
                  )}
                  {meeting.status === 'rescheduled' && meeting.proposed_date && (
                    <div className="mt-3 inline-block bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-400">
                      <strong>New Proposed Time:</strong> {new Date(meeting.proposed_date).toLocaleDateString()} at {meeting.proposed_time}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    With {participantName}
                  </p>
                  {meeting.meeting_link && (
                    <div className="mt-3">
                      <a 
                        href={meeting.meeting_link.startsWith('http') ? meeting.meeting_link : `https://${meeting.meeting_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs font-semibold shadow-sm transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>

                {isReceiver(meeting) && meeting.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setAcceptModalId(meeting.id)}
                      disabled={actioningId === meeting.id}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProposeModalId(meeting.id)}
                      disabled={actioningId === meeting.id}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-zinc-300 transition text-xs font-semibold"
                    >
                      Propose Diff Time
                    </button>
                    <button
                      onClick={() => updateStatus(meeting.id, "rejected")}
                      disabled={actioningId === meeting.id}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {!isReceiver(meeting) && meeting.status === "rescheduled" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setAcceptModalId(meeting.id)}
                      disabled={actioningId === meeting.id}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition text-xs font-semibold"
                    >
                      Accept New Time
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setShowRequestModal(false)} />
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl w-full max-w-md relative z-10 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Request a Meeting</h3>
              <button 
                onClick={() => setShowRequestModal(false)} 
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Agenda</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 Draft Review"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Note (Optional)</label>
                <textarea
                  placeholder="Any specific questions?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSubmission}
                disabled={!date || !time || !agenda.trim() || submitting}
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Propose Time Modal */}
      {proposeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setProposeModalId(null)} />
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl w-full max-w-sm relative z-10 shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Propose New Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setProposeModalId(null)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProposeTime}
                disabled={!newDate || !newTime || submitting}
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Propose
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Accept with Link Modal */}
      {acceptModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setAcceptModalId(null)} />
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl w-full max-w-sm relative z-10 shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Accept Meeting</h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1.5">Meeting Link (Optional)</label>
              <input
                type="text"
                placeholder="Google Meet or Teams link"
                value={meetingLinkInput}
                onChange={(e) => setMeetingLinkInput(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setAcceptModalId(null)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptWithLink}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
