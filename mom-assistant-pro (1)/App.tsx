
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Recorder } from './components/Recorder';
import { MOMResultDisplay } from './components/MOMResultDisplay';
import { AppState, MOMResult } from './types';
import { generateMOM } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<MOMResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRecordingStart = () => {
    setStatus(AppState.RECORDING);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    try {
      setStatus(AppState.PROCESSING);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        try {
          const momResult = await generateMOM(base64data, blob.type);
          setResult(momResult);
          setStatus(AppState.RESULT);
        } catch (err: any) {
          setErrorMessage(err.message || "Processing failed.");
          setStatus(AppState.ERROR);
        }
      };
    } catch (err) {
      setErrorMessage("Failed to process recording.");
      setStatus(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppState.IDLE);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <Layout>
      {(status === AppState.IDLE || status === AppState.RECORDING) && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {status === AppState.IDLE && (
            <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="max-w-xl">
                  <div className="inline-flex items-center px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 border border-indigo-500/30">
                    <i className="fas fa-shield-halved mr-2"></i>
                    Enterprise Privacy Sync
                  </div>
                  <h2 className="text-4xl font-extrabold mb-4 text-white tracking-tight leading-tight">MOM Sync: Intelligent Capture.</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Fully automated microphone synchronization. Our signal gate respects your meeting software's mute state instantly.
                  </p>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-5 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                      <i className="fas fa-user-secret text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-indigo-200 font-bold text-sm mb-1 uppercase tracking-wider">Respecting Your Privacy</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Even if Teams keeps your mic active while "muted", our <strong>Signal Gate</strong> identifies the silence and physically discards the audio from the MOM recording. 
                        No door conversations or private remarks will be captured.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-48 h-48 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-inner">
                     <i className="fas fa-microphone-lines text-7xl text-indigo-500 opacity-40"></i>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Recorder onRecordingStart={handleRecordingStart} onRecordingComplete={handleRecordingComplete} status={status} />

          {status === AppState.IDLE && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><i className="fas fa-tower-broadcast text-xl"></i></div>
                <h3 className="font-bold text-slate-900 mb-3">System Audio</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Captures all attendees by sharing your meeting browser tab with system audio enabled.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><i className="fas fa-sync text-xl"></i></div>
                <h3 className="font-bold text-slate-900 mb-3">Mute Sync</h3>
                <p className="text-sm text-slate-500 leading-relaxed">If you mute in Teams, the app stops listening to you. No manual mic buttons required.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><i className="fas fa-brain text-xl"></i></div>
                <h3 className="font-bold text-slate-900 mb-3">Gemini AI</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Multilingual conversations are automatically translated and structured into professional MOMs.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {status === AppState.PROCESSING && (
        <div className="flex flex-col items-center justify-center py-32 space-y-10">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-[6px] border-indigo-100 rounded-[2rem]"></div>
            <div className="absolute inset-0 border-[6px] border-indigo-600 rounded-[2rem] border-t-transparent animate-spin"></div>
            <div className="absolute inset-6 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-3xl text-white animate-pulse"></i>
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Synthesizing MOM...</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">Gemini is currently analyzing your meeting, identifying key decisions, and translating your discussions.</p>
          </div>
        </div>
      )}

      {status === AppState.RESULT && result && <MOMResultDisplay result={result} onReset={handleReset} />}

      {status === AppState.ERROR && (
        <div className="bg-white rounded-[2rem] border border-red-100 shadow-xl p-16 text-center space-y-8 max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <i className="fas fa-triangle-exclamation text-4xl"></i>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900">Processing Failed</h2>
            <p className="text-red-600 font-bold bg-red-50/50 py-2 px-6 rounded-full inline-block">{errorMessage}</p>
          </div>
          <button onClick={handleReset} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Try Again</button>
        </div>
      )}
    </Layout>
  );
};

export default App;
