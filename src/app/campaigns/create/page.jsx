"use client";

import { useEffect, useState, Fragment } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";
function CreateCampaignPage() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("Customers who spent more than 5000 and haven't visited in the last 6 months");
  const [rules, setRules] = useState([]);
  const [logic, setLogic] = useState('AND'); 
  const [connectors, setConnectors] = useState([]);

  const { data: aiData, error: aiError, isLoading: isGenerating, executeFetch: fetchAiRules } = useFetch();
  const { data: previewData, error: previewError, isLoading: isPreviewing, executeFetch: fetchPreview } = useFetch();
  const router=useRouter();

  const audienceSize = typeof previewData?.audienceSize === 'number' ? previewData.audienceSize : null;

  useEffect(() => {
    if (!aiData) return;

    const nextRules = Array.isArray(aiData?.rules) ? aiData.rules : (Array.isArray(aiData) ? aiData : null);
    if (nextRules) {
      setRules(nextRules);
    }

    const maybeLogic = aiData?.logic?.toUpperCase();
    if (maybeLogic === 'AND' || maybeLogic === 'OR' || maybeLogic === 'MIXED') {
      setLogic(maybeLogic);
    }

    if (maybeLogic === 'MIXED' && Array.isArray(aiData.connectors)) {
      setConnectors(aiData.connectors);
    } else {
      setConnectors([]);
    }
  }, [aiData]);  const addRule = () => {
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

  const toggleConnector = (connectorIndex) => {
    if (logic !== 'MIXED') return;
    const newConnectors = [...connectors];
    newConnectors[connectorIndex] = newConnectors[connectorIndex] === 'AND' ? 'OR' : 'AND';
    setConnectors(newConnectors);
  };

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return;

    const payload = { 
      prompt: naturalLanguageInput,
    };
    
    await fetchAiRules('/api/ai/generate-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const handlePreview = () => {
    
    fetchPreview('/api/audience/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rules,
        logic,
        connectors, 
      }),
    });
  };

  const handleLaunch = () => {
    if (audienceSize != null && rules != null) {
      const params = new URLSearchParams({
        audienceSize: String(audienceSize),
        rules: JSON.stringify(rules),
      });
      router.push(`/campaigns/create/launch?${params.toString()}`);
    }
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
              disabled={isGenerating}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Rule Builder</h2>
            {/* AND / OR buttons removed */}
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Conditions are combined using <span className="font-semibold">{logic}</span>.
          </p>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <div className="relative text-center">
                    <button
                      onClick={() => toggleConnector(index - 1)}
                      disabled={logic !== 'MIXED'}
                      className="text-xs text-gray-500 select-none px-2 py-1 rounded-md border border-transparent hover:border-gray-300 disabled:cursor-not-allowed disabled:hover:border-transparent"
                    >
                      — {logic === 'MIXED' ? (connectors[index - 1] || '...') : logic} —
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
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
              </Fragment>
            ))}
          </div>

          <button onClick={addRule} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            Add Condition
          </button>

          <div className="border-t mt-6 pt-4 flex justify-end items-center gap-4">
            <button onClick={handlePreview} disabled={isPreviewing} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
              {isPreviewing ? "Calculating..." : "Preview"}
            </button>
            <button disabled={isPreviewing}  onClick={handleLaunch} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
             Launch Campaign
            </button>
          </div>
        </div>

        {audienceSize !== null && (
          <div className="mt-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-md flex items-center gap-3">
            <FontAwesomeIcon icon={faUserGroup} className="h-5 w-5" />
            <p className="font-bold">Estimated Audience Size: {audienceSize}</p>
          </div>
        )}
        {(aiError || previewError) && (
          <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-bold">Error: {aiError || previewError}</p>
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