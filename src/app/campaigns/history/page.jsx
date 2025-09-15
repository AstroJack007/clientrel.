"use client";
import React, { useEffect } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faCircleCheck, faCircleXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import Card, { CardBody } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import EmptyState from '../../../../components/ui/EmptyState';
import Spinner from '../../../../components/ui/Spinner';

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
  const getTime = (d) => {
    const t = Date.parse(d);
    return Number.isNaN(t) ? 0 : t;
  };

  const campaigns = Array.isArray(data?.campaigns)
    ? [...data.campaigns].sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt))
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Campaign History</h1>
        <Button as="a" href="/campaigns/create" className="inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          Create New Campaign
        </Button>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-10"><Spinner /></div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">{String(error)}</div>
      )}

      {!isLoading && !error && campaigns.length === 0 && (
        <EmptyState title="No campaigns yet" description="Create your first campaign to see it here." action={<Button as="a" href="/campaigns/create">Create campaign</Button>} />
      )}

      <ul className="space-y-4">
        {campaigns.map((c) => {
          const sent = (c.deliveryDetails || []).filter((d) => d.status === 'SENT').length;
          const failed = (c.deliveryDetails || []).filter((d) => d.status === 'FAILED').length;
          const title = c.message || 'Campaign';
          return (
            <li key={c._id}>
              <Card>
                <CardBody>
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Launched: {formatLaunched(c.createdAt)}</p>
                  <div className="mt-4 flex items-center gap-6">
                    <Stat icon={faUserGroup} color="text-gray-600" value={c.audienceSize} label="Audience" />
                    <Stat icon={faCircleCheck} color="text-green-600" value={sent} label="Sent" />
                    <Stat icon={faCircleXmark} color="text-red-600" value={failed} label="Failed" />
                  </div>
                </CardBody>
              </Card>
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