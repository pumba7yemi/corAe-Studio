// apps/studio/app/pitch/slides/CorAeVsERP.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function CorAeVsERP() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-slate-900 mb-2 text-center"
      >
        corAe vs ERP vs CRM
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-slate-600 mb-12 text-center max-w-2xl"
      >
        <span className="font-semibold">ERPs manage.</span> <span className="font-semibold">CRMs remind.</span>{' '}
        <span className="font-semibold text-blue-600">corAe builds.</span> <br />
        The world’s first self-deploying, self-improving business OS.
      </motion.p>

      <div className="grid grid-cols-3 gap-6 max-w-6xl text-sm">
        {/* Column 1 - ERP */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">ERP (Enterprise Resource Planning)</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• Tracks money, stock, and operations</li>
            <li>• Built for accountants, not creators</li>
            <li>• Requires consultants & setup time</li>
            <li>• Static and expensive</li>
          </ul>
        </div>

        {/* Column 2 - CRM */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">CRM (Customer Relationship Management)</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• Tracks leads, deals, and messages</li>
            <li>• Isolated from real operations</li>
            <li>• Great memory, no action</li>
            <li>• Adds another layer of data entry</li>
          </ul>
        </div>

        {/* Column 3 - corAe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">corAe OS²™</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-white mt-0.5" />
              <span>Wizard-first → builds & deploys itself</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-white mt-0.5" />
              <span>CAIA™ learns & automates tasks intelligently</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-white mt-0.5" />
              <span>OBARI™ logic connects order → invoice loops</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-white mt-0.5" />
              <span>White-label ready — multiplies itself</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-white mt-0.5" />
              <span>Home, Work, and Business unified in one OS</span>
            </li>
          </ul>
        </motion.div>
      </div>

      <div className="mt-12 text-center text-slate-500 text-xs uppercase tracking-wide">
        © corAe OS² — The Operating System for Life™
      </div>
    </div>
  );
}