"use client";

import { useEffect, useState, Fragment } from 'react';
import AuthCheck from '../../../../components/AuthCheck';
import useFetch from '../../../../hooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";
import Card, { CardBody, CardFooter, CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Spinner from '../../../../components/ui/Spinner';
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
        logic: logic,
        connectors: JSON.stringify(connectors),
      });
      router.push(`/campaigns/create/launch?${params.toString()}`);
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600 mt-1">Use natural language to generate audience rules, refine them, preview, and launch.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-800">Describe your audience</h2>
            <p className="mt-1 text-sm text-gray-600">We’ll convert this into rules you can tweak.</p>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-2">
              <Input
                id="nl-input"
                type="text"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="e.g., Customers who spent more than 5000 and haven't visited in 6 months"
              />
              <Button onClick={handleNaturalLanguageSubmit} aria-label="Generate rules" disabled={isGenerating}>
                {isGenerating ? <Spinner size={18} /> : <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Rule Builder</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Conditions are combined using <span className="font-semibold">{logic}</span>.
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <Fragment key={index}>
                  {index > 0 && (
                    <div className="relative text-center">
                      <Button
                        onClick={() => toggleConnector(index - 1)}
                        disabled={logic !== 'MIXED'}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-600"
                      >
                        — {logic === 'MIXED' ? (connectors[index - 1] || '...') : logic} —
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select value={rule.field} onChange={(e) => updateRule(index, 'field', e.target.value)} className="w-1/3">
                      <option value="totalSpends">Total Spend</option>
                      <option value="lastSeen">Last Visit Date</option>
                      <option value="visitCount">Visit Count</option>
                    </Select>
                    <Select value={rule.operator} onChange={(e) => updateRule(index, 'operator', e.target.value)} className="w-1/3">
                      <option value="gt">is greater than</option>
                      <option value="lt">is less than</option>
                      <option value="eq">is equal to</option>
                    </Select>
                    <Input type="text" value={rule.value} onChange={(e) => updateRule(index, 'value', e.target.value)} placeholder="Value" />
                    <Button onClick={() => removeRule(index)} variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </Button>
                  </div>
                </Fragment>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={addRule} variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
          </CardBody>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <div>
                {audienceSize !== null && (
                  <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-blue-800">
                    <FontAwesomeIcon icon={faUserGroup} className="h-4 w-4" />
                    <span className="text-sm font-semibold">Estimated Audience: {audienceSize}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handlePreview} disabled={isPreviewing} variant="outline">
                  {isPreviewing ? (
                    <div className="inline-flex items-center gap-2"><Spinner size={16} /> Calculating...</div>
                  ) : (
                    "Preview"
                  )}
                </Button>
                <Button disabled={isPreviewing} onClick={handleLaunch}>
                  Launch Campaign
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        {(aiError || previewError) && (
          <div className="mt-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{String(aiError || previewError)}</p>
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