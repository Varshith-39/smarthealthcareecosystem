import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, MessageSquare, Shield, Activity } from 'lucide-react';

const VideoConsultModal = ({ isOpen, onClose, appointment }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Encrypted Telemedicine Session" maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Banner badge */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Demo Consultation Room (Simulated WebRTC Video Stream)</span>
          </div>
          <span className="font-mono bg-teal-200/60 px-2 py-0.5 rounded-md font-bold text-teal-900">
            {formatDuration(callDuration)}
          </span>
        </div>

        {/* Video Canvas Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-80 sm:h-96">
          {/* Main Video: Remote Participant */}
          <div className="md:col-span-2 relative bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            {isVideoOn ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900">
                <div className="w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-400/40 flex items-center justify-center text-teal-300 text-3xl font-bold shadow-2xl">
                  {appointment?.doctorId?.name ? appointment.doctorId.name.charAt(3) : 'D'}
                </div>
                <p className="text-white font-semibold text-sm mt-3">
                  {appointment?.doctorId?.name || 'Dr. Aarav Sharma'}
                </p>
                <span className="text-teal-400 text-xs font-mono">Simulated HD 1080p Stream</span>

                {/* Floating telemetry HUD on video */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Telemetry Sync: Active</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                <VideoOff className="w-8 h-8" />
                <span>Video Stream Muted</span>
              </div>
            )}

            {/* Picture-in-picture Self View */}
            <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-800 rounded-xl border border-white/20 overflow-hidden shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                You
              </div>
            </div>
          </div>

          {/* Consultation Notes & Patient Information Drawer */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between text-xs">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Session Details</h4>
              <div className="space-y-2 text-slate-600">
                <p>
                  <strong>Doctor:</strong> {appointment?.doctorId?.name || 'Dr. Aarav Sharma'}
                </p>
                <p>
                  <strong>Patient:</strong> {appointment?.patientId?.name || 'Rahul Verma'}
                </p>
                <p>
                  <strong>Reason:</strong> {appointment?.reason || 'Clinical Consultation'}
                </p>
                <p>
                  <strong>Scheduled:</strong> {appointment?.time || '10:30 AM'}
                </p>
              </div>

              <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Live Clinical Telemetry
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>SpO2: <strong className="text-teal-700">98%</strong></div>
                  <div>HR: <strong className="text-rose-700">76 BPM</strong></div>
                  <div>BP: <strong className="text-sky-700">120/80</strong></div>
                  <div>Temp: <strong className="text-amber-700">36.7°C</strong></div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center italic mt-2">
              Encrypted end-to-end medical teleconsultation simulation
            </p>
          </div>
        </div>

        {/* Video Call Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-full border transition-all ${
              isMicOn
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-red-500 text-white border-red-600'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full border transition-all ${
              isVideoOn
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-red-500 text-white border-red-600'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VideoConsultModal;
