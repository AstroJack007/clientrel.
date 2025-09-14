"use client";
import React, { useEffect } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faCircleCheck, faCircleXmark, faPlus } from '@fortawesome/free-solid-svg-icons';

const formatLaunched = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};

function Stat({ icon, color, value, label }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${color}`} />
      <span className="font-semibold">{typeof value === 'number' ? value.toLocaleString() : value ?? '-'}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

function HistoryCards() {
  const { data, error, isLoading, executeFetch } = useFetch();

  useEffect(() => {
    executeFetch('/api/campaigns/history');
  }, [executeFetch]);

  const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : [];

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Campaign History</h1>
        <a
          href="/campaigns/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          Create New Campaign
        </a>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{String(error)}</p>}

      {!isLoading && !error && campaigns.length === 0 && (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600">No campaigns found.</div>
      )}

      <ul className="space-y-4">
        {campaigns.map((c) => {
          const sent = (c.deliveryDetails || []).filter((d) => d.status === 'SENT').length;
          const failed = (c.deliveryDetails || []).filter((d) => d.status === 'FAILED').length;
          const title = c.message || 'Campaign';
          return (
            <li key={c._id} className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">Launched: {formatLaunched(c.createdAt)}</p>
              <div className="mt-4 flex items-center gap-6">
                <Stat icon={faUserGroup} color="text-gray-600" value={c.audienceSize} label="Audience" />
                <Stat icon={faCircleCheck} color="text-green-600" value={sent} label="Sent" />
                <Stat icon={faCircleXmark} color="text-red-600" value={failed} label="Failed" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Display() {
  return (
    <AuthCheck>
      <HistoryCards />
    </AuthCheck>
  );
}