import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Maximize2,
  Minimize2,
  MessageSquare,
  FileText,
  Activity,
  HeartPulse,
  ShieldAlert,
  User,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const TelemedicineRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, isDoctor, isPatient } = useAuth();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState('VITALS'); // 'VITALS' | 'CHAT' | 'NOTES'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-call chat state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: `Encrypted consultation room "${roomId}" initialized. All telemetry encrypted.`, time: '10:00 AM' },
    { sender: isDoctor ? 'Patient' : 'Dr. Aarav Sharma', text: 'Hello, I can hear and see you clearly. Ready for the consultation.', time: '10:01 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Doctor in-call clinical notes
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient presented with occasional palpitations and mild shortness of breath upon exertion. Vitals stable on sensor stream. Advised continuation of antihypertensives.'
  );
  const [notesSaved, setNotesSaved] = useState(false);

  // Video streams
  const localVideoRef = useRef(null);
  const [cameraPermission, setCameraPermission] = useState(true);

  useEffect(() => {
    let stream = null;
    if (isVideoOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: isMicOn })
        .then((s) => {
          stream = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
          setCameraPermission(true);
        })
        .catch(() => {
          // Graceful fallback to medical simulation feed
          setCameraPermission(false);
        });
    } else {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn, isMicOn]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: user?.name || 'You',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 3000);
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to conclude this video consultation session?')) {
      navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-950 text-white rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800">
      {/* Top Session Bar */}
      <div className="h-14 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Room: {roomId}
          </span>
          <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
            Encrypted Telehealth
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Stream Latency: 18ms (Optimal)</span>
        </div>
      </div>

      {/* Main Video & HUD Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Video Grid */}
        <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[720px]">
            {/* Primary Remote Tile (Doctor or Patient) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-transparent to-slate-950/30 pointer-events-none" />

              {/* Simulated video background */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500 to-sky-600 text-white flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-white/10 mb-3 animate-pulse">
                  {isDoctor ? 'Rahul Verma' : 'Dr. Sharma'}
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {isDoctor ? 'Rahul Verma (Patient)' : 'Dr. Aarav Sharma (Cardiologist)'}
                </h3>
                <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Remote stream live
                </span>
              </div>

              {/* Top-left tag */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-slate-200 border border-white/10">
                {isDoctor ? 'Patient Feed' : 'Doctor Feed'}
              </div>
            </div>

            {/* Local Video Tile (Self) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
              {isVideoOn && cameraPermission ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{user?.name || 'You'}</h4>
                  <span className="text-xs text-slate-400 mt-1">
                    {!isVideoOn ? 'Camera Turned Off' : 'Simulated Stream (Camera fallback)'}
                  </span>
                </div>
              )}

              {/* Local Tag & Status Icons */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-slate-200 border border-white/10">
                You ({user?.role})
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {!isMicOn && (
                  <span className="p-1.5 rounded-lg bg-rose-600/80 text-white">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                )}
                {!isVideoOn && (
                  <span className="p-1.5 rounded-lg bg-rose-600/80 text-white">
                    <VideoOff className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right HUD Sidebar: Vitals / Chat / Notes */}
        <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800 p-1.5 bg-slate-900/60">
            <button
              onClick={() => setActiveSidePanel('VITALS')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeSidePanel === 'VITALS'
                  ? 'bg-slate-800 text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Live Telemetry</span>
            </button>
            <button
              onClick={() => setActiveSidePanel('CHAT')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeSidePanel === 'CHAT'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>In-Call Chat</span>
            </button>
            {isDoctor && (
              <button
                onClick={() => setActiveSidePanel('NOTES')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeSidePanel === 'NOTES'
                    ? 'bg-slate-800 text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>
            )}
          </div>

          {/* Panel Contents */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
            {activeSidePanel === 'VITALS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Patient Sensor Telemetry
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Continuous
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                    <span className="text-xl font-black text-rose-400 mt-1 block">78 BPM</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Normal Rhythm</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                    <span className="text-xl font-black text-sky-400 mt-1 block">122/82</span>
                    <span className="text-[10px] text-sky-300 font-semibold">Pre-hypertension</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Oxygen SpO2</span>
                    <span className="text-xl font-black text-teal-400 mt-1 block">98%</span>
                    <span className="text-[10px] text-teal-300 font-semibold">Optimal</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Temperature</span>
                    <span className="text-xl font-black text-amber-400 mt-1 block">36.8 °C</span>
                    <span className="text-[10px] text-amber-300 font-semibold">Afebrile</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">AI Risk Assessment</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                      LOW RISK (18/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Physiological metrics are consistent with routine baseline. No acute flags or arrhythmias detected in current telemetric buffer.
                  </p>
                </div>
              </div>
            )}

            {activeSidePanel === 'CHAT' && (
              <div className="flex-1 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-teal-400">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Send in-call message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {activeSidePanel === 'NOTES' && (
              <div className="flex-1 flex flex-col h-full space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Clinical Consultation Notes
                </span>
                <textarea
                  rows={8}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="flex-1 w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
                  placeholder="Record symptoms, observations, diagnosis, and care plan..."
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{notesSaved ? 'Notes Saved!' : 'Save Clinical Notes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Call Controls */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-center gap-3 sm:gap-4 z-20">
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-3.5 rounded-2xl transition-all shadow-lg ${
            isMicOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-3.5 rounded-2xl transition-all shadow-lg ${
            isVideoOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-3.5 rounded-2xl transition-all shadow-lg ${
            isScreenSharing
              ? 'bg-teal-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Share Screen"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shadow-lg hidden sm:flex"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <button
          onClick={handleEndCall}
          className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-600/30 transition-all"
        >
          <PhoneOff className="w-5 h-5" />
          <span>End Visit</span>
        </button>
      </div>
    </div>
  );
};

export default TelemedicineRoomPage;
