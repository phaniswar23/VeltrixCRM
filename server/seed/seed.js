import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veltrixcrm';
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  console.log('Clearing existing CRM collections...');
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Task.deleteMany({});
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
    name: 'Marcus Vance',
    email: 'staff@veltrix.com',
    password: 'password123',
    role: 'staff',
    business_type: 'Operational Pipeline',
  });

  const staff2 = await User.create({
    name: 'Sarah Jenkins',
    email: 'sarah@veltrix.com',
    password: 'password123',
    role: 'staff',
    business_type: 'Client Success',
  });

  const staff3 = await User.create({
    name: 'David Chen',
    email: 'david@veltrix.com',
    password: 'password123',
    role: 'staff',
    business_type: 'Enterprise Solutions',
  });

  console.log('Seeding Customers...');
  const customers = await Customer.create([
    {
      name: 'Acme Global Corporation',
      email: 'partnerships@acmeglobal.com',
      phone: '+1 415 555 0192',
      status: 'active',
      assigned_to: staff1._id,
    },
    {
      name: 'Nova Dynamics',
      email: 'contact@novadynamics.io',
      phone: '+1 415 555 0284',
      status: 'active',
      assigned_to: staff2._id,
    },
    {
      name: 'Apex Financial Systems',
      email: 'lead@apexsystems.com',
      phone: '+1 212 555 0147',
      status: 'lead',
      assigned_to: staff1._id,
    },
    {
      name: 'Horizon Labs BioTech',
      email: 'operations@horizonlabs.org',
      phone: '+1 650 555 0932',
      status: 'lead',
      assigned_to: staff3._id,
    },
    {
      name: 'Stellar AI Technologies',
      email: 'contact@stellarai.dev',
      phone: '+1 312 555 0781',
      status: 'active',
      assigned_to: staff2._id,
    },
    {
      name: 'Zenith Logistics Network',
      email: 'support@zenithlogistics.com',
      phone: '+1 713 555 0319',
      status: 'inactive',
      assigned_to: null,
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
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Onboarding Milestone Call with Nova Dynamics',
      description: 'Facilitate setup walkthrough for the executive team and configure custom webhook integrations.',
      assigned_to: staff2._id,
      customer_id: customers[1]._id,
      status: 'pending',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Prepare Enterprise SLA Proposal',
      description: 'Draft the multi-tier uptime guarantee and dedicated engineering support agreement.',
      assigned_to: staff1._id,
      customer_id: customers[2]._id,
      status: 'pending',
      due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Contract Verification & Architecture Validation',
      description: 'Review technical prerequisites and verify cloud deployment compatibility.',
      assigned_to: staff3._id,
      customer_id: customers[3]._id,
      status: 'completed',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seeding Activity Logs...');
  await ActivityLog.create([
    {
      user_id: admin._id,
      action: 'Workspace Initialized',
      description: 'VeltrixCRM production database initialized successfully',
    },
    {
      user_id: staff1._id,
      action: 'Task Updated',
      description: 'Updated Quarterly Security Audit status to in_progress',
    },
    {
      user_id: staff2._id,
      action: 'Customer Onboarded',
      description: 'Onboarded Stellar AI Technologies into active pipeline',
    },
    {
      user_id: admin._id,
      action: 'Staff Member Authorized',
      description: 'Marcus Vance authorized as Operational Staff',
    },
  ]);

  console.log('Seeding Notifications...');
  await Notification.create([
    {
      user_id: admin._id,
      title: 'Welcome to VeltrixCRM',
      message: 'Your high-performance MERN architecture is operational with MongoDB.',
      is_read: false,
    },
    {
      user_id: staff1._id,
      title: 'New Customer Assignment',
      message: 'You have been assigned Acme Global Corporation.',
      is_read: false,
    },
    {
      user_id: staff2._id,
      title: 'Task Assigned',
      message: 'New task: Onboarding Milestone Call with Nova Dynamics.',
      is_read: false,
    },
  ]);

  console.log('✅ Seed complete!');
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
