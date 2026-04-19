import React, { useState, useEffect } from 'react';
import { getDoctorProfile, getDoctorAppointments, updateAppointmentStatus } from '../services/api';
import Sidebar from '../components/Sidebar';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    approved: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    cancelled: { bg: '#fee2e2', color: '#7f1d1d', dot: '#ef4444' },
    completed: { bg: '#dbeafe', color: '#1e3a5f', dot: '#3b82f6' },
  };
  const s = styles[status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

const Toast = ({ msg }) => msg ? (
  <div className="fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-medium text-sm animate-fadeInUp"
    style={{ background: msg.includes('❌') ? '#7f1d1d' : '#064e3b', border: `1px solid ${msg.includes('❌') ? '#dc2626' : '#10b981'}` }}>
    {msg}
  </div>
) : null;

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    try {
      const prof = await getDoctorProfile(user.id);
      if (prof?.doc_id) {
        setProfile(prof);
        const appts = await getDoctorAppointments(prof.doc_id);
        setAppointments(Array.isArray(appts) ? appts : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleStatus = async (app_id, status) => {
    const res = await updateAppointmentStatus({ app_id, status });
    if (res.success) { showToast(`✅ Appointment ${status}!`); init(); }
    else showToast('❌ ' + res.message);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const filtered = filterStatus === 'all' ? appointments : appointments.filter(a => a.status === filterStatus);

  const statCards = [
    { label: 'Total', value: counts.all, gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', icon: '📋' },
    { label: 'Pending', value: counts.pending, gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', icon: '⏳' },
    { label: 'Approved', value: counts.approved, gradient: 'linear-gradient(135deg,#059669,#10b981)', icon: '✅' },
    { label: 'Completed', value: counts.completed, gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)', icon: '🏁' },
  ];

  return (
    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}>
      <Toast msg={toast} />

      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">Doctor Portal</p>
            <h1 className="text-3xl font-display font-black text-slate-900">Dr. {user?.full_name}</h1>
            <p className="text-blue-600 font-semibold mt-0.5">{profile?.specialization || 'Loading profile...'}</p>
          </div>
          <button onClick={init}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition border border-blue-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={s.label} className={`rounded-2xl p-5 text-white shadow-lg animate-fadeInUp stagger-${i + 1} relative overflow-hidden`}
              style={{ background: s.gradient }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-3xl">{s.icon}</span>
              <p className="text-4xl font-display font-black mt-2">{s.value}</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Profile + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-display font-black text-3xl shadow-lg mb-4"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}>
              {user?.full_name?.charAt(0)}
            </div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Dr. {user?.full_name}</h3>
            <p className="text-blue-600 text-sm font-semibold">{profile?.specialization}</p>
            <div className="mt-4 w-full space-y-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              {[
                { label: 'Doctor ID', value: `#${profile?.doc_id || '—'}` },
                { label: 'Consult Fee', value: profile?.fees ? `₹${profile.fees}` : '—' },
                { label: 'Timing', value: profile?.timing || '—' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                  <span className="text-xs font-bold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5"
              style={{ background: '#d1fae5' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Currently Active
            </div>
          </div>

          {/* Appointments Table */}
          <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="font-display font-bold text-slate-900">Appointments</h2>
                <p className="text-slate-400 text-xs">{filtered.length} records</p>
              </div>
              {/* Filter Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'pending', 'approved', 'completed'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${filterStatus === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {s} {s !== 'all' && <span className="opacity-70">({counts[s]})</span>}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                <p className="text-slate-400 text-sm">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#f8faff' }}>
                      {['#', 'Patient', 'Date', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => (
                      <tr key={a.app_id} className="table-row animate-fadeInUp" style={{ borderTop: '1px solid #f8faff', animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                        <td className="px-5 py-3.5 text-xs text-slate-400">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-700 font-display font-bold text-sm"
                              style={{ background: '#d1fae5' }}>
                              {a.patient_name?.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">{a.patient_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-600">{formatDate(a.appointment_date)}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3.5">
                          {a.status === 'pending' ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleStatus(a.app_id, 'approved')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                                ✓ Approve
                              </button>
                              <button onClick={() => handleStatus(a.app_id, 'cancelled')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                                ✕ Cancel
                              </button>
                            </div>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan="5" className="py-16 text-center">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="text-slate-400 text-sm">No appointments found.</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default DoctorDashboard;