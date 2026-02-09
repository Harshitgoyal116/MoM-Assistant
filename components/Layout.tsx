
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-microphone-lines text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">MOM Assistant</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Enterprise Edition</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
              System Ready
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; 2024 MOM Assistant Pro. Fully compliant browser-based solution.
          </p>
        </div>
      </footer>
    </div>
  );
};
