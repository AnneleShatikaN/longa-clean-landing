
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAutomatedPayouts } from '@/hooks/useAutomatedPayouts';
import { Settings, Play, Pause, CheckCircle, Clock, AlertCircle, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';

export const AutomatedPayoutManager: React.FC = () => {
  const {
    payoutRules,
    automatedBatches,
    isLoading,
    fetchPayoutRules,
    fetchAutomatedBatches,
    createPayoutRule,
    updatePayoutRule,
    deletePayoutRule,
    triggerAutomatedPayouts,
    approveBatch
  } = useAutomatedPayouts();

  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    minimum_payout_amount: 50,
    payout_frequency: 'weekly',
    payout_day: 5,
    auto_approve_under_amount: 500,
    performance_bonus_enabled: false,
    performance_bonus_threshold: 4.5,
    performance_bonus_percentage: 5,
    is_active: true
  });

  useEffect(() => {
    fetchPayoutRules();
    fetchAutomatedBatches();
  }, [fetchPayoutRules, fetchAutomatedBatches]);

  const handleCreateRule = async () => {
    const result = await createPayoutRule(newRule);
    if (result.success) {
      setIsCreateRuleOpen(false);
      setNewRule({
        rule_name: '',
        minimum_payout_amount: 50,
        payout_frequency: 'weekly',
        payout_day: 5,
        auto_approve_under_amount: 500,
        performance_bonus_enabled: false,
        performance_bonus_threshold: 4.5,
        performance_bonus_percentage: 5,
        is_active: true
      });
    }
  };

  const handleUpdateRule = async (ruleId: string, updates: any) => {
    await updatePayoutRule(ruleId, updates);
    setEditingRule(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payoutRules.filter(rule => rule.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {payoutRules.length} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Batches</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automatedBatches.filter(batch => batch.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automated Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              N${automatedBatches.reduce((sum, batch) => sum + batch.total_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={triggerAutomatedPayouts} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Trigger Automated Payouts
            </Button>
            <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Payout Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Automated Payout Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rule_name">Rule Name</Label>
                    <Input
                      id="rule_name"
                      value={newRule.rule_name}
                      onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                      placeholder="Enter rule name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minimum_amount">Minimum Payout Amount (N$)</Label>
                    <Input
                      id="minimum_amount"
                      type="number"
                      value={newRule.minimum_payout_amount}
                      onChange={(e) => setNewRule({ ...newRule, minimum_payout_amount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">Payout Frequency</Label>
                    <Select 
                      value={newRule.payout_frequency} 
                      onValueChange={(value) => setNewRule({ ...newRule, payout_frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="auto_approve">Auto-approve Under (N$)</Label>
                    <Input
                      id="auto_approve"
                      type="number"
                      value={newRule.auto_approve_under_amount}
                      onChange={(e) => setNewRule({ ...newRule, auto_approve_under_amount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="performance_bonus"
                      checked={newRule.performance_bonus_enabled}
                      onCheckedChange={(checked) => setNewRule({ ...newRule, performance_bonus_enabled: checked })}
                    />
                    <Label htmlFor="performance_bonus">Enable Performance Bonus</Label>
                  </div>

                  {newRule.performance_bonus_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bonus_threshold">Rating Threshold</Label>
                        <Input
                          id="bonus_threshold"
                          type="number"
                          step="0.1"
                          value={newRule.performance_bonus_threshold}
                          onChange={(e) => setNewRule({ ...newRule, performance_bonus_threshold: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bonus_percentage">Bonus %</Label>
                        <Input
                          id="bonus_percentage"
                          type="number"
                          value={newRule.performance_bonus_percentage}
                          onChange={(e) => setNewRule({ ...newRule, performance_bonus_percentage: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateRuleOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRule}>Create Rule</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Payout Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Payout Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Min Amount</TableHead>
                <TableHead>Auto Approve Under</TableHead>
                <TableHead>Performance Bonus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.rule_name}</TableCell>
                  <TableCell>{rule.payout_frequency}</TableCell>
                  <TableCell>N${rule.minimum_payout_amount}</TableCell>
                  <TableCell>N${rule.auto_approve_under_amount}</TableCell>
                  <TableCell>
                    {rule.performance_bonus_enabled ? (
                      <Badge variant="outline">
                        {rule.performance_bonus_percentage}% @ {rule.performance_bonus_threshold}★
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Disabled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateRule(rule.id, { is_active: !rule.is_active })}
                      >
                        {rule.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Automated Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automated Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payout Count</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automatedBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_name}</TableCell>
                  <TableCell>{batch.batch_type}</TableCell>
                  <TableCell>{batch.payout_count}</TableCell>
                  <TableCell className="font-medium">N${batch.total_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(batch.status)}
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(batch.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {batch.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveBatch(batch.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
