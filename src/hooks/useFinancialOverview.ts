
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FinancialOverview {
  total_revenue: number;
  total_provider_payouts: number;
  total_expenses: number;
  admin_profit: number;
}

export interface BusinessExpense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
  created_by: string;
  created_at: string;
}

export const useFinancialOverview = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFinancialOverview = async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_financial_overview', {
        start_date: startDate || null,
        end_date: endDate || null
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setOverview(data[0]);
      }
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      toast({
        title: "Error",
        description: "Failed to load financial overview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    }
  };

  const addExpense = async (expense: {
    amount: number;
    category: string;
    description?: string;
    expense_date: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('business_expenses')
        .insert([{
          ...expense,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense added successfully",
      });

      // Refresh data
      await Promise.all([fetchExpenses(), fetchFinancialOverview()]);
      
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('business_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });

      // Refresh data
      await Promise.all([fetchExpenses(), fetchFinancialOverview()]);
      
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFinancialOverview();
    fetchExpenses();
  }, []);

  return {
    overview,
    expenses,
    isLoading,
    fetchFinancialOverview,
    addExpense,
    deleteExpense,
    refreshData: () => Promise.all([fetchFinancialOverview(), fetchExpenses()])
  };
};
