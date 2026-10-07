import React, { useState } from 'react';
import Modal from '../common/Modal';
import API from '../../services/api';
import { ShieldAlert, PhoneCall, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

const EmergencyModal = ({ isOpen, onClose, onEmergencyDispatched }) => {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  const handleConfirmEmergency = async () => {
    try {
      setLoading(true);
      const res = await API.post('/emergency/trigger', {
        message: customMessage || 'EMERGENCY SOS: Patient pressed emergency button. Immediate assistance requested.',
      });

      if (res.data?.success) {
        setSuccessData(res.data.alert);
        if (onEmergencyDispatched) onEmergencyDispatched(res.data.alert);
      }
    } catch (err) {
      console.error('Emergency dispatch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setCustomMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Emergency SOS Alert Confirmation" maxWidth="max-w-md">
      {successData ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Emergency Alert Dispatched!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your assigned doctor and emergency contacts have been notified with your current health vitals snapshot and location.
          </p>

          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
            <p><strong>Alert ID:</strong> {successData._id}</p>
            <p><strong>Status:</strong> <span className="text-red-600 font-bold">ACTIVE / BROADCASTED</span></p>
            <p><strong>Location:</strong> {successData.location?.address}</p>
            <p><strong>Emergency Contact:</strong> {successData.emergencyContact?.name} ({successData.emergencyContact?.phone})</p>
          </div>

          <button
            onClick={handleClose}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close & View Emergency Status
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Activate Immediate Emergency SOS?</h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                This will immediately broadcast a critical alert to your doctor, save your latest health readings, and notify emergency contacts.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Optional Emergency Note / Symptoms
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. Severe chest pain, shortness of breath..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Quick Helplines */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              National Emergency Ambulances
            </span>
            <span className="font-bold text-slate-900">108 / 112</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEmergency}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Broadcasting...' : 'DISPATCH SOS NOW'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EmergencyModal;
