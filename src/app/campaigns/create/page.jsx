"use client";

import { useEffect, useState, Fragment } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';

function CreateCampaignPage() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("Customers who spent more than 5000 and haven't visited in the last 6 months");
  const [rules, setRules] = useState([]);
  const [logic, setLogic] = useState('AND'); // default connector for new/override
  const [connectors, setConnectors] = useState([]); // per-join connectors between rules (length = rules.length - 1)

  // Separate fetchers
  const { data: aiData, error: aiError, isLoading: isGenerating, executeFetch: fetchAiRules } = useFetch();
  const { data: previewData, error: previewError, isLoading: isPreviewing, executeFetch: fetchPreview } = useFetch();

  // Safer audience size read
  const audienceSize = typeof previewData?.audienceSize === 'number' ? previewData.audienceSize : null;

  useEffect(() => {
    if (!aiData) return;
    const nextRules = Array.isArray(aiData?.rules) ? aiData.rules : (Array.isArray(aiData) ? aiData : null);
    if (nextRules) setRules(nextRules);

    // Try to derive logic from AI response if present
    const maybeLogic = aiData?.logicalOperator || aiData?.logic || aiData?.conjunction || aiData?.combine || aiData?.operator;
    if (typeof maybeLogic === 'string') {
      const upper = maybeLogic.toUpperCase();
      if (upper === 'AND' || upper === 'OR') setLogic(upper);
    }

    // If the AI provides connectors, use them; else fill from logic
    const aiConnectors = Array.isArray(aiData?.connectors)
      ? aiData.connectors.map(c => (typeof c === 'string' ? c.toUpperCase() : 'AND'))
      : null;
    if (Array.isArray(nextRules)) {
      const needed = Math.max(0, nextRules.length - 1);
      if (aiConnectors && aiConnectors.length) {
        const normalized = [...aiConnectors];
        while (normalized.length < needed) normalized.push((maybeLogic || logic || 'AND').toString().toUpperCase());
        setConnectors(normalized.slice(0, needed));
      } else {
        setConnectors(new Array(needed).fill((maybeLogic || logic || 'AND').toString().toUpperCase()));
      }
    }
  }, [aiData]);

  const addRule = () => {
    setRules(prev => {
      const next = [...prev, { field: 'totalSpends', operator: 'gt', value: '' }];
      // when adding a rule, add a connector joining previous last and the new one
      setConnectors(cPrev => (next.length > 1 ? [...cPrev, logic] : []));
      return next;
    });
  };

  const removeRule = (indexToRemove) => {
    setRules(prev => prev.filter((_, index) => index !== indexToRemove));
    // remove the connector adjacent to the removed rule
    setConnectors(prev => {
      const next = [...prev];
      if (indexToRemove < next.length) {
        next.splice(indexToRemove, 1); // connector between removed and next
      } else if (indexToRemove - 1 >= 0 && indexToRemove - 1 < next.length) {
        next.splice(indexToRemove - 1, 1); // if last rule removed, remove connector before it
      }
      return next;
    });
  };

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const updateConnector = (index, value) => {
    const val = (value || '').toString().toUpperCase() === 'OR' ? 'OR' : 'AND';
    setConnectors(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return;

    // Derive connectors hint from the typed text (sequence of AND/OR between clauses)
    const found = (naturalLanguageInput.match(/\b(?:and|or)\b/gi) || []).map((m) => m.toUpperCase());
    const connectorsHint = found.map((c) => (c === 'OR' ? 'OR' : 'AND'));

    const payload = { prompt: naturalLanguageInput, preferredLogic: logic, connectorsHint };
    console.log("payload",payload);
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
        connectors,
        logic,
        operator: logic,
        conjunction: logic.toLowerCase(),
        combine: logic.toLowerCase(),
      }),
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
              disabled={isGenerating}
            >
              <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Rule Builder</h2>
            <div className="flex items-center gap-2" role="group" aria-label="Default connector">
              <button
                type="button"
                onClick={() => {
                  setLogic('AND');
                  setConnectors(prev => prev.map(() => 'AND')); // apply globally
                }}
                className={`px-3 py-1 text-sm rounded-md border ${logic === 'AND' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogic('OR');
                  setConnectors(prev => prev.map(() => 'OR')); // apply globally
                }}
                className={`px-3 py-1 text-sm rounded-md border ${logic === 'OR' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                OR
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-3">Default connector for new conditions: <span className="font-semibold">{logic}</span>. You can change the connector between specific conditions below.</p>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <div className="flex items-center justify-center">
                    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden" role="group" aria-label={`Connector ${index-1}`}>
                      <button
                        type="button"
                        onClick={() => updateConnector(index - 1, 'AND')}
                        className={`px-2 py-0.5 text-xs ${connectors[index - 1] === 'AND' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        AND
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConnector(index - 1, 'OR')}
                        className={`px-2 py-0.5 text-xs ${connectors[index - 1] === 'OR' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        OR
                      </button>
                    </div>
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
            <button disabled={isPreviewing} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
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