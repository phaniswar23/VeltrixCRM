import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  Trash2,
  Building,
  Calendar,
  X,
  FileText,
  ChevronRight,
  Eye,
  HelpCircle,
  Send,
  CreditCard,
  Check,
  Download,
  Info,
  RotateCcw,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  CheckSquare,
  Square,
  Filter,
  CalendarRange,
  Briefcase,
} from 'lucide-react';

// Indian currency numbering formatter: 1158200 -> "11,58,200"
export const formatINR = (amount = 0) => {
  const num = Math.round(Number(amount) || 0);
  return num.toLocaleString('en-IN');
};

// Formal Indian words conversion for GST tax invoice receipts
export const numberToIndianWords = (num = 0) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  num = Math.floor(Number(num) || 0);
  if (num === 0) return 'Zero Rupees Only';
  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }
  return 'Rupees ' + inWords(num).trim() + ' Only';
};

// Clean Indian business date formatter: "16 Nov 2026"
export const formatIndianDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Build standalone, executive print HTML for single invoice or bulk array
export const generateInvoicePrintHtml = (invOrArray) => {
  const invoiceList = Array.isArray(invOrArray) ? invOrArray : [invOrArray];
  if (invoiceList.length === 0) return '';

  const renderSingleInvoiceWrapper = (inv, idx, totalCount) => {
    const customer = inv.customer_id || {};
    const items =
      inv.items && inv.items.length > 0
        ? inv.items
        : [
            {
              description: 'Professional Enterprise Services & Implementation',
              quantity: 1,
              unit_price: inv.subtotal || inv.grand_total,
              total: inv.subtotal || inv.grand_total,
            },
          ];
    const subtotal = inv.subtotal || 0;
    const taxAmount = inv.tax_amount || 0;
    const discount = inv.discount || 0;
    const grandTotal = inv.grand_total || 0;
    const cgst = Math.round(taxAmount / 2);
    const sgst = Math.round(taxAmount / 2);

    const itemsRows = items
      .map(
        (item, i) => `
      <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#FAFAF8'};">
        <td style="padding: 10px 12px; text-align: center; border-bottom: 1px solid #E5E2DC; font-family: monospace; font-size: 11px; color: #706F6C;">${i + 1}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #E5E2DC; font-weight: 700; font-size: 12px; color: #1A1A1A;">
          ${item.description || 'Deliverable / Service'}
          <div style="font-size: 10px; font-weight: 400; color: #706F6C; margin-top: 2px;">SAC / HSN Code: 998313 &bull; Enterprise CRM Services</div>
        </td>
        <td style="padding: 10px 10px; text-align: center; border-bottom: 1px solid #E5E2DC; font-family: monospace; font-size: 11px; color: #706F6C;">998313</td>
        <td style="padding: 10px 10px; text-align: center; border-bottom: 1px solid #E5E2DC; font-weight: 600; font-size: 12px;">${item.quantity || 1}</td>
        <td style="padding: 10px 14px; text-align: right; border-bottom: 1px solid #E5E2DC; font-family: monospace; font-size: 12px; color: #1A1A1A;">₹${formatINR(item.unit_price)}</td>
        <td style="padding: 10px 14px; text-align: right; border-bottom: 1px solid #E5E2DC; font-family: monospace; font-weight: 800; font-size: 12px; color: #1A1A1A;">₹${formatINR(item.total)}</td>
      </tr>
    `
      )
      .join('');

    return `
    <div class="invoice-wrapper ${idx < totalCount - 1 ? 'page-break' : ''}">
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td style="vertical-align: top;">
            <div class="brand-logo">
              <span class="brand-icon">V</span>
              <span>VELTRIX CRM</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #1A1A1A; margin-top: 4px;">
              Veltrix Technologies Private Limited
            </div>
            <div style="font-size: 10px; color: #555451; margin-top: 1px;">
              GSTIN: <strong>27AABCV1234F1Z8</strong> &bull; PAN: <strong>AABCV1234F</strong> &bull; CIN: U72900MH2024PTC123456
            </div>
            <div style="font-size: 10px; color: #555451;">
              Corporate Headquarters: Level 14, Tower B, Bandra Kurla Complex (BKC), Mumbai 400051, MH, India
            </div>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <span class="tax-badge">TAX INVOICE</span>
            <div style="font-family: monospace; font-size: 15px; font-weight: 900; color: #1A1A1A; margin-top: 4px;">
              #${inv.invoice_number}
            </div>
            <div style="font-size: 10.5px; color: #555451; margin-top: 3px;">
              Invoice Date: <strong>${formatIndianDate(inv.createdAt)}</strong>
            </div>
            <div style="font-size: 10.5px; color: #555451;">
              Payment Due Date: <strong>${formatIndianDate(inv.due_date)}</strong>
            </div>
            <div style="font-size: 10.5px; margin-top: 3px;">
              Status: <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 9.5px; font-family: monospace; text-transform: uppercase; background: ${inv.status === 'paid' ? '#E6F4EA; color: #137333; border: 1px solid #CEEAD6;' : '#FEF7E0; color: #B06000; border: 1px solid #FEEFC3;'}">${inv.status || 'DRAFT'}</span>
            </div>
          </td>
        </tr>
      </table>

      <!-- Parties Grid (Billed To & Invoice Specifics) -->
      <table class="parties-grid">
        <tr>
          <td class="party-card" style="width: 55%; padding-right: 14px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #706F6C;">
              Billed To (Customer / Client):
            </div>
            <div style="font-size: 14px; font-weight: 900; color: #1A1A1A; margin-top: 3px;">
              ${customer.name || 'Customer Account'}
            </div>
            ${customer.company ? `<div style="font-size: 11.5px; font-weight: 700; color: #2D3A2D; margin-top: 1px;">${customer.company}</div>` : ''}
            <div style="font-size: 10.5px; color: #555451; margin-top: 2px;">
              ${customer.email ? `Email: ${customer.email}` : ''} ${customer.phone ? `&bull; Phone: ${customer.phone}` : ''}
            </div>
            <div style="font-size: 10px; color: #706F6C; margin-top: 3px;">
              Place of Supply: <strong>Maharashtra (State Code: 27)</strong>
            </div>
          </td>

          <td style="width: 3%;"></td>

          <td class="party-card" style="width: 42%;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #706F6C;">
              Remittance & Invoice Metadata:
            </div>
            <div style="font-size: 10.5px; color: #1A1A1A; margin-top: 4px;">
              Billing Currency: <strong>Indian Rupee (INR &bull; ₹)</strong>
            </div>
            <div style="font-size: 10.5px; color: #1A1A1A; margin-top: 2px;">
              Tax Jurisdiction: <strong>Interstate / CGST + SGST Act</strong>
            </div>
            <div style="font-size: 10.5px; color: #1A1A1A; margin-top: 2px;">
              Payment Method: <strong>Direct Bank Wire / NEFT / RTGS / UPI</strong>
            </div>
            <div style="font-size: 10px; color: #706F6C; margin-top: 2px;">
              Reverse Charge Mechanism: <strong>No</strong>
            </div>
          </td>
        </tr>
      </table>

      <!-- Line Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th>Description of Deliverables / Services</th>
            <th style="width: 75px; text-align: center;">HSN / SAC</th>
            <th style="width: 45px; text-align: center;">Qty</th>
            <th style="width: 100px; text-align: right;">Unit Rate (₹)</th>
            <th style="width: 110px; text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Financial Calculation & Remittance Box -->
      <table style="width: 100%; margin-bottom: 16px;">
        <tr>
          <td style="width: 53%; vertical-align: top; padding-right: 16px;">
            <!-- Words Box -->
            <div style="background: #FAF9F6; border: 1px solid #E5E2DC; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px;">
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #706F6C;">
                Total Invoice Amount in Words:
              </div>
              <div style="font-size: 11.5px; font-weight: 800; color: #1A1A1A; margin-top: 2px; line-height: 1.35;">
                ${numberToIndianWords(grandTotal)}
              </div>
            </div>

            <!-- Bank Box -->
            <div style="background: #ffffff; border: 1px dashed #B8B5AD; border-radius: 8px; padding: 10px 12px; font-size: 10px; color: #4A4946; line-height: 1.45;">
              <div style="font-weight: 800; color: #1A1A1A; margin-bottom: 3px;">
                Bank Remittance Instructions:
              </div>
              Bank Name: <strong>HDFC Bank Ltd</strong> &bull; Branch: <strong>BKC Mumbai Main</strong><br/>
              Account Name: <strong>Veltrix Technologies Pvt Ltd</strong><br/>
              Current A/C No: <strong>50200012345678</strong> &bull; IFSC Code: <strong>HDFC0000128</strong><br/>
              Instant UPI Payment VPA: <strong>veltrix@hdfcbank</strong>
            </div>
          </td>

          <td style="width: 47%; vertical-align: top;">
            <div style="background: #FAF9F6; border: 1.5px solid #E5E2DC; border-radius: 8px; padding: 12px 14px;">
              <div class="calc-row">
                <span>Taxable Value (Subtotal):</span>
                <span style="font-family: monospace; font-weight: 700; color: #1A1A1A;">₹${formatINR(subtotal)}</span>
              </div>
              <div class="calc-row">
                <span>Central GST (CGST @ 9%):</span>
                <span style="font-family: monospace; font-weight: 700; color: #1A1A1A;">₹${formatINR(cgst)}</span>
              </div>
              <div class="calc-row">
                <span>State GST (SGST @ 9%):</span>
                <span style="font-family: monospace; font-weight: 700; color: #1A1A1A;">₹${formatINR(sgst)}</span>
              </div>
              ${
                discount > 0
                  ? `<div class="calc-row" style="color: #047857;">
                      <span>Contractual Discount:</span>
                      <span style="font-family: monospace; font-weight: 700;">-₹${formatINR(discount)}</span>
                    </div>`
                  : ''
              }
              <div class="calc-row grand">
                <span>Total Invoice Amount:</span>
                <span style="font-family: monospace; color: #1A1A1A;">₹${formatINR(grandTotal)}</span>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Terms and Authorized Signatory -->
      <table style="width: 100%; border-top: 1.5px solid #E5E2DC; padding-top: 12px;">
        <tr>
          <td style="width: 62%; vertical-align: top; font-size: 9.5px; color: #706F6C; line-height: 1.4;">
            <div style="font-weight: 800; color: #1A1A1A; margin-bottom: 2px;">
              Terms & Conditions:
            </div>
            1. ${inv.notes || 'Payment is due within 14 calendar days from the invoice issue date.'}<br/>
            2. Late remittances are subject to statutory interest at 18% per annum under the MSMED Act.<br/>
            3. Subject to Mumbai, Maharashtra jurisdiction only.<br/>
            <em style="display: block; margin-top: 3px; font-size: 9px; color: #8C8A84;">
              This is an electronically generated and digitally signed GST tax invoice issued by Veltrix Technologies Pvt Ltd.
            </em>
          </td>

          <td style="width: 38%; text-align: right; vertical-align: top;">
            <div style="height: 38px; border-bottom: 1.5px solid #2D3A2D; width: 140px; margin-left: auto; display: flex; align-items: flex-end; justify-content: center;">
              <span style="font-size: 9px; font-family: monospace; color: #8C8A84; padding-bottom: 2px;">[Digital Verification]</span>
            </div>
            <div style="font-size: 10.5px; font-weight: 800; color: #1A1A1A; margin-top: 4px;">
              Authorized Signatory
            </div>
            <div style="font-size: 9px; color: #706F6C;">
              For Veltrix Technologies Private Limited
            </div>
          </td>
        </tr>
      </table>
    </div>`;
  };

  const allInvoicesBody = invoiceList
    .map((inv, idx) => renderSingleInvoiceWrapper(inv, idx, invoiceList.length))
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Tax Invoices (${invoiceList.length})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 10mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #ffffff;
      color: #1A1A1A;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11.5px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .invoice-wrapper {
      width: 100%;
      max-width: 100%;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .invoice-wrapper.page-break {
      page-break-after: always !important;
      break-after: page !important;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #2D3A2D;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand-logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #1A1A1A;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .brand-icon {
      display: inline-block;
      width: 26px;
      height: 26px;
      background: #2D3A2D;
      color: #ffffff;
      font-size: 14px;
      font-weight: 900;
      line-height: 26px;
      text-align: center;
      border-radius: 6px;
    }
    .tax-badge {
      display: inline-block;
      background: #2D3A2D;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .parties-grid {
      width: 100%;
      margin-bottom: 16px;
    }
    .party-card {
      background: #FAF9F6;
      border: 1px solid #E5E2DC;
      border-radius: 8px;
      padding: 12px 14px;
      vertical-align: top;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #2D3A2D;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .items-table th {
      background: #2D3A2D;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 8px 12px;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 3.5px 0;
      font-size: 11px;
      color: #555451;
    }
    .calc-row.grand {
      border-top: 2px solid #2D3A2D;
      padding-top: 8px;
      margin-top: 5px;
      font-size: 15px;
      font-weight: 900;
      color: #1A1A1A;
    }
  </style>
</head>
<body>
  ${allInvoicesBody}
</body>
</html>`;
};

const InvoicesPage = () => {
  const { user } = useAuth();
  const { addEventListener } = useRealtime();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showWhyHelp, setShowWhyHelp] = useState(false);

  // Multi-select & Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting state
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [inspectInvoice, setInspectInvoice] = useState(null);

  // Form state for New Invoice
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    currency: 'INR',
    tax_rate: 18,
    discount: 0,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Payment is due within 14 days of invoice date. Bank transfer or UPI accepted.',
    items: [{ description: 'Enterprise CRM Implementation & Support', quantity: 1, unit_price: 95000 }],
  });

  // Form state for Editing an Existing Invoice
  const [editFormData, setEditFormData] = useState({
    customer_id: '',
    currency: 'INR',
    tax_rate: 18,
    discount: 0,
    due_date: '',
    status: 'draft',
    notes: '',
    items: [],
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (customerFilter) params.customer_id = customerFilter;
      if (search) params.search = search;

      const res = await api.get('/invoices', { params });
      setInvoices(res.data?.invoices || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data?.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [statusFilter, customerFilter]);

  // Subscribe to real-time events
  useEffect(() => {
    const unsub1 = addEventListener('INVOICE_CREATED', () => fetchInvoices());
    const unsub2 = addEventListener('INVOICE_UPDATED', () => fetchInvoices());
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
    };
  }, [addEventListener]);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = field === 'description' ? value : Number(value);
    setFormData({ ...formData, items: updated });
  };

  // Live calculation for create modal
  const subtotal = formData.items.reduce(
    (acc, curr) => acc + (curr.quantity || 0) * (curr.unit_price || 0),
    0
  );
  const discountVal = Number(formData.discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const taxAmount = (taxableAmount * (Number(formData.tax_rate) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }

    try {
      await api.post('/invoices', formData);
      setIsCreateOpen(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  // Edit Invoice Handlers
  const handleOpenEdit = (inv) => {
    if (!inv) return;
    setEditingInvoice(inv);
    const dueDateStr = inv.due_date ? new Date(inv.due_date).toISOString().split('T')[0] : '';
    setEditFormData({
      customer_id: inv.customer_id?._id || inv.customer_id || '',
      currency: inv.currency || 'INR',
      tax_rate: inv.tax_rate !== undefined ? inv.tax_rate : 18,
      discount: inv.discount !== undefined ? inv.discount : 0,
      due_date: dueDateStr,
      status: inv.status || 'draft',
      notes: inv.notes || '',
      items:
        inv.items && inv.items.length > 0
          ? inv.items.map((it) => ({
              description: it.description || '',
              quantity: it.quantity || 1,
              unit_price: it.unit_price || 0,
            }))
          : [
              {
                description: 'Enterprise CRM Implementation & Support',
                quantity: 1,
                unit_price: inv.grand_total || 0,
              },
            ],
    });
    setIsEditOpen(true);
  };

  const handleAddEditItem = () => {
    setEditFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const handleRemoveEditItem = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleEditItemChange = (index, field, value) => {
    const updated = [...editFormData.items];
    updated[index][field] = field === 'description' ? value : Number(value);
    setEditFormData({ ...editFormData, items: updated });
  };

  // Live calculation for Edit modal
  const editSubtotal = (editFormData.items || []).reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unit_price) || 0),
    0
  );
  const editDiscountVal = Number(editFormData.discount) || 0;
  const editTaxableAmount = Math.max(0, editSubtotal - editDiscountVal);
  const editTaxAmount = (editTaxableAmount * (Number(editFormData.tax_rate) || 0)) / 100;
  const editGrandTotal = editTaxableAmount + editTaxAmount;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingInvoice) return;
    if (!editFormData.customer_id) {
      alert('Please select a customer account');
      return;
    }

    try {
      const res = await api.put(`/invoices/${editingInvoice._id}`, editFormData);
      const updatedInv = res.data?.invoice || res.data;
      setIsEditOpen(false);
      setEditingInvoice(null);
      fetchInvoices();
      if (inspectInvoice && inspectInvoice._id === editingInvoice._id) {
        setInspectInvoice(updatedInv);
      }
      if (previewInvoice && previewInvoice._id === editingInvoice._id) {
        setPreviewInvoice(updatedInv);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update invoice');
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await api.put(`/invoices/${invoiceId}`, { status: 'paid' });
      fetchInvoices();
      if (inspectInvoice && inspectInvoice._id === invoiceId) {
        setInspectInvoice((prev) => ({ ...prev, status: 'paid' }));
      }
      if (previewInvoice && previewInvoice._id === invoiceId) {
        setPreviewInvoice((prev) => ({ ...prev, status: 'paid' }));
      }
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
    }
  };

  const handleMarkAsUnpaid = async (invoiceId) => {
    try {
      await api.put(`/invoices/${invoiceId}`, { status: 'draft' });
      fetchInvoices();
      if (inspectInvoice && inspectInvoice._id === invoiceId) {
        setInspectInvoice((prev) => ({ ...prev, status: 'draft' }));
      }
      if (previewInvoice && previewInvoice._id === invoiceId) {
        setPreviewInvoice((prev) => ({ ...prev, status: 'draft' }));
      }
    } catch (err) {
      console.error('Failed to mark invoice as unpaid:', err);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await api.put(`/invoices/${invoiceId}`, { status: newStatus });
      fetchInvoices();
      if (inspectInvoice && inspectInvoice._id === invoiceId) {
        setInspectInvoice((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This cannot be undone.')) return;
    try {
      await api.delete(`/invoices/${invoiceId}`);
      if (inspectInvoice?._id === invoiceId) setInspectInvoice(null);
      if (previewInvoice?._id === invoiceId) setPreviewInvoice(null);
      setSelectedIds((prev) => prev.filter((id) => id !== invoiceId));
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  // Multi-select & Bulk Action handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const displayedIds = displayedInvoices.map((i) => i._id);
    const allSelected = displayedIds.length > 0 && displayedIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !displayedIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...displayedIds])));
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => api.put(`/invoices/${id}`, { status: 'paid' }))
      );
      setSelectedIds([]);
      fetchInvoices();
    } catch (err) {
      alert('Failed to mark selected invoices as paid.');
    }
  };

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) return;
    const targetInvoices = invoices.filter((inv) => selectedIds.includes(inv._id));
    if (targetInvoices.length === 0) return;
    handlePrintReceipt(targetInvoices);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected invoices? This cannot be undone.`)) {
      return;
    }
    try {
      await Promise.all(
        selectedIds.map((id) => api.delete(`/invoices/${id}`))
      );
      setSelectedIds([]);
      fetchInvoices();
    } catch (err) {
      alert('Failed to delete some selected invoices.');
    }
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Bulletproof single or multi-page print trigger using isolated iframe document
  const handlePrintReceipt = (inv = previewInvoice) => {
    if (!inv) return;

    try {
      const oldFrame = document.getElementById('veltrix-invoice-print-frame');
      if (oldFrame) oldFrame.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'veltrix-invoice-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const html = generateInvoicePrintHtml(inv);
      const frameDoc = iframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
          if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1500);
      }, 250);
    } catch (e) {
      console.warn('Fallback to standard window.print:', e);
      window.print();
    }
  };

  // Color-coded status badges with high visual hierarchy
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return {
          pill: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-2xs',
          dot: 'bg-emerald-500',
          label: 'PAID',
        };
      case 'sent':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-300/80 shadow-2xs',
          dot: 'bg-amber-500',
          label: 'SENT / PENDING',
        };
      case 'overdue':
        return {
          pill: 'bg-rose-50 text-rose-800 border-rose-300/80 shadow-2xs',
          dot: 'bg-rose-500 animate-pulse',
          label: 'OVERDUE',
        };
      default:
        return {
          pill: 'bg-stone-100 text-stone-600 border-stone-200 shadow-2xs',
          dot: 'bg-stone-400',
          label: 'DRAFT',
        };
    }
  };

  // Dynamic status counters for quick-filter tabs
  const statusCounts = {
    all: invoices.length,
    unpaid: invoices.filter((i) => i.status !== 'paid').length,
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
  };

  // Filter invoices locally by search keyword and date range
  const filteredInvoices = invoices.filter((inv) => {
    // Search keyword
    if (search.trim()) {
      const q = search.toLowerCase();
      const invNum = (inv.invoice_number || '').toLowerCase();
      const custName = (inv.customer_id?.name || '').toLowerCase();
      const company = (inv.customer_id?.company || '').toLowerCase();
      if (!invNum.includes(q) && !custName.includes(q) && !company.includes(q)) {
        return false;
      }
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const created = new Date(inv.createdAt || inv.due_date);
      const due = inv.due_date ? new Date(inv.due_date) : null;

      if (dateRangeFilter === 'this-month') {
        if (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (dateRangeFilter === 'last-30') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (created < thirtyDaysAgo) return false;
      } else if (dateRangeFilter === 'this-quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const invQuarter = Math.floor(created.getMonth() / 3);
        if (currentQuarter !== invQuarter || created.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (dateRangeFilter === 'due-soon') {
        if (!due) return false;
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > 7 || inv.status === 'paid') return false;
      } else if (dateRangeFilter === 'overdue') {
        if (!due || due >= now || inv.status === 'paid') return false;
      }
    }

    return true;
  });

  // Sort displayed invoices dynamically
  const displayedInvoices = [...filteredInvoices].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case 'invoice_number':
        aVal = a.invoice_number || '';
        bVal = b.invoice_number || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'customer':
        aVal = a.customer_id?.name || '';
        bVal = b.customer_id?.name || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'due_date':
        aVal = a.due_date ? new Date(a.due_date).getTime() : 0;
        bVal = b.due_date ? new Date(b.due_date).getTime() : 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      case 'grand_total':
        aVal = Number(a.grand_total) || 0;
        bVal = Number(b.grand_total) || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      case 'status':
        aVal = a.status || '';
        bVal = b.status || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      default: // 'createdAt'
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A] flex items-center gap-2.5">
              <Receipt className="w-7 h-7 text-[#2D3A2D]" />
              <span>Invoicing & Billing</span>
            </h1>
            <button
              onClick={() => setShowWhyHelp(!showWhyHelp)}
              className="text-xs font-semibold text-stone-500 hover:text-[#2D3A2D] flex items-center gap-1 cursor-pointer bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200"
              title="Why is this page needed in this CRM?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why this page?</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#706F6C] mt-1 font-medium">
            Issue GST tax invoices, track accounts receivable, and manage customer payments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] font-bold text-xs shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Tax Invoice</span>
        </button>
      </div>

      {/* Explanatory Help Card */}
      {showWhyHelp && (
        <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5E2DC] text-xs text-stone-700 space-y-2 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Why Invoicing & Billing is essential in this CRM</span>
            </span>
            <button onClick={() => setShowWhyHelp(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="leading-relaxed">
            In enterprise sales, winning a deal is only half the journey. This page connects your <strong>Deals & Customers</strong> to real cash flow. It allows your business to generate formal GST tax invoices, share downloadable payment receipts with clients, and monitor which payments have been received versus those still pending or overdue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium text-[11px]">
            <div className="p-2 rounded-xl bg-white border border-[#E5E2DC]">
              <strong>1. Won Deal:</strong> Converts sales agreements into official bills.
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E5E2DC]">
              <strong>2. Tax Receipt:</strong> Single-page GST compliant breakdown for accounts.
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#E5E2DC]">
              <strong>3. Cash Flow:</strong> Real-time tracking of pending client payments.
            </div>
          </div>
        </div>
      )}

      {/* KPI Metric Cards - Clickable Interactive Filters with Live Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div
          onClick={() => {
            setStatusFilter('');
            setDateRangeFilter('all');
          }}
          title="Click to view all issued invoices"
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer select-none group ${
            statusFilter === ''
              ? 'border-[#2D3A2D] ring-2 ring-[#2D3A2D]/20 shadow-md'
              : 'border-[#E5E2DC] hover:border-stone-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Total Invoiced
            </p>
            <div className="w-10 h-10 rounded-xl bg-[#F5F3EF] text-[#2D3A2D] flex items-center justify-center font-bold text-base border border-[#E5E2DC]">
              ₹
            </div>
          </div>
          <p className="text-2xl font-black text-[#1A1A1A] mt-1 tracking-tight">
            ₹{formatINR(stats.totalInvoiced)}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-[#706F6C] font-medium">{stats.totalCount} bills issued</span>
          </div>
        </div>

        {/* Collected Revenue */}
        <div
          onClick={() => setStatusFilter('paid')}
          title="Click to filter settled / paid invoices"
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer select-none group ${
            statusFilter === 'paid'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
              : 'border-[#E5E2DC] hover:border-emerald-500 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Collected Revenue
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1 tracking-tight">
            ₹{formatINR(stats.totalPaid)}
          </p>
          <div className="mt-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-emerald-700 font-semibold">Bank Settled</span>
              <span className="font-mono text-[11px] font-bold text-stone-700">
                {stats.totalInvoiced > 0
                  ? Math.round((stats.totalPaid / stats.totalInvoiced) * 100)
                  : 0}
                % collected
              </span>
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.totalInvoiced > 0
                      ? Math.min(100, Math.round((stats.totalPaid / stats.totalInvoiced) * 100))
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Outstanding / Pending */}
        <div
          onClick={() => setStatusFilter('unpaid')}
          title="Click to filter outstanding / awaiting client payment"
          className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer select-none group ${
            statusFilter === 'unpaid'
              ? 'border-amber-600 ring-2 ring-amber-600/20 shadow-md'
              : 'border-[#E5E2DC] hover:border-amber-500 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
              Outstanding / Pending
            </p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1 tracking-tight">
            ₹{formatINR(stats.totalPending)}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-amber-700 font-semibold">Awaiting payment</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-mono">
              {statusCounts.unpaid} bills pending
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs, Date Range & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E2DC] shadow-xs">
        {/* Status Segmented Tabs with Pill Counters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 text-xs font-bold scrollbar-thin">
          {[
            { id: '', label: 'All Invoices', count: statusCounts.all },
            { id: 'unpaid', label: 'Pending / Unpaid', count: statusCounts.unpaid },
            { id: 'draft', label: 'Draft', count: statusCounts.draft },
            { id: 'sent', label: 'Sent', count: statusCounts.sent },
            { id: 'paid', label: 'Paid', count: statusCounts.paid },
            { id: 'overdue', label: 'Overdue', count: statusCounts.overdue },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#2D3A2D] text-white shadow-xs'
                    : 'text-[#706F6C] hover:text-[#1A1A1A] hover:bg-[#FAF9F6]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/80 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Date Range, Customer Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E5E2DC] px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-700">
            <CalendarRange className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-stone-700 outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="this-month">This Month</option>
              <option value="last-30">Last 30 Days</option>
              <option value="this-quarter">This Quarter</option>
              <option value="due-soon">Due in Next 7 Days</option>
              <option value="overdue">Past Due Only</option>
            </select>
          </div>

          {/* Customer filter dropdown */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E5E2DC] text-xs font-medium bg-[#FAF9F6] text-stone-700 outline-none focus:border-[#2D3A2D] max-w-[170px] truncate"
          >
            <option value="">All Clients</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex items-center w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-7 py-1.5 rounded-xl border border-[#E5E2DC] bg-[#FAF9F6] text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#2D3A2D] focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 px-5 bg-[#2D3A2D] text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-xs">
              {selectedIds.length} {selectedIds.length === 1 ? 'invoice' : 'invoices'} selected
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-stone-300 hover:text-white underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkMarkAsPaid}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Paid</span>
            </button>
            <button
              onClick={handleBulkPrint}
              className="px-3 py-1.5 rounded-xl bg-white text-[#1A1A1A] hover:bg-stone-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Selected ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-400/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Invoices List Table with Sticky Header */}
      <div className="bg-white rounded-3xl border border-[#E5E2DC] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#706F6C]">
            <div className="w-6 h-6 border-2 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading invoices...
          </div>
        ) : displayedInvoices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Receipt className="w-10 h-10 text-[#706F6C] mx-auto opacity-30" />
            <h3 className="text-base font-bold text-[#1A1A1A]">No invoices found</h3>
            <p className="text-xs text-[#706F6C] max-w-sm mx-auto">
              {search || statusFilter || customerFilter || dateRangeFilter !== 'all'
                ? 'No invoices match your active filters or search terms.'
                : 'Click "New Tax Invoice" above to generate your first invoice.'}
            </p>
          </div>
        ) : (
          <div className="max-h-[640px] overflow-y-auto overflow-x-auto relative scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#FAF9F6] border-b border-[#E5E2DC] text-[10px] font-bold uppercase tracking-wider text-[#706F6C] shadow-2xs">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="py-3.5 pl-6 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={
                        displayedInvoices.length > 0 &&
                        displayedInvoices.every((inv) => selectedIds.includes(inv._id))
                      }
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-[#2D3A2D] accent-[#2D3A2D] cursor-pointer"
                      title="Select all displayed invoices"
                    />
                  </th>

                  {/* Sortable: Invoice # */}
                  <th
                    onClick={() => handleSort('invoice_number')}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Invoice #</span>
                      {sortField === 'invoice_number' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#2D3A2D]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#2D3A2D]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Sortable: Customer / Account */}
                  <th
                    onClick={() => handleSort('customer')}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer / Account</span>
                      {sortField === 'customer' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#2D3A2D]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#2D3A2D]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Sortable: Due Date */}
                  <th
                    onClick={() => handleSort('due_date')}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Due Date</span>
                      {sortField === 'due_date' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#2D3A2D]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#2D3A2D]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Sortable: Amount (INR) */}
                  <th
                    onClick={() => handleSort('grand_total')}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Amount (INR)</span>
                      {sortField === 'grand_total' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#2D3A2D]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#2D3A2D]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Sortable: Status */}
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#2D3A2D]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#2D3A2D]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Actions Column */}
                  <th className="py-3.5 px-4 text-center w-[320px] min-w-[320px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC]">
                {displayedInvoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  const isSelected = selectedIds.includes(inv._id);
                  return (
                    <tr
                      key={inv._id}
                      onClick={() => setInspectInvoice(inv)}
                      className={`hover:bg-[#FAF9F6] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-stone-50/70' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 pr-2 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(inv._id)}
                          className="w-4 h-4 rounded text-[#2D3A2D] accent-[#2D3A2D] cursor-pointer"
                        />
                      </td>

                      {/* Invoice # */}
                      <td className="py-4 px-4 font-mono font-bold text-[#1A1A1A] whitespace-nowrap">
                        <span className="text-[#2D3A2D] group-hover:underline">
                          {inv.invoice_number}
                        </span>
                      </td>

                      {/* Customer / Company & Linked Deal */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-[#1A1A1A]">{inv.customer_id?.name || 'Unknown'}</p>
                        {inv.customer_id?.company && (
                          <p className="text-[11px] text-[#706F6C]">{inv.customer_id.company}</p>
                        )}
                        {(inv.deal_id?.title || inv.items?.[0]?.description) && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            <Briefcase className="w-2.5 h-2.5 text-stone-500" />
                            <span className="truncate max-w-[200px]">
                              {inv.deal_id?.title || inv.items?.[0]?.description}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Due Date in Indian Business Format */}
                      <td className="py-4 px-4 text-[#706F6C] font-medium whitespace-nowrap">
                        {formatIndianDate(inv.due_date)}
                      </td>

                      {/* Amount in Indian Lakhs Format */}
                      <td className="py-4 px-4 font-bold text-[#1A1A1A] font-mono text-sm whitespace-nowrap">
                        ₹{formatINR(inv.grand_total)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Row Actions - Centered, straight-line flex alignment */}
                      <td
                        className="py-4 px-4 text-center w-[320px] min-w-[320px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Invoice Bill - Fixed width w-[68px] */}
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            title="Edit Invoice Bill"
                            className="w-[68px] h-8 justify-center rounded-xl bg-stone-100 hover:bg-[#2D3A2D] hover:text-white text-stone-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors border border-stone-200 cursor-pointer shadow-2xs shrink-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Print Single-Page Receipt - Fixed width w-[72px] */}
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            title="Print / Save Single-Page Receipt"
                            className="w-[72px] h-8 justify-center rounded-xl bg-stone-100 hover:bg-[#2D3A2D] hover:text-white text-[#1A1A1A] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors border border-stone-200 cursor-pointer shadow-2xs shrink-0"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>

                          {/* Toggle Paid / Unpaid Button - Exact same fixed width w-[84px] */}
                          {inv.status !== 'paid' ? (
                            <button
                              onClick={() => handleMarkAsPaid(inv._id)}
                              title="Mark as Paid"
                              className="w-[84px] h-8 justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsUnpaid(inv._id)}
                              title="Mark as Unpaid (Revert to Pending/Draft)"
                              className="w-[84px] h-8 justify-center rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 font-semibold text-xs inline-flex items-center gap-1 transition-colors border border-amber-200 cursor-pointer shadow-2xs shrink-0"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Unpaid</span>
                            </button>
                          )}

                          {/* Delete (Subdued destructive action) - Fixed width w-8 h-8 */}
                          <button
                            onClick={() => handleDelete(inv._id)}
                            title="Delete Invoice"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-100 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVOICE DETAILS INSPECTOR DRAWER */}
      {inspectInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 border-b border-[#E5E2DC] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-base text-[#1A1A1A]">
                    {inspectInvoice.invoice_number}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      getStatusBadge(inspectInvoice.status).pill
                    }`}
                  >
                    <span>{getStatusBadge(inspectInvoice.status).label}</span>
                  </span>
                </div>
                <p className="text-xs text-[#706F6C] mt-0.5">
                  Created {formatIndianDate(inspectInvoice.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(inspectInvoice)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#2D3A2D] hover:text-white text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Bill</span>
                </button>
                <button
                  onClick={() => {
                    handlePrintReceipt(inspectInvoice);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#2D3A2D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#3D4F3D]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setInspectInvoice(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#706F6C] hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Client Card */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Customer Account
                  </span>
                  <p className="font-bold text-sm text-[#1A1A1A] mt-0.5">
                    {inspectInvoice.customer_id?.name}
                  </p>
                  <p className="text-stone-500">{inspectInvoice.customer_id?.company}</p>
                  <p className="text-stone-500 font-mono text-[11px] mt-1">
                    {inspectInvoice.customer_id?.email} • {inspectInvoice.customer_id?.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Due Date
                  </span>
                  <p className="font-bold text-stone-800 mt-0.5">
                    {formatIndianDate(inspectInvoice.due_date)}
                  </p>
                </div>
              </div>

              {/* Linked Deal Opportunity */}
              {inspectInvoice.deal_id && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        Linked Deals Pipeline Opportunity
                      </p>
                      <p className="font-bold text-xs text-blue-950 mt-0.5">
                        {inspectInvoice.deal_id.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Deal Pre-Tax</span>
                    <p className="font-mono font-bold text-xs text-blue-950">
                      ₹{formatINR(inspectInvoice.deal_id.amount)}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Updater */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E2DC]">
                <span className="font-bold text-stone-700">Update Status:</span>
                <div className="flex items-center gap-1">
                  {['draft', 'sent', 'paid', 'overdue'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(inspectInvoice._id, st)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition ${
                        inspectInvoice.status === st
                          ? 'bg-[#2D3A2D] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[10px] mb-2">
                  Itemized Services & Goods
                </p>
                <div className="border border-[#E5E2DC] rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF9F6] border-b border-[#E5E2DC] text-[10px] font-bold text-stone-500">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Price</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2DC]">
                      {inspectInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium">{item.description}</td>
                          <td className="py-2.5 px-3 text-center text-stone-500">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹{formatINR(item.unit_price)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            ₹{formatINR(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DC] space-y-1.5 font-medium">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">
                    ₹{formatINR(inspectInvoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST ({inspectInvoice.tax_rate || 18}%):</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">
                    ₹{formatINR(inspectInvoice.tax_amount)}
                  </span>
                </div>
                {inspectInvoice.discount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Discount:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      -₹{formatINR(inspectInvoice.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E5E2DC] text-sm font-black text-[#1A1A1A]">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-800 text-base">
                    ₹{formatINR(inspectInvoice.grand_total)}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 italic pt-1">
                  Amount in words: {numberToIndianWords(inspectInvoice.grand_total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TAX INVOICE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#1A1A1A]">Create New Tax Invoice</h2>
                <p className="text-xs text-[#706F6C]">
                  Select client, add itemized deliverables, and configure GST tax rates.
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#706F6C] hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Client Account *
                  </label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-xs outline-none bg-white font-medium focus:border-[#2D3A2D]"
                  >
                    <option value="">Select client...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-xs outline-none font-medium focus:border-[#2D3A2D]"
                  />
                </div>
              </div>

              {/* Line items table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Deliverables & Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Service / Product Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none focus:border-[#2D3A2D]"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-16 px-3 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none text-center focus:border-[#2D3A2D]"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate (₹)"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none font-mono focus:border-[#2D3A2D]"
                    />
                    <span className="text-xs font-bold text-[#1A1A1A] w-24 text-right font-mono">
                      ₹{formatINR((item.quantity || 0) * (item.unit_price || 0))}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Live Calculation in Indian Digits */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DC] space-y-2 text-xs">
                <div className="flex justify-between text-[#706F6C]">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">₹{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[#706F6C]">
                  <span className="flex items-center gap-2">
                    GST Tax Rate (%):
                    <select
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                      className="px-2 py-0.5 border border-[#E5E2DC] rounded-lg text-xs bg-white font-medium"
                    >
                      <option value="18">18% (Standard Services GST)</option>
                      <option value="12">12% (Goods / Services)</option>
                      <option value="5">5% (Concessional)</option>
                      <option value="0">0% (Exempt)</option>
                    </select>
                  </span>
                  <span className="font-mono font-bold text-[#1A1A1A]">₹{formatINR(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[#706F6C]">
                  <span className="flex items-center gap-2">
                    Discount (₹):
                    <input
                      type="number"
                      min="0"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-24 px-2 py-0.5 border border-[#E5E2DC] rounded-lg text-xs font-mono"
                    />
                  </span>
                  <span className="font-mono font-bold text-[#1A1A1A]">
                    -₹{formatINR(formData.discount || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E5E2DC] text-sm font-black text-[#1A1A1A]">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-800 text-base">
                    ₹{formatINR(grandTotal)}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  In words: {numberToIndianWords(grandTotal)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Payment Terms & Bank Details
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none resize-none focus:border-[#2D3A2D]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#706F6C] hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] shadow-md cursor-pointer"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE BILL MODAL */}
      {isEditOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E5E2DC] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#2D3A2D] text-white">
                    {editingInvoice.invoice_number}
                  </span>
                  <h2 className="text-lg font-black text-[#1A1A1A]">Edit Invoice Bill</h2>
                </div>
                <p className="text-xs text-[#706F6C] mt-1">
                  Update customer account, line items, rates, taxes, and payment conditions.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingInvoice(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#706F6C] hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Client Account *
                  </label>
                  <select
                    required
                    value={editFormData.customer_id}
                    onChange={(e) => setEditFormData({ ...editFormData, customer_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-xs outline-none bg-white font-medium focus:border-[#2D3A2D]"
                  >
                    <option value="">Select client...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.due_date}
                    onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-xs outline-none font-medium focus:border-[#2D3A2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DC] text-xs outline-none bg-white font-medium focus:border-[#2D3A2D]"
                  >
                    <option value="draft">Draft (Pending)</option>
                    <option value="sent">Sent to Client</option>
                    <option value="paid">Paid & Settled</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Line items table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Deliverables & Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEditItem}
                    className="text-xs font-bold text-[#2D3A2D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {editFormData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Service / Product Description"
                      value={item.description}
                      onChange={(e) => handleEditItemChange(idx, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none focus:border-[#2D3A2D]"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleEditItemChange(idx, 'quantity', e.target.value)}
                      className="w-16 px-3 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none text-center focus:border-[#2D3A2D]"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate (₹)"
                      value={item.unit_price}
                      onChange={(e) => handleEditItemChange(idx, 'unit_price', e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none font-mono focus:border-[#2D3A2D]"
                    />
                    <span className="text-xs font-bold text-[#1A1A1A] w-24 text-right font-mono">
                      ₹{formatINR((item.quantity || 0) * (item.unit_price || 0))}
                    </span>
                    {editFormData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEditItem(idx)}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Live Calculation in Indian Digits */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DC] space-y-2 text-xs">
                <div className="flex justify-between text-[#706F6C]">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">₹{formatINR(editSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[#706F6C]">
                  <span className="flex items-center gap-2">
                    GST Tax Rate (%):
                    <select
                      value={editFormData.tax_rate}
                      onChange={(e) => setEditFormData({ ...editFormData, tax_rate: e.target.value })}
                      className="px-2 py-0.5 border border-[#E5E2DC] rounded-lg text-xs bg-white font-medium"
                    >
                      <option value="18">18% (Standard Services GST)</option>
                      <option value="12">12% (Goods / Services)</option>
                      <option value="5">5% (Concessional)</option>
                      <option value="0">0% (Exempt)</option>
                    </select>
                  </span>
                  <span className="font-mono font-bold text-[#1A1A1A]">₹{formatINR(editTaxAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[#706F6C]">
                  <span className="flex items-center gap-2">
                    Discount (₹):
                    <input
                      type="number"
                      min="0"
                      value={editFormData.discount}
                      onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
                      className="w-24 px-2 py-0.5 border border-[#E5E2DC] rounded-lg text-xs font-mono"
                    />
                  </span>
                  <span className="font-mono font-bold text-[#1A1A1A]">
                    -₹{formatINR(editFormData.discount || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E5E2DC] text-sm font-black text-[#1A1A1A]">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-800 text-base">
                    ₹{formatINR(editGrandTotal)}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  In words: {numberToIndianWords(editGrandTotal)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Payment Terms & Bank Details
                </label>
                <textarea
                  rows="2"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-[#E5E2DC] text-xs outline-none resize-none focus:border-[#2D3A2D]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingInvoice(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#706F6C] hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] shadow-md cursor-pointer"
                >
                  Save Invoice Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRISTINE SINGLE-PAGE PRINTABLE TAX INVOICE MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Controls (Hidden during physical print) */}
            <div className="p-4 border-b border-[#E5E2DC] bg-[#FAF9F6] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2D3A2D]" />
                <span className="text-xs font-bold text-stone-800">
                  Single-Page Tax Invoice Receipt ({previewInvoice.invoice_number})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintReceipt(previewInvoice)}
                  className="px-4 py-1.5 rounded-xl bg-[#2D3A2D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#3D4F3D] cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save 1-Page PDF</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#706F6C] hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Content Container (Targeted by #printable-invoice-receipt) */}
            <div className="overflow-y-auto p-6 sm:p-10">
              <div id="printable-invoice-receipt" className="space-y-6 text-[#1A1A1A] bg-white">
                {/* Invoice Top Header */}
                <div className="flex justify-between items-start border-b-2 border-[#1A1A1A] pb-5">
                  <div>
                    <div className="flex items-center gap-2 font-black text-2xl tracking-tight text-[#1A1A1A]">
                      <div className="w-8 h-8 bg-[#2D3A2D] rounded-lg flex items-center justify-center text-white text-base font-bold">
                        V
                      </div>
                      <span>VELTRIX CRM</span>
                    </div>
                    <p className="text-xs font-bold text-stone-700 mt-1">
                      Veltrix Technologies Private Limited
                    </p>
                    <p className="text-[11px] text-stone-500">
                      GSTIN: 27AABCV1234F1Z8 • PAN: AABCV1234F
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Corporate Office: Bandra Kurla Complex, Mumbai 400051
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-md bg-[#2D3A2D] text-white font-bold text-xs uppercase tracking-wider inline-block">
                      TAX INVOICE
                    </span>
                    <p className="font-mono text-sm font-black text-[#1A1A1A] mt-2">
                      #{previewInvoice.invoice_number}
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Invoice Date: <strong>{formatIndianDate(previewInvoice.createdAt)}</strong>
                    </p>
                    <p className="text-xs text-stone-600">
                      Payment Due: <strong>{formatIndianDate(previewInvoice.due_date)}</strong>
                    </p>
                  </div>
                </div>

                {/* Billed To / Billed By */}
                <div className="grid grid-cols-2 gap-6 text-xs bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E2DC]">
                  <div>
                    <p className="font-bold text-[#706F6C] uppercase tracking-wider text-[10px]">
                      Billed To (Client / Customer):
                    </p>
                    <p className="font-black text-sm text-[#1A1A1A] mt-1">
                      {previewInvoice.customer_id?.name}
                    </p>
                    {previewInvoice.customer_id?.company && (
                      <p className="text-stone-700 font-semibold">{previewInvoice.customer_id.company}</p>
                    )}
                    <p className="text-stone-500 mt-0.5">{previewInvoice.customer_id?.email}</p>
                    <p className="text-stone-500">{previewInvoice.customer_id?.phone}</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">Place of Supply: Maharashtra (27)</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#706F6C] uppercase tracking-wider text-[10px]">
                      Invoice Status & Method:
                    </p>
                    <p className="mt-1">
                      <span className="font-bold uppercase px-2 py-0.5 rounded text-xs border bg-white font-mono">
                        {previewInvoice.status}
                      </span>
                    </p>
                    <p className="text-stone-500 mt-2 text-[11px]">
                      Currency: <strong>INR (Indian Rupees)</strong>
                    </p>
                    <p className="text-stone-500 text-[11px]">
                      Payment Mode: <strong>Direct Bank Transfer / NEFT / UPI</strong>
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-[#1A1A1A] rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-4">Description of Deliverables / Services</th>
                        <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2DC]">
                      {previewInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF9F6]">
                          <td className="py-2.5 px-3 font-mono text-stone-500">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-stone-900">{item.description}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-stone-500">998313</td>
                          <td className="py-2.5 px-3 text-center text-stone-700">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹{formatINR(item.unit_price)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">
                            ₹{formatINR(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Tax Breakup in Indian Digits */}
                <div className="flex justify-between items-start text-xs pt-2">
                  <div className="w-1/2 pr-4 space-y-2">
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DC]">
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Amount Chargeable in Words:
                      </p>
                      <p className="font-bold text-stone-800 text-[11px] mt-0.5 leading-snug">
                        {numberToIndianWords(previewInvoice.grand_total)}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl border border-dashed border-[#E5E2DC] text-[10px] text-stone-600">
                      <strong>Bank Transfer Details:</strong>
                      <br />
                      Bank: HDFC Bank Ltd • Branch: BKC Mumbai
                      <br />
                      A/C No: 50200012345678 • IFSC: HDFC0000128
                    </div>
                  </div>

                  <div className="w-64 space-y-1.5 font-medium">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-bold text-[#1A1A1A]">
                        ₹{formatINR(previewInvoice.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>CGST (9%):</span>
                      <span className="font-mono font-bold text-[#1A1A1A]">
                        ₹{formatINR(Math.round((previewInvoice.tax_amount || 0) / 2))}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>SGST (9%):</span>
                      <span className="font-mono font-bold text-[#1A1A1A]">
                        ₹{formatINR(Math.round((previewInvoice.tax_amount || 0) / 2))}
                      </span>
                    </div>

                    {previewInvoice.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="font-mono font-bold">
                          -₹{formatINR(previewInvoice.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t-2 border-[#1A1A1A] text-sm font-black text-[#1A1A1A]">
                      <span>Grand Total:</span>
                      <span className="font-mono text-base text-emerald-900">
                        ₹{formatINR(previewInvoice.grand_total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes & Signatory */}
                <div className="pt-4 border-t border-[#E5E2DC] flex justify-between items-end text-xs text-stone-500">
                  <div className="max-w-xs text-[10px]">
                    <p className="font-bold text-stone-700">Terms & Conditions:</p>
                    <p>{previewInvoice.notes || 'Payment is due within 14 days of invoice date.'}</p>
                    <p className="mt-1 italic">This is a computer-generated tax invoice.</p>
                  </div>

                  <div className="text-right">
                    <div className="h-10 border-b border-stone-400 w-36 ml-auto mb-1 flex items-end justify-center">
                      <span className="text-[10px] font-mono text-stone-400">Authorized Signatory</span>
                    </div>
                    <p className="font-bold text-[10px] text-stone-700">For Veltrix Technologies Pvt Ltd</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
