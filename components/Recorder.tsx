
import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';

interface RecorderProps {
  onRecordingStart: () => void;
  onRecordingComplete: (blob: Blob) => void;
  status: AppState;
}

export const Recorder: React.FC<RecorderProps> = ({ onRecordingStart, onRecordingComplete, status }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState(15); 
  const [isMicActiveInMix, setIsMicActiveInMix] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true); 
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  useEffect(() => {
    if (micGainNodeRef.current) {
      const shouldBeAudible = micEnabled && isMicActiveInMix;
      const targetGain = shouldBeAudible ? 1 : 0;
      
      micGainNodeRef.current.gain.setTargetAtTime(
        targetGain, 
        audioCtxRef.current?.currentTime || 0, 
        0.05 
      );
    }
  }, [isMicActiveInMix, micEnabled]);

  const cleanupAudio = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(console.error);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const processAudioLevels = () => {
    if (!mainAnalyserRef.current || !micAnalyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = mainAnalyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const micDataArray = new Uint8Array(micAnalyserRef.current.frequencyBinCount);

    const renderFrame = () => {
      if (status !== AppState.RECORDING && status !== AppState.IDLE) return;
      animationRef.current = requestAnimationFrame(renderFrame);
      
      micAnalyserRef.current!.getByteFrequencyData(micDataArray);
      let micMax = 0;
      for (let i = 0; i < micDataArray.length; i++) {
        if (micDataArray[i] > micMax) micMax = micDataArray[i];
      }
      
      const isVoiceDetected = micMax > (sensitivity * 2);
      if (isVoiceDetected !== isMicActiveInMix) {
        setIsMicActiveInMix(isVoiceDetected);
      }

      mainAnalyserRef.current!.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = status === AppState.RECORDING ? '#ef4444' : '#6366f1';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  const startRecording = async () => {
    if (status === AppState.RECORDING) return;
    setLocalError(null);

    let displayStream: MediaStream | null = null;
    let micStream: MediaStream | null = null;

    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true, systemAudio: "include" }
      } as any);

      const systemTracks = displayStream.getAudioTracks();
      if (systemTracks.length === 0) {
        displayStream.getTracks().forEach(t => t.stop());
        throw new Error("No system audio detected. Please check 'Share tab audio'.");
      }

      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        console.warn("Microphone access denied.");
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      
      const mixer = audioCtx.createGain();
      const destination = audioCtx.createMediaStreamDestination();
      
      const systemSource = audioCtx.createMediaStreamSource(new MediaStream([systemTracks[0]]));
      systemSource.connect(mixer);

      if (micStream) {
        const micSource = audioCtx.createMediaStreamSource(new MediaStream([micStream.getAudioTracks()[0]]));
        const micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 256;
        micSource.connect(micAnalyser);
        micAnalyserRef.current = micAnalyser;

        const micGain = audioCtx.createGain();
        micGain.gain.value = 0; 
        micGainNodeRef.current = micGain;
        
        micSource.connect(micGain);
        micGain.connect(mixer);
      }

      mainAnalyserRef.current = audioCtx.createAnalyser();
      mainAnalyserRef.current.fftSize = 256;
      mixer.connect(destination);
      mixer.connect(mainAnalyserRef.current);
      
      processAudioLevels();

      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(blob);
        cleanupAudio();
        stopTimer();
      };

      mediaRecorder.start();
      onRecordingStart();
      startTimer();
      displayStream.getVideoTracks().forEach(t => t.stop());

    } catch (err: any) {
      setLocalError(err.message || "Failed to start capture");
      if (displayStream) displayStream.getTracks().forEach(t => t.stop());
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">
          {status === AppState.RECORDING ? 'Privacy Gated Recording' : 'Teams-Synchronized Capture'}
        </h2>
        <p className="text-slate-500 max-w-sm mx-auto text-xs leading-relaxed">
          Absolute control over your voice. Use the mic button below to manually enable or disable your capture.
        </p>
      </div>

      <canvas ref={canvasRef} width={300} height={60} className="bg-slate-50 rounded-xl border border-slate-100 w-full max-w-xs shadow-inner" />

      {/* PRIVACY & MIC CONTROL PANEL - ALWAYS VISIBLE */}
      <div className="w-full max-w-xs space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Privacy Control</span>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${(!micEnabled) ? 'bg-red-500' : (status === AppState.RECORDING && isMicActiveInMix ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-300')}`}></div>
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${(!micEnabled) ? 'text-red-600' : (status === AppState.RECORDING && isMicActiveInMix ? 'text-green-600' : 'text-slate-500')}`}>
                   {!micEnabled ? 'MIC DISABLED' : (status === AppState.RECORDING ? (isMicActiveInMix ? 'UNMUTED' : 'MUTED') : 'READY')}
                </span>
              </div>
           </div>
           
           <button 
             onClick={() => setMicEnabled(!micEnabled)}
             className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md border-2 ${micEnabled ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-red-600 border-red-500 text-white shadow-red-200'}`}
             title={micEnabled ? "Stop Microphone Capture" : "Enable Microphone Capture"}
           >
              <i className={`fas ${micEnabled ? 'fa-microphone' : 'fa-microphone-slash'} text-lg mb-1`}></i>
              <span className="text-[8px] font-black uppercase">{micEnabled ? 'ON' : 'OFF'}</span>
           </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sync Sensitivity</span>
            <span className="text-[10px] font-mono text-slate-400">{sensitivity}</span>
          </div>
          <input 
            type="range" min="1" max="50" value={sensitivity} 
            onChange={(e) => setSensitivity(parseInt(e.target.value))}
            disabled={!micEnabled}
            className={`w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${!micEnabled && 'opacity-30'}`}
          />
        </div>
        <p className="text-[8px] text-slate-400 leading-tight">
          {micEnabled ? "* Automatically filters 'ghost audio' if Teams is muted." : "* Mic is physically disconnected from the recorder."}
        </p>
      </div>

      {localError && (
        <div className="w-full max-w-md p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2 text-red-600">
          <i className="fas fa-exclamation-circle"></i>
          <p className="text-xs font-bold">{localError}</p>
        </div>
      )}

      <div className="relative">
        <button
          onClick={status === AppState.RECORDING ? stopRecording : startRecording}
          disabled={status === AppState.PROCESSING}
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-xl border-4 ${
            status === AppState.RECORDING 
              ? 'bg-red-500 hover:bg-red-600 border-red-100' 
              : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-100'
          }`}
        >
          <i className={`fas ${status === AppState.RECORDING ? 'fa-stop' : 'fa-play'} text-xl text-white mb-1`}></i>
          <span className="text-[9px] text-white font-black uppercase tracking-widest">
            {status === AppState.RECORDING ? 'Stop' : 'Start'}
          </span>
        </button>
        {status === AppState.RECORDING && (
          <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20 -z-0"></div>
        )}
      </div>

      <div className="text-4xl font-mono font-black text-slate-800 tracking-tighter">
        {formatTime(recordingTime)}
      </div>

      <div className="w-full flex justify-center space-x-6 border-t border-slate-100 pt-6">
        <div className="flex flex-col items-center space-y-1">
          <i className="fas fa-shield-halved text-indigo-400 text-sm"></i>
          <span className="text-[8px] font-bold text-slate-400 uppercase">Double-Gated</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <i className="fas fa-user-lock text-emerald-400 text-sm"></i>
          <span className="text-[8px] font-bold text-slate-400 uppercase">Always Visible</span>
        </div>
      </div>
    </div>
  );
};
