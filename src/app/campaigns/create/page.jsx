"use client";

import { useState } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';

function CreateCampaignPage() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("Customers who spent more than 5000 and haven't visited in the last 6 months");
  const [rules, setRules] = useState([]);
  
  
  const { data: previewData, error, isLoading, executeFetch } = useFetch();
  const audienceSize = previewData ? previewData.audienceSize : null;

  
  const addRule = () => {
    setRules([...rules, { field: 'totalSpends', operator: 'gt', value: '' }]);
  };

  const removeRule = (indexToRemove) => {
    setRules(rules.filter((_, index) => index !== indexToRemove));
  };

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  

  const handlePreview = () => {
 
    executeFetch('/api/audience/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules }),
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
    
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">AI Feature - Natural Language to Rules</h1>
          <p className="text-gray-500 mt-1">Use natural language to generate audience rules instantly.</p>
        </div>

     
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <label htmlFor="nl-input" className="block text-sm font-medium text-gray-700 mb-2">Describe your audience in plain English...</label>
          <div className="flex items-center gap-2">
            <input
              id="nl-input"
              type="text"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., High-value customers who are at risk of leaving"
            />
            <button 
              onClick={handleNaturalLanguageSubmit}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Rule Builder</h2>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2">
                <select value={rule.field} onChange={(e) => updateRule(index, 'field', e.target.value)} className="p-2 border rounded-md w-1/4">
                  <option value="totalSpends">Total Spend</option>
                  <option value="lastSeen">Last Visit Date</option>
                  <option value="visitCount">Visit Count</option>
                </select>
                <select value={rule.operator} onChange={(e) => updateRule(index, 'operator', e.target.value)} className="p-2 border rounded-md w-1/4">
                  <option value="gt">is greater than</option>
                  <option value="lt">is less than</option>
                  <option value="eq">is equal to</option>
                </select>
                <input type="text" value={rule.value} onChange={(e) => updateRule(index, 'value', e.target.value)} placeholder="Value" className="p-2 border rounded-md flex-grow"/>
                <button onClick={() => removeRule(index)} className="text-gray-500 hover:text-red-600 p-2">
                  <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addRule} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
           <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            Add Condition
          </button>
          
          <div className="border-t mt-6 pt-4 flex justify-end items-center gap-4">
            <button onClick={handlePreview} disabled={isLoading} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
              {isLoading ? "Calculating..." : "Preview"}
            </button>
            <button disabled={isLoading} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              Save Audience
            </button>
          </div>
        </div>

        {audienceSize !== null && (
          <div className="mt-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-md flex items-center gap-3">
            <FontAwesomeIcon icon={faUserGroup} className="h-5 w-5" />
            <p className="font-bold">Estimated Audience Size: {audienceSize}</p>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-bold">Error: {error}</p>
          </div>
        )}

      </div>
    </div>
  );
}


export default function ProtectCreateCampaignPage() {
    
    return (
        <AuthCheck>
            <CreateCampaignPage/>
        </AuthCheck>
    );
}