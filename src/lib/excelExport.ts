import * as XLSX from 'xlsx';
import { Earning, Expense } from '../types';

export interface LedgerEntry {
  Date: string;
  Description: string;
  Type: 'Income (Credit)' | 'Expense (Debit)';
  CategoryOrPurpose: string;
  PaymentMode: string;
  ReferenceNo: string;
  CreditAmount: number | string;
  DebitAmount: number | string;
  Balance: number;
}

export function exportFinanceLedgerToExcel(earnings: Earning[], expenses: Expense[]): void {
  // Combine earnings and expenses chronologically
  const items: Array<{
    date: string;
    rawDate: number;
    description: string;
    type: 'Income' | 'Expense';
    category: string;
    mode: string;
    ref: string;
    credit: number;
    debit: number;
  }> = [];

  earnings.forEach(e => {
    const parts = e.date.split('/');
    const d = parts.length === 3 ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime() : Date.now();
    items.push({
      date: e.date,
      rawDate: d,
      description: `${e.purpose}: ${e.advocateName} (${e.barNo}) - ${e.notes || ''}`,
      type: 'Income',
      category: e.purpose,
      mode: e.mode,
      ref: e.txnId,
      credit: e.amount,
      debit: 0
    });
  });

  expenses.forEach(ex => {
    const parts = ex.date.split('/');
    const d = parts.length === 3 ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime() : Date.now();
    items.push({
      date: ex.date,
      rawDate: d,
      description: ex.purposeTitle,
      type: 'Expense',
      category: ex.category,
      mode: ex.mode,
      ref: ex.id,
      credit: 0,
      debit: ex.amount
    });
  });

  // Sort by date ascending for running ledger balance
  items.sort((a, b) => a.rawDate - b.rawDate);

  let runningBalance = 0;
  const ledgerData: LedgerEntry[] = items.map(item => {
    if (item.type === 'Income') {
      runningBalance += item.credit;
    } else {
      runningBalance -= item.debit;
    }

    return {
      Date: item.date,
      Description: item.description,
      Type: item.type === 'Income' ? 'Income (Credit)' : 'Expense (Debit)',
      CategoryOrPurpose: item.category,
      PaymentMode: item.mode,
      ReferenceNo: item.ref,
      CreditAmount: item.credit > 0 ? item.credit : '-',
      DebitAmount: item.debit > 0 ? item.debit : '-',
      Balance: runningBalance
    };
  });

  // Calculate totals
  const totalCredit = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDebit = expenses.reduce((sum, ex) => sum + ex.amount, 0);
  const netBalance = totalCredit - totalDebit;

  ledgerData.push({
    Date: 'TOTAL',
    Description: 'TOTAL CONSOLIDATED ACCOUNT SUMMARY',
    Type: 'Income (Credit)',
    CategoryOrPurpose: 'ALL',
    PaymentMode: 'ALL',
    ReferenceNo: 'FINAL',
    CreditAmount: totalCredit,
    DebitAmount: totalDebit,
    Balance: netBalance
  });

  const worksheet = XLSX.utils.json_to_sheet(ledgerData);

  // Auto-set column widths
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 45 }, // Description
    { wch: 18 }, // Type
    { wch: 18 }, // Category
    { wch: 14 }, // Mode
    { wch: 22 }, // Ref
    { wch: 16 }, // Credit
    { wch: 16 }, // Debit
    { wch: 18 }  // Balance
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ballia_Bar_Ledger');

  XLSX.writeFile(workbook, `Ballia_Bar_Association_Finance_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
