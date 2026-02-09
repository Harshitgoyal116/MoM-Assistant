
import React from 'react';
import { MOMResult } from '../types';

interface MOMResultDisplayProps {
  result: MOMResult;
  onReset: () => void;
}

export const MOMResultDisplay: React.FC<MOMResultDisplayProps> = ({ result, onReset }) => {
  const handleCopy = () => {
    const text = `
MINUTES OF MEETING
-----------------
SUMMARY:
${result.summary}

KEY DISCUSSION POINTS:
${result.keyPoints.map(p => `- ${p}`).join('\n')}

DECISIONS MADE:
${result.decisions.map(d => `- ${d}`).join('\n')}

ACTION ITEMS:
${result.actionItems.map(a => `- ${a.task} (Owner: ${a.owner}${a.deadline ? `, Deadline: ${a.deadline}` : ''})`).join('\n')}

NEXT STEPS:
${result.nextSteps.map(n => `- ${n}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    alert("MOM copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Generated Minutes</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleCopy}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2 text-sm font-medium"
          >
            <i className="fas fa-copy"></i>
            <span>Copy Text</span>
          </button>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 text-sm font-medium"
          >
            <i className="fas fa-plus"></i>
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Summary */}
        <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Executive Summary</h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            {result.summary}
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Discussion Points */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-slate-800 font-bold">
              <i className="fas fa-comments text-indigo-500"></i>
              <span>Discussion Points</span>
            </h3>
            <ul className="space-y-3">
              {result.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-slate-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0"></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Decisions */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 text-slate-800 font-bold">
              <i className="fas fa-gavel text-indigo-500"></i>
              <span>Decisions Made</span>
            </h3>
            <ul className="space-y-3">
              {result.decisions.map((decision, idx) => (
                <li key={idx} className="p-3 bg-green-50 text-green-800 text-sm rounded-lg border border-green-100 flex items-start space-x-3">
                  <i className="fas fa-check-circle mt-0.5"></i>
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Items */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <h3 className="flex items-center space-x-2 text-slate-800 font-bold mb-6">
            <i className="fas fa-tasks text-indigo-500"></i>
            <span>Action Items</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="pb-3 px-2">Task Description</th>
                  <th className="pb-3 px-2">Owner</th>
                  <th className="pb-3 px-2 text-right">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.actionItems.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-4 px-2 text-sm text-slate-700 font-medium">{item.task}</td>
                    <td className="py-4 px-2 text-sm">
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                        {item.owner}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-slate-500 text-right">{item.deadline || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-6 bg-white">
          <h3 className="flex items-center space-x-2 text-slate-800 font-bold mb-4">
            <i className="fas fa-forward text-indigo-500"></i>
            <span>Next Steps</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.nextSteps.map((step, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
