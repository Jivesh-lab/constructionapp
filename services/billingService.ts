import { Invoice, InvoiceLineItem, Party } from '../types';

export const GST_SLABS = [5, 12, 18, 28];
export const HSN_CONSTRUCTION = {
  '9954': 'Composite supply of works contract',
  '2523': 'Cement',
  '7214': 'Steel reinforcement bars',
  '9985': 'Labour services'
};

export const billingService = {
  calculateLineItem: (
    quantity: number, 
    rate: number, 
    gstRate: number, 
    isInterState: boolean
  ) => {
    const taxable = quantity * rate;
    const taxTotal = (taxable * gstRate) / 100;
    
    return {
      taxableAmount: taxable,
      cgst: isInterState ? 0 : taxTotal / 2,
      sgst: isInterState ? 0 : taxTotal / 2,
      igst: isInterState ? taxTotal : 0,
      total: taxable + taxTotal
    };
  },

  validateGSTIN: (gstin: string) => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gstin);
  },

  generateInvoiceSummary: (
    items: InvoiceLineItem[], 
    retentionPercent: number = 0, 
    advanceAdjustment: number = 0
  ) => {
    const totalTaxable = items.reduce((s, i) => s + i.taxableAmount, 0);
    const totalCgst = items.reduce((s, i) => s + i.cgst, 0);
    const totalSgst = items.reduce((s, i) => s + i.sgst, 0);
    const totalIgst = items.reduce((s, i) => s + i.igst, 0);
    
    const grossTotal = totalTaxable + totalCgst + totalSgst + totalIgst;
    const retention = (grossTotal * retentionPercent) / 100;
    
    return {
      totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      retentionAmount: retention,
      advanceAdjustment,
      totalAmount: grossTotal - retention - advanceAdjustment
    };
  }
};
