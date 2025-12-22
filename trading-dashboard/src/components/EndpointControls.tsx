import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Loader2, Shield, Heart, Sparkles, Radar, Search, MessageSquare, Brain, Database } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';

interface EndpointResponse {
  data: any;
  timestamp: string;
  status: 'success' | 'error' | 'loading';
}

export function EndpointControls() {
  const [responses, setResponses] = useState<Record<string, EndpointResponse>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    health: false,
    analysis: false,
    training: false,
    data: false
  });

  const [formData, setFormData] = useState({
    // Predict
    predictSymbols: 'AAPL',
    predictHorizon: 'intraday',
    predictRiskProfile: '',
    predictStopLoss: 2,
    predictCapitalRisk: 1,
    predictDrawdownLimit: 5,
    
    // Scan All
    scanSymbols: 'AAPL,GOOGL,MSFT',
    scanHorizon: 'intraday',
    scanConfidence: 0.3,
    scanStopLoss: 2,
    scanCapitalRisk: 1,
    
    // Analyze
    analyzeSymbol: 'AAPL',
    analyzeHorizons: ['intraday'],
    analyzeStopLoss: 2,
    analyzeCapitalRisk: 1,
    analyzeDrawdownLimit: 5,
    
    // Feedback
    feedbackSymbol: 'AAPL',
    feedbackAction: 'LONG',
    feedbackResponse: 'correct',
    feedbackActualReturn: '',
    feedbackMessage: '',
    
    // Train RL
    trainSymbol: 'AAPL',
    trainHorizon: 'intraday',
    trainEpisodes: 10,
    trainForceRetrain: false,
    
    // Fetch Data
    fetchDataSymbols: 'AAPL,GOOGL,MSFT',
    fetchDataPeriod: '2y',
    fetchDataIncludeFeatures: false,
    fetchDataRefresh: false
  });

  // Timer for rate limit countdown
  const [rateLimitTimers, setRateLimitTimers] = useState<Record<string, number>>({});
  
  // Effect to handle rate limit countdown timers
  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};
    
    Object.keys(rateLimitTimers).forEach(endpoint => {
      if (rateLimitTimers[endpoint] > 0) {
        timers[endpoint] = setTimeout(() => {
          setRateLimitTimers(prev => ({
            ...prev,
            [endpoint]: prev[endpoint] - 1
          }));
        }, 1000);
      }
    });
    
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [rateLimitTimers]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApiCall = async (endpoint: string, action: () => Promise<any>, requiresAuth: boolean = false) => {
    try {
      // Set loading state
      setResponses(prev => ({
        ...prev,
        [endpoint]: {
          data: null,
          timestamp: new Date().toISOString(),
          status: 'loading'
        }
      }));

      const result = await action();
      
      // Handle rate limit errors specifically
      if (result?.detail?.error === "Rate limit exceeded") {
        const retryAfter = result.detail.retry_after || 60;
        setRateLimitTimers(prev => ({
          ...prev,
          [endpoint]: retryAfter
        }));
        
        setResponses(prev => ({
          ...prev,
          [endpoint]: {
            data: result,
            timestamp: new Date().toISOString(),
            status: 'error'
          }
        }));
        
        toast.error(`Rate limit exceeded for ${endpoint}. Try again in ${retryAfter} seconds.`);
        return;
      }
      
      // Set success state
      setResponses(prev => ({
        ...prev,
        [endpoint]: {
          data: result,
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      }));
      
      toast.success(`${endpoint} executed successfully`);
    } catch (error: any) {
      console.error(`${endpoint} error:`, error);
      
      // Set error state
      setResponses(prev => ({
        ...prev,
        [endpoint]: {
          data: error.message || 'Unknown error',
          timestamp: new Date().toISOString(),
          status: 'error'
        }
      }));
      
      toast.error(`Failed to execute ${endpoint}: ${error.message || 'Unknown error'}`);
    }
  };

  const renderResponse = (endpoint: string) => {
    const response = responses[endpoint];
    if (!response) return null;

    if (response.status === 'loading') {
      return (
        <div className="flex items-center gap-2 text-blue-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }

    if (response.status === 'error') {
      return (
        <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-md">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span>Error</span>
          </div>
          <pre className="text-xs text-red-300 overflow-auto max-h-32">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      );
    }

    // Special visualization for health check endpoint
    if (endpoint === 'health' && response.data) {
      return (
        <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-md space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">System Health: {response.data.status}</span>
          </div>
          
          {/* System Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* CPU Usage */}
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">CPU Usage</span>
                <span className="text-xs font-mono text-white">{response.data.system?.cpu_usage_percent?.toFixed(1) || '0'}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${response.data.system?.cpu_usage_percent > 80 ? 'bg-red-500' : response.data.system?.cpu_usage_percent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(response.data.system?.cpu_usage_percent || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Memory Usage */}
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Memory Usage</span>
                <span className="text-xs font-mono text-white">{response.data.system?.memory_percent?.toFixed(1) || '0'}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${response.data.system?.memory_percent > 85 ? 'bg-red-500' : response.data.system?.memory_percent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(response.data.system?.memory_percent || 0, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {response.data.system?.memory_used_gb?.toFixed(1) || '0'}GB / {response.data.system?.memory_total_gb?.toFixed(1) || '0'}GB
              </div>
            </div>
            
            {/* Disk Usage */}
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Disk Usage</span>
                <span className="text-xs font-mono text-white">{response.data.system?.disk_percent?.toFixed(1) || '0'}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${response.data.system?.disk_percent > 90 ? 'bg-red-500' : response.data.system?.disk_percent > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(response.data.system?.disk_percent || 0, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {response.data.system?.disk_used_gb?.toFixed(1) || '0'}GB / {response.data.system?.disk_total_gb?.toFixed(1) || '0'}GB
              </div>
            </div>
            
            {/* Models Info */}
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">AI Models</span>
                <span className="text-xs font-mono text-white">{response.data.models?.total_trained || '0'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${response.data.models?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-slate-300">
                  {response.data.models?.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-slate-500 border-t border-slate-800/50 pt-2">
            Last updated: {new Date(response.data.timestamp).toLocaleString()}
          </div>
        </div>
      );
    }

    // Special visualization for auth status endpoint
    if (endpoint === 'authStatus' && response.data) {
      // Handle rate limit error
      if (response.data?.detail?.error === "Rate limit exceeded" && rateLimitTimers['authStatus'] > 0) {
        return (
          <div className="p-4 bg-red-900/30 border border-red-800/50 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Rate Limit Exceeded</span>
            </div>
            <p className="text-sm text-red-300">Too many requests. Please wait before trying again.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Retry after:</span>
              <span className="text-sm font-mono text-white">{rateLimitTimers['authStatus']} seconds</span>
            </div>
            <Progress value={100 - (rateLimitTimers['authStatus'] / 60) * 100} className="h-2" />
          </div>
        );
      }

      return (
        <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-md space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Rate Limit Status</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Current IP</div>
              <div className="text-sm font-mono text-white">{response.data.client_ip}</div>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Last Minute</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">{response.data.requests_last_minute} requests</span>
                <span className="text-xs text-slate-400">Limit: {response.data.limit_per_minute}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${response.data.requests_last_minute >= response.data.limit_per_minute ? 'bg-red-500' : response.data.requests_last_minute >= response.data.limit_per_minute * 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((response.data.requests_last_minute / response.data.limit_per_minute) * 100 || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Last Hour</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">{response.data.requests_last_hour} requests</span>
                <span className="text-xs text-slate-400">Limit: {response.data.limit_per_hour}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${response.data.requests_last_hour >= response.data.limit_per_hour ? 'bg-red-500' : response.data.requests_last_hour >= response.data.limit_per_hour * 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((response.data.requests_last_hour / response.data.limit_per_hour) * 100 || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Remaining Quota</div>
              <div className="text-sm text-white">
                Minute: <span className="font-mono">{response.data.remaining_minute}</span> | 
                Hour: <span className="font-mono">{response.data.remaining_hour}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default JSON visualization for other endpoints
    return (
      <div className="p-3 bg-green-900/30 border border-green-800/50 rounded-md">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <CheckCircle className="h-4 w-4" />
          <span>Success</span>
        </div>
        <pre className="text-xs text-green-300 overflow-auto max-h-64">
          {JSON.stringify(response.data, null, 2)}
        </pre>
      </div>
    );
  };

  const parseSymbols = (symbolsStr: string) => {
    return symbolsStr.split(',').map(s => s.trim()).filter(s => s);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-800/30">
        <h2 className="text-lg font-semibold text-white">API Endpoint Controls</h2>
        <p className="text-sm text-slate-400">Direct access to backend functionality with response visualization</p>
      </div>
      <div className="p-4 space-y-4">
        {/* Health & Auth Section */}
        <Collapsible 
          open={openSections.health} 
          onOpenChange={() => toggleSection('health')}
          className="border border-slate-800/50 rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-800/20 hover:bg-slate-800/40 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              {openSections.health ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium text-white">Health & Authentication</span>
              <Badge variant="secondary" className="ml-2">2 endpoints</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4 border-t border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span>Health Check</span>
                    <Badge variant="outline" className="text-xs">GET /tools/health</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-slate-400">System health and resource usage</p>
                  <Button
                    onClick={() => handleApiCall('health', () => apiService.health())}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Check Health
                  </Button>
                  {renderResponse('health')}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span>Auth Status</span>
                    <Badge variant="outline" className="text-xs">GET /auth/status</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-slate-400">Rate limit status for current IP</p>
                  <Button
                    onClick={() => handleApiCall('authStatus', () => apiService.authStatus())}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Check Auth Status
                  </Button>
                  {renderResponse('authStatus')}
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Analysis Section */}
        <Collapsible 
          open={openSections.analysis} 
          onOpenChange={() => toggleSection('analysis')}
          className="border border-slate-800/50 rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-800/20 hover:bg-slate-800/40 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              {openSections.analysis ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium text-white">Market Analysis</span>
              <Badge variant="secondary" className="ml-2">3 endpoints</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4 border-t border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Predict */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Generate Prediction
                    </span>
                    <Badge variant="outline" className="text-xs">POST /tools/predict</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="predictSymbols" className="text-xs text-slate-300">Symbols (comma separated)</Label>
                      <Input
                        id="predictSymbols"
                        value={formData.predictSymbols}
                        onChange={(e) => updateFormData('predictSymbols', e.target.value)}
                        placeholder="AAPL,GOOGL,MSFT"
                        className="text-xs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="predictHorizon" className="text-xs text-slate-300">Horizon</Label>
                        <Select value={formData.predictHorizon} onValueChange={(value) => updateFormData('predictHorizon', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intraday">Intraday</SelectItem>
                            <SelectItem value="short">Short Term</SelectItem>
                            <SelectItem value="long">Long Term</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="predictRiskProfile" className="text-xs text-slate-300">Risk Profile</Label>
                        <Select value={formData.predictRiskProfile} onValueChange={(value) => updateFormData('predictRiskProfile', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Select profile" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="predictStopLoss" className="text-xs text-slate-300">
                          Stop Loss: {formData.predictStopLoss}%
                        </Label>
                        <Slider
                          id="predictStopLoss"
                          min={0.1}
                          max={50}
                          step={0.1}
                          value={[formData.predictStopLoss]}
                          onValueChange={([value]) => updateFormData('predictStopLoss', value)}
                          className="h-4"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="predictCapitalRisk" className="text-xs text-slate-300">
                          Capital Risk: {formData.predictCapitalRisk}%
                        </Label>
                        <Slider
                          id="predictCapitalRisk"
                          min={0.1}
                          max={100}
                          step={0.1}
                          value={[formData.predictCapitalRisk]}
                          onValueChange={([value]) => updateFormData('predictCapitalRisk', value)}
                          className="h-4"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="predictDrawdownLimit" className="text-xs text-slate-300">
                          Drawdown Limit: {formData.predictDrawdownLimit}%
                        </Label>
                        <Slider
                          id="predictDrawdownLimit"
                          min={0.1}
                          max={100}
                          step={0.1}
                          value={[formData.predictDrawdownLimit]}
                          onValueChange={([value]) => updateFormData('predictDrawdownLimit', value)}
                          className="h-4"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleApiCall('predict', () => apiService.predict({
                      symbols: parseSymbols(formData.predictSymbols),
                      horizon: formData.predictHorizon,
                      risk_profile: formData.predictRiskProfile || undefined,
                      stop_loss_pct: formData.predictStopLoss,
                      capital_risk_pct: formData.predictCapitalRisk,
                      drawdown_limit_pct: formData.predictDrawdownLimit
                    }))}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Generate Prediction
                  </Button>
                  
                  {renderResponse('predict')}
                </CardContent>
              </Card>

              {/* Scan All */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Radar className="h-4 w-4" />
                      Scan Symbols
                    </span>
                    <Badge variant="outline" className="text-xs">POST /tools/scan_all</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="scanSymbols" className="text-xs text-slate-300">Symbols (comma separated)</Label>
                      <Input
                        id="scanSymbols"
                        value={formData.scanSymbols}
                        onChange={(e) => updateFormData('scanSymbols', e.target.value)}
                        placeholder="AAPL,GOOGL,MSFT"
                        className="text-xs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scanHorizon" className="text-xs text-slate-300">Horizon</Label>
                        <Select value={formData.scanHorizon} onValueChange={(value) => updateFormData('scanHorizon', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intraday">Intraday</SelectItem>
                            <SelectItem value="short">Short Term</SelectItem>
                            <SelectItem value="long">Long Term</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scanConfidence" className="text-xs text-slate-300">
                          Min Confidence: {formData.scanConfidence}
                        </Label>
                        <Slider
                          id="scanConfidence"
                          min={0}
                          max={1}
                          step={0.05}
                          value={[formData.scanConfidence]}
                          onValueChange={([value]) => updateFormData('scanConfidence', value)}
                          className="h-4"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scanStopLoss" className="text-xs text-slate-300">
                          Stop Loss: {formData.scanStopLoss}%
                        </Label>
                        <Slider
                          id="scanStopLoss"
                          min={0.1}
                          max={50}
                          step={0.1}
                          value={[formData.scanStopLoss]}
                          onValueChange={([value]) => updateFormData('scanStopLoss', value)}
                          className="h-4"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scanCapitalRisk" className="text-xs text-slate-300">
                          Capital Risk: {formData.scanCapitalRisk}%
                        </Label>
                        <Slider
                          id="scanCapitalRisk"
                          min={0.1}
                          max={100}
                          step={0.1}
                          value={[formData.scanCapitalRisk]}
                          onValueChange={([value]) => updateFormData('scanCapitalRisk', value)}
                          className="h-4"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleApiCall('scanAll', () => apiService.scanAll({
                      symbols: parseSymbols(formData.scanSymbols),
                      horizon: formData.scanHorizon,
                      min_confidence: formData.scanConfidence,
                      stop_loss_pct: formData.scanStopLoss,
                      capital_risk_pct: formData.scanCapitalRisk
                    }))}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Scan Symbols
                  </Button>
                  
                  {renderResponse('scanAll')}
                </CardContent>
              </Card>

              {/* Analyze */}
              <Card className="bg-slate-800/30 border-slate-700/50 md:col-span-2">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Analyze Symbol
                    </span>
                    <Badge variant="outline" className="text-xs">POST /tools/analyze</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analyzeSymbol" className="text-xs text-slate-300">Symbol</Label>
                      <Input
                        id="analyzeSymbol"
                        value={formData.analyzeSymbol}
                        onChange={(e) => updateFormData('analyzeSymbol', e.target.value)}
                        placeholder="AAPL"
                        className="text-xs"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Horizons</Label>
                      <div className="flex flex-wrap gap-2">
                        {['intraday', 'short', 'long'].map((horizon) => (
                          <div key={horizon} className="flex items-center space-x-1">
                            <Checkbox
                              id={`analyze-${horizon}`}
                              checked={formData.analyzeHorizons.includes(horizon)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFormData('analyzeHorizons', [...formData.analyzeHorizons, horizon]);
                                } else {
                                  updateFormData('analyzeHorizons', formData.analyzeHorizons.filter(h => h !== horizon));
                                }
                              }}
                            />
                            <Label htmlFor={`analyze-${horizon}`} className="text-xs text-slate-300 capitalize">
                              {horizon}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analyzeStopLoss" className="text-xs text-slate-300">
                        Stop Loss: {formData.analyzeStopLoss}%
                      </Label>
                      <Slider
                        id="analyzeStopLoss"
                        min={0.1}
                        max={50}
                        step={0.1}
                        value={[formData.analyzeStopLoss]}
                        onValueChange={([value]) => updateFormData('analyzeStopLoss', value)}
                        className="h-4"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="analyzeCapitalRisk" className="text-xs text-slate-300">
                        Capital Risk: {formData.analyzeCapitalRisk}%
                      </Label>
                      <Slider
                        id="analyzeCapitalRisk"
                        min={0.1}
                        max={100}
                        step={0.1}
                        value={[formData.analyzeCapitalRisk]}
                        onValueChange={([value]) => updateFormData('analyzeCapitalRisk', value)}
                        className="h-4"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="analyzeDrawdownLimit" className="text-xs text-slate-300">
                        Drawdown Limit: {formData.analyzeDrawdownLimit}%
                      </Label>
                      <Slider
                        id="analyzeDrawdownLimit"
                        min={0.1}
                        max={100}
                        step={0.1}
                        value={[formData.analyzeDrawdownLimit]}
                        onValueChange={([value]) => updateFormData('analyzeDrawdownLimit', value)}
                        className="h-4"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleApiCall('analyze', () => apiService.analyze({
                      symbol: formData.analyzeSymbol,
                      horizons: formData.analyzeHorizons,
                      stop_loss_pct: formData.analyzeStopLoss,
                      capital_risk_pct: formData.analyzeCapitalRisk,
                      drawdown_limit_pct: formData.analyzeDrawdownLimit
                    }))}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Analyze Symbol
                  </Button>
                  
                  {renderResponse('analyze')}
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Training Section */}
        <Collapsible 
          open={openSections.training} 
          onOpenChange={() => toggleSection('training')}
          className="border border-slate-800/50 rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-800/20 hover:bg-slate-800/40 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              {openSections.training ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium text-white">Training & Feedback</span>
              <Badge variant="secondary" className="ml-2">2 endpoints</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4 border-t border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Send Feedback */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Send Feedback
                    </span>
                    <Badge variant="outline" className="text-xs">POST /tools/feedback</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="feedbackSymbol" className="text-xs text-slate-300">Symbol</Label>
                        <Input
                          id="feedbackSymbol"
                          value={formData.feedbackSymbol}
                          onChange={(e) => updateFormData('feedbackSymbol', e.target.value)}
                          placeholder="AAPL"
                          className="text-xs"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="feedbackAction" className="text-xs text-slate-300">Predicted Action</Label>
                        <Select value={formData.feedbackAction} onValueChange={(value) => updateFormData('feedbackAction', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LONG">Long</SelectItem>
                            <SelectItem value="SHORT">Short</SelectItem>
                            <SelectItem value="HOLD">Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-300">Feedback Response</Label>
                      <RadioGroup 
                        value={formData.feedbackResponse} 
                        onValueChange={(value) => updateFormData('feedbackResponse', value)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="correct" id="correct" />
                          <Label htmlFor="correct" className="text-xs text-slate-300">Correct</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="incorrect" id="incorrect" />
                          <Label htmlFor="incorrect" className="text-xs text-slate-300">Incorrect</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedbackActualReturn" className="text-xs text-slate-300">Actual Return (%)</Label>
                      <Input
                        id="feedbackActualReturn"
                        type="number"
                        value={formData.feedbackActualReturn}
                        onChange={(e) => updateFormData('feedbackActualReturn', e.target.value)}
                        placeholder="-2.5"
                        className="text-xs"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedbackMessage" className="text-xs text-slate-300">Feedback Message</Label>
                      <Textarea
                        id="feedbackMessage"
                        value={formData.feedbackMessage}
                        onChange={(e) => updateFormData('feedbackMessage', e.target.value)}
                        placeholder="Provide detailed feedback to improve predictions..."
                        className="text-xs"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleApiCall('sendFeedback', () => apiService.sendFeedback({
                      symbol: formData.feedbackSymbol,
                      predicted_action: formData.feedbackAction,
                      user_feedback: formData.feedbackResponse,
                      actual_return: formData.feedbackActualReturn ? parseFloat(formData.feedbackActualReturn) : undefined,
                      message: formData.feedbackMessage || undefined
                    }))}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Send Feedback
                  </Button>
                  
                  {renderResponse('sendFeedback')}
                </CardContent>
              </Card>

              {/* Train RL */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Train RL Agent
                    </span>
                    <Badge variant="outline" className="text-xs">POST /tools/train_rl</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trainSymbol" className="text-xs text-slate-300">Symbol</Label>
                        <Input
                          id="trainSymbol"
                          value={formData.trainSymbol}
                          onChange={(e) => updateFormData('trainSymbol', e.target.value)}
                          placeholder="AAPL"
                          className="text-xs"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="trainHorizon" className="text-xs text-slate-300">Horizon</Label>
                        <Select value={formData.trainHorizon} onValueChange={(value) => updateFormData('trainHorizon', value)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intraday">Intraday</SelectItem>
                            <SelectItem value="short">Short Term</SelectItem>
                            <SelectItem value="long">Long Term</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trainEpisodes" className="text-xs text-slate-300">
                        Episodes: {formData.trainEpisodes}
                      </Label>
                      <Slider
                        id="trainEpisodes"
                        min={10}
                        max={100}
                        step={1}
                        value={[formData.trainEpisodes]}
                        onValueChange={([value]) => updateFormData('trainEpisodes', value)}
                        className="h-4"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="trainForceRetrain"
                        checked={formData.trainForceRetrain}
                        onCheckedChange={(checked) => updateFormData('trainForceRetrain', checked)}
                      />
                      <Label htmlFor="trainForceRetrain" className="text-xs text-slate-300">Force Retrain</Label>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleApiCall('trainRL', () => apiService.trainRL({
                      symbol: formData.trainSymbol,
                      horizon: formData.trainHorizon,
                      n_episodes: formData.trainEpisodes,
                      force_retrain: formData.trainForceRetrain
                    }))}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Train RL Agent
                  </Button>
                  
                  {renderResponse('trainRL')}
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Data Section */}
        <Collapsible 
          open={openSections.data} 
          onOpenChange={() => toggleSection('data')}
          className="border border-slate-800/50 rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-800/20 hover:bg-slate-800/40 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              {openSections.data ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium text-white">Data Operations</span>
              <Badge variant="secondary" className="ml-2">1 endpoint</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4 border-t border-slate-800/50">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Fetch Batch Data
                  </span>
                  <Badge variant="outline" className="text-xs">POST /tools/fetch_data</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fetchDataSymbols" className="text-xs text-slate-300">Symbols (comma separated)</Label>
                    <Input
                      id="fetchDataSymbols"
                      value={formData.fetchDataSymbols}
                      onChange={(e) => updateFormData('fetchDataSymbols', e.target.value)}
                      placeholder="AAPL,GOOGL,MSFT"
                      className="text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fetchDataPeriod" className="text-xs text-slate-300">Period</Label>
                    <Select value={formData.fetchDataPeriod} onValueChange={(value) => updateFormData('fetchDataPeriod', value)}>
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="5d">5 Days</SelectItem>
                        <SelectItem value="1mo">1 Month</SelectItem>
                        <SelectItem value="3mo">3 Months</SelectItem>
                        <SelectItem value="6mo">6 Months</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="2y">2 Years</SelectItem>
                        <SelectItem value="5y">5 Years</SelectItem>
                        <SelectItem value="ytd">YTD</SelectItem>
                        <SelectItem value="max">Max</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="fetchDataIncludeFeatures"
                      checked={formData.fetchDataIncludeFeatures}
                      onCheckedChange={(checked) => updateFormData('fetchDataIncludeFeatures', checked)}
                    />
                    <Label htmlFor="fetchDataIncludeFeatures" className="text-xs text-slate-300">Include Features</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="fetchDataRefresh"
                      checked={formData.fetchDataRefresh}
                      onCheckedChange={(checked) => updateFormData('fetchDataRefresh', checked)}
                    />
                    <Label htmlFor="fetchDataRefresh" className="text-xs text-slate-300">Force Refresh</Label>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleApiCall('fetchData', () => apiService.fetchData({
                    symbols: parseSymbols(formData.fetchDataSymbols),
                    period: formData.fetchDataPeriod,
                    include_features: formData.fetchDataIncludeFeatures,
                    refresh: formData.fetchDataRefresh
                  }))}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Fetch Batch Data
                </Button>
                
                {renderResponse('fetchData')}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}