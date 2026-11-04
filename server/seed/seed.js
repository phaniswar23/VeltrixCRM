import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import Deal from '../models/Deal.js';
import Invoice from '../models/Invoice.js';
import TimelineEvent from '../models/TimelineEvent.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import { seedDefaultAutomationRules } from '../services/automationService.js';

dotenv.config();

const seedDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veltrixcrm';
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  console.log('Clearing existing CRM collections...');
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Task.deleteMany({});
  await Deal.deleteMany({});
  await Invoice.deleteMany({});
  await TimelineEvent.deleteMany({});
  await ActivityLog.deleteMany({});
  await Notification.deleteMany({});

  console.log('Seeding Users...');
  const admin = await User.create({
    name: 'Phaniswar',
    email: 'admin@veltrix.com',
    password: 'password123',
    role: 'admin',
    business_type: 'Enterprise SaaS',
  });

  const staff1 = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav@veltrix.com',
    password: 'password123',
    role: 'staff',
    business_type: 'Operations',
  });

  const staff2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@veltrix.com',
    password: 'password123',
    role: 'staff',
    business_type: 'Client Success',
  });

  const staff3 = await User.create({
    name: 'Rohan Verma',
    email: 'rohan@veltrix.com',
    password: 'password123',
    role: 'staff',
    business_type: 'Enterprise Solutions',
  });

  console.log('Seeding Customers...');
  const customers = await Customer.create([
    {
      name: 'Acme Global Corporation',
      email: 'partnerships@acmeglobal.com',
      phone: '+91 98201 12345',
      company: 'Acme Global Ltd',
      status: 'active',
      tags: ['Enterprise', 'VIP', 'Annual Contract'],
      lead_score: 95,
      assigned_to: staff1._id,
    },
    {
      name: 'Nova Dynamics',
      email: 'contact@novadynamics.io',
      phone: '+91 98202 23456',
      company: 'Nova Dynamics Pvt Ltd',
      status: 'active',
      tags: ['SaaS', 'High Growth'],
      lead_score: 85,
      assigned_to: staff2._id,
    },
    {
      name: 'Apex Financial Systems',
      email: 'lead@apexsystems.com',
      phone: '+91 98203 34567',
      company: 'Apex Fintech Corp',
      status: 'lead',
      tags: ['Fintech', 'Prospect'],
      lead_score: 65,
      assigned_to: staff1._id,
    },
    {
      name: 'Horizon Labs BioTech',
      email: 'operations@horizonlabs.org',
      phone: '+91 98204 45678',
      company: 'Horizon Labs Ltd',
      status: 'lead',
      tags: ['Healthcare', 'Proposal Sent'],
      lead_score: 75,
      assigned_to: staff3._id,
    },
    {
      name: 'Stellar AI Technologies',
      email: 'contact@stellarai.dev',
      phone: '+91 98205 56789',
      company: 'Stellar Technologies',
      status: 'active',
      tags: ['AI/ML', 'Key Account'],
      lead_score: 90,
      assigned_to: staff2._id,
    },
    {
      name: 'Zenith Logistics Network',
      email: 'support@zenithlogistics.com',
      phone: '+91 98206 67890',
      company: 'Zenith Logistics',
      status: 'inactive',
      tags: ['Churn Risk'],
      lead_score: 35,
      assigned_to: null,
    },
  ]);

  console.log('Seeding Deals Pipeline Opportunities...');
  const deals = await Deal.create([
    {
      title: 'Enterprise Multi-Region License',
      amount: 450000,
      currency: 'INR',
      customer_id: customers[0]._id,
      stage: 'closed_won',
      win_probability: 100,
      assigned_to: staff1._id,
      notes: 'Final executive agreement executed.',
    },
    {
      title: 'Annual Cloud Subscription (100 Seats)',
      amount: 180000,
      currency: 'INR',
      customer_id: customers[1]._id,
      stage: 'closed_won',
      win_probability: 100,
      assigned_to: staff2._id,
      notes: 'Reviewing SLA terms and payment schedule.',
    },
    {
      title: 'Custom API Integration & Onboarding',
      amount: 95000,
      currency: 'INR',
      customer_id: customers[2]._id,
      stage: 'closed_won',
      win_probability: 100,
      assigned_to: staff1._id,
      notes: 'Proposal sent to CFO for budget sign-off.',
    },
    {
      title: 'BioTech Analytics Platform Pilot',
      amount: 120000,
      currency: 'INR',
      customer_id: customers[3]._id,
      stage: 'proposal',
      win_probability: 60,
      assigned_to: staff3._id,
      notes: 'Completed technical discovery call with CTO.',
    },
    {
      title: 'Starter Team Expansion (20 Seats)',
      amount: 45000,
      currency: 'INR',
      customer_id: customers[4]._id,
      stage: 'qualified',
      win_probability: 40,
      assigned_to: staff2._id,
      notes: 'Initial inquiry from marketing website form.',
    },
  ]);

  console.log('Seeding Invoices...');
  await Invoice.create([
    {
      invoice_number: 'INV-2026-0001',
      customer_id: customers[0]._id,
      deal_id: deals[0]._id,
      items: [
        {
          description: 'Enterprise License - Multi-Region Annual Tier',
          quantity: 1,
          unit_price: 450000,
          total: 450000,
        },
      ],
      subtotal: 450000,
      tax_rate: 18,
      tax_amount: 81000,
      discount: 10000,
      grand_total: 521000,
      currency: 'INR',
      status: 'paid',
      paid_at: new Date(),
      created_by: admin._id,
      notes: 'Payment received via RTGS. Thank you for your business.',
    },
    {
      invoice_number: 'INV-2026-0002',
      customer_id: customers[1]._id,
      deal_id: deals[1]._id,
      items: [
        {
          description: 'Annual Cloud Subscription (100 Seats) - Enterprise Tier',
          quantity: 1,
          unit_price: 180000,
          total: 180000,
        },
      ],
      subtotal: 180000,
      tax_rate: 18,
      tax_amount: 32400,
      discount: 0,
      grand_total: 212400,
      currency: 'INR',
      status: 'paid',
      paid_at: new Date(),
      created_by: staff2._id,
      notes: 'Annual license subscription settled via wire transfer.',
    },
    {
      invoice_number: 'INV-2026-0003',
      customer_id: customers[2]._id,
      deal_id: deals[2]._id,
      items: [
        {
          description: 'Custom API Integration & Onboarding Sprint',
          quantity: 1,
          unit_price: 95000,
          total: 95000,
        },
      ],
      subtotal: 95000,
      tax_rate: 18,
      tax_amount: 17100,
      discount: 0,
      grand_total: 112100,
      currency: 'INR',
      status: 'draft',
      created_by: staff1._id,
      notes: 'Custom API Integration & Onboarding draft agreement.',
    },
    {
      invoice_number: 'INV-2026-0004',
      customer_id: customers[3]._id,
      deal_id: deals[3]._id,
      items: [
        {
          description: 'BioTech Analytics Platform - 6-Month Pilot Deployment',
          quantity: 1,
          unit_price: 120000,
          total: 120000,
        },
      ],
      subtotal: 120000,
      tax_rate: 18,
      tax_amount: 21600,
      discount: 0,
      grand_total: 141600,
      currency: 'INR',
      status: 'sent',
      created_by: staff3._id,
      notes: 'Payment is due within 14 calendar days.',
    },
  ]);

  console.log('Seeding Customer 360 Timeline Events...');
  await TimelineEvent.create([
    {
      customer_id: customers[0]._id,
      author: staff1._id,
      type: 'call',
      title: 'Quarterly Executive Review Call',
      description: 'Discussed usage metrics and performance. Client expressed high satisfaction with SLA response time.',
      metadata: { call_outcome: 'connected', duration_minutes: 25 },
    },
    {
      customer_id: customers[0]._id,
      author: staff1._id,
      type: 'note',
      title: 'Discount Approval on Annual Renewal',
      description: 'Approved 10,000 INR loyalty discount on annual invoice.',
    },
    {
      customer_id: customers[1]._id,
      author: staff2._id,
      type: 'meeting',
      title: 'Integration Architecture Workshop',
      description: 'Walked engineering team through webhooks, endpoints, and authentication schema.',
    },
  ]);

  console.log('Seeding Tasks...');
  await Task.create([
    {
      title: 'Quarterly Security Audit & Compliance Review',
      description: 'Review access logs and conduct annual permission compliance review for enterprise client accounts.',
      assigned_to: staff1._id,
      customer_id: customers[0]._id,
      status: 'in_progress',
      priority: 'high',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Onboarding Milestone Call with Nova Dynamics',
      description: 'Facilitate setup walkthrough for the executive team and configure custom webhook integrations.',
      assigned_to: staff2._id,
      customer_id: customers[1]._id,
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Prepare Enterprise SLA Proposal',
      description: 'Draft the multi-tier uptime guarantee and dedicated engineering support agreement.',
      assigned_to: staff1._id,
      customer_id: customers[2]._id,
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seeding Automation Rules...');
  await seedDefaultAutomationRules();

  console.log('Seeding Activity Logs & Notifications...');
  await ActivityLog.create([
    {
      user_id: admin._id,
      action: 'Workspace Initialized',
      description: 'VeltrixCRM production database initialized successfully with full 6-phase modules.',
    },
  ]);

  await Notification.create([
    {
      user_id: admin._id,
      title: 'VeltrixCRM Engine Operational',
      message: 'Deals Pipeline, Customer 360, Invoicing, Automations, CSV Import, and Real-Time SSE are live.',
      is_read: false,
    },
  ]);

  console.log('✅ All 6 CRM Phases Seeded Successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin: admin@veltrix.com / password123');
  console.log('Staff: staff@veltrix.com / password123');
  console.log('----------------------------------------------------');
  await mongoose.disconnect();
};

seedDB().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
