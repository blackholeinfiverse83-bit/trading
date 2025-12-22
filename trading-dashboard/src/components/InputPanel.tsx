import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings2, ShieldAlert, Target, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { apiService } from '../services/api';
import { toast } from 'sonner@2.0.3';

export function InputPanel() {
  const [stopLoss, setStopLoss] = useState(2);
  const [targetProfit, setTargetProfit] = useState(5);
  const [amount, setAmount] = useState('1000');
  const [riskMode, setRiskMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExecute = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiService.confirmTrade({
        stopLoss,
        targetProfit,
        amount: parseFloat(amount),
        riskMode
      });
      
      if (response.success) {
        toast.success('Trade parameters confirmed', {
          description: `Amount: $${amount} | SL: ${stopLoss}% | TP: ${targetProfit}%${response.trade_id ? ` | ID: ${response.trade_id}` : ''}`
        });
      } else {
        toast.error(response.message || 'Failed to confirm trade');
      }
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: error.response?.data?.message || 'Backend connection error'
      });
      // Silently handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/50 bg-slate-800/30">
        <h2 className="text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Input Panel
        </h2>
        <p className="text-sm text-slate-400 mt-1">Configure trade parameters</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label className="text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Trade Amount (USD)
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        {/* Stop Loss */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Stop Loss %
            </Label>
            <span className="text-white px-2 py-1 bg-red-500/20 rounded text-sm">
              {stopLoss}%
            </span>
          </div>
          <Slider
            value={[stopLoss]}
            onValueChange={(value) => setStopLoss(value[0])}
            min={0.5}
            max={10}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5%</span>
            <span>10%</span>
          </div>
        </div>

        {/* Target Profit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Profit %
            </Label>
            <span className="text-white px-2 py-1 bg-green-500/20 rounded text-sm">
              {targetProfit}%
            </span>
          </div>
          <Slider
            value={[targetProfit]}
            onValueChange={(value) => setTargetProfit(value[0])}
            min={1}
            max={20}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Risk Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="space-y-0.5">
            <Label className="text-slate-300">Aggressive Risk Mode</Label>
            <p className="text-xs text-slate-500">Enable higher risk tolerance</p>
          </div>
          <Switch
            checked={riskMode}
            onCheckedChange={setRiskMode}
          />
        </div>

        {/* Execute Button */}
        <Button
          onClick={handleExecute}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⟳
            </motion.div>
          ) : (
            'Confirm Parameters'
          )}
        </Button>

        {/* Risk Summary */}
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Max Loss</span>
            <span className="text-red-400">-${(parseFloat(amount || '0') * stopLoss / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Gain</span>
            <span className="text-green-400">+${(parseFloat(amount || '0') * targetProfit / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-700/50">
            <span className="text-slate-400">Risk/Reward</span>
            <span className="text-white">1:{(targetProfit / stopLoss).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}