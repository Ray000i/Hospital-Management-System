import React, { useState, useEffect } from 'react';
import { getDoctors, bookAppointment, getPatientAppointments } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
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

const DoctorsList = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [toast, setToast] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [docs, appts] = await Promise.all([getDoctors(), getPatientAppointments(user.id)]);
    setDoctors(Array.isArray(docs) ? docs : []);
    setMyAppointments(Array.isArray(appts) ? appts : []);
    setLoading(false);
  };

  const showToast = (text, type = 'success') => { setToast({ text, type }); setTimeout(() => setToast({ text: '', type: '' }), 3000); };

  const handleConfirmBooking = async (date) => {
    const res = await bookAppointment({ patient_id: user.id, doctor_id: selectedDoctor.doc_id, appointment_date: date });
    if (res.success) {
      showToast('✅ Appointment booked successfully!');
      setSelectedDoctor(null);
      loadData();
    } else showToast('❌ ' + (res.message || 'Booking failed'), 'error');
  };

  const specializations = ['all', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const filteredDoctors = doctors.filter(d => {
    const matchSearch = d.doc_name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = filterSpec === 'all' || d.specialization === filterSpec;
    return matchSearch && matchSpec;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Toast */}
      {toast.text && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-medium text-sm animate-fadeInUp`}
          style={{ background: toast.type === 'error' ? '#7f1d1d' : '#064e3b', border: `1px solid ${toast.type === 'error' ? '#dc2626' : '#10b981'}` }}>
          {toast.text}
        </div>
      )}

      {selectedDoctor && (
        <BookingModal doctor={selectedDoctor} onConfirm={handleConfirmBooking} onClose={() => setSelectedDoctor(null)} />
      )}

      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <p className="text-sm text-slate-500 mb-1">Patient Portal</p>
        <h1 className="text-3xl font-display font-black text-slate-900">Hello, {user?.full_name} 👋</h1>
        <p className="text-slate-500 mt-1">Find specialists and manage your appointments</p>
      </div>

      <div className="px-8 pb-8 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Available Doctors', value: doctors.length, gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', icon: '👨‍⚕️' },
            { label: 'My Appointments', value: myAppointments.length, gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)', icon: '📅' },
            { label: 'Pending', value: myAppointments.filter(a => a.status === 'pending').length, gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', icon: '⏳' },
          ].map((s, i) => (
            <div key={s.label} className={`rounded-2xl p-5 text-white shadow-md animate-fadeInUp stagger-${i + 1} relative overflow-hidden`}
              style={{ background: s.gradient }}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-2xl">{s.icon}</span>
              <p className="text-3xl font-display font-black mt-2">{s.value}</p>
              <p className="text-white/70 text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1.5 rounded-2xl w-fit" style={{ background: '#e8edf5' }}>
          {[{ id: 'doctors', label: '🔍 Find Doctors' }, { id: 'bookings', label: `📋 My Bookings (${myAppointments.length})` }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold font-display transition-all ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Find Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Search + Filters */}
            <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search by name or specialization..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="input-field pl-11 text-sm" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {specializations.slice(0, 5).map(s => (
                  <button key={s} onClick={() => setFilterSpec(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterSpec === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {s === 'all' ? '🏥 All' : s}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-slate-500 text-sm font-medium">{filteredDoctors.length} specialist(s) found</p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <p className="text-slate-400 text-sm">Loading doctors...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredDoctors.map((doc, i) => (
                  <div key={doc.doc_id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                    <DoctorCard doctor={doc} onBook={(id) => setSelectedDoctor(doctors.find(d => d.doc_id === id))} />
                  </div>
                ))}
                {filteredDoctors.length === 0 && (
                  <div className="col-span-3 text-center py-20">
                    <p className="text-5xl mb-3">🔍</p>
                    <p className="text-slate-400 font-medium">No doctors match your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="glass-card rounded-2xl overflow-hidden animate-fadeIn">
            <div className="p-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h2 className="font-display font-bold text-slate-900 text-lg">My Appointments</h2>
              <p className="text-slate-500 text-sm">Track all your bookings here</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#f8faff' }}>
                    {['#', 'Doctor', 'Specialization', 'Date', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map((a, i) => (
                    <tr key={a.app_id} className="table-row animate-fadeInUp" style={{ borderTop: '1px solid #f8faff', animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                      <td className="px-6 py-4 text-xs text-slate-400">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm"
                            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
                            {a.doctor_name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{a.doctor_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{a.specialization}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatDate(a.appointment_date)}</td>
                      <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                  {myAppointments.length === 0 && (
                    <tr><td colSpan="5" className="py-16 text-center">
                      <p className="text-5xl mb-3">📭</p>
                      <p className="text-slate-400 text-sm">No bookings yet. Find a doctor and book!</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default DoctorsList;