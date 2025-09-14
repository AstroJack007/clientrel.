"use client";
import React, { useEffect } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';

const formatDate=(dateString)=>{
    return new Date(dateString).toLocaleString('en-US',{
        year:'numeric',
        month:'short',
        day:'numeric',
        hour:'2-digit',
        minute:'2-digit',
    });
};

function DisplayCampaign() {
    const { data, error, isLoading, executeFetch } = useFetch();

    useEffect(() => {
        executeFetch('/api/campaigns/history');
    }, [executeFetch]);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-3xl font-semibold">Campaign History</p>
                <a href="/campaigns/create" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Create New Campaign</a>
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {data && Array.isArray(data.campaigns) && data.campaigns.length > 0 ? (
                <ul className="space-y-3">
                    {data.campaigns.map((c) => (
                        <li key={c._id} className="p-4 rounded border bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Status: {c.status}</p>
                                    <p className="text-sm text-gray-600">Audience Size: {c.audienceSize}</p>
                                </div>
                                <p className="text-sm text-gray-500">{formatDate(c.createdAt)}</p>
                            </div>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">{c.audienceQuery}</pre>
                        </li>
                    ))}
                </ul>
            ) : (
                !isLoading && !error && <p>No campaigns found.</p>
            )}
        </div>
    );
}






export default function Display() {
    return (
        <AuthCheck>
            <DisplayCampaign />
        </AuthCheck>
    );
}