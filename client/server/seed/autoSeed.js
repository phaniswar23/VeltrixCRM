import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

export const autoSeedIfEmpty = async () => {
  try {
    let admin = await User.findOne({ email: 'admin@veltrix.com' });
    let staff1 = await User.findOne({ email: 'staff@veltrix.com' });
    let staff2 = await User.findOne({ email: 'sarah@veltrix.com' });
    let staff3 = await User.findOne({ email: 'david@veltrix.com' });

    if (!admin) {
      console.log('[Seed] Auto-creating demo admin (admin@veltrix.com)...');
      admin = await User.create({
        name: 'Phaniswar',
        email: 'admin@veltrix.com',
        password: 'password123',
        role: 'admin',
        business_type: 'Enterprise SaaS',
      });
    }

    if (!staff1) {
      console.log('[Seed] Auto-creating demo staff 1: Marcus Vance (staff@veltrix.com)...');
      staff1 = await User.create({
        name: 'Marcus Vance',
        email: 'staff@veltrix.com',
        password: 'password123',
        role: 'staff',
        business_type: 'Operational Pipeline',
      });
    }

    if (!staff2) {
      console.log('[Seed] Auto-creating demo staff 2: Sarah Jenkins (sarah@veltrix.com)...');
      staff2 = await User.create({
        name: 'Sarah Jenkins',
        email: 'sarah@veltrix.com',
        password: 'password123',
        role: 'staff',
        business_type: 'Client Success',
      });
    }

    if (!staff3) {
      console.log('[Seed] Auto-creating demo staff 3: David Chen (david@veltrix.com)...');
      staff3 = await User.create({
        name: 'David Chen',
        email: 'david@veltrix.com',
        password: 'password123',
        role: 'staff',
        business_type: 'Enterprise Solutions',
      });
    }

    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('[Seed] Populating initial demo customers & tasks for all staff accounts...');
      const customers = await Customer.create([
        {
          name: 'Acme Global Corporation',
          email: 'partnerships@acmeglobal.com',
          phone: '+1 415 555 0192',
          status: 'active',
          assigned_to: staff1._id,
        },
        {
          name: 'Apex Financial Systems',
          email: 'lead@apexsystems.com',
          phone: '+1 212 555 0147',
          status: 'lead',
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
          name: 'Stellar AI Technologies',
          email: 'contact@stellarai.dev',
          phone: '+1 312 555 0781',
          status: 'active',
          assigned_to: staff2._id,
        },
        {
          name: 'Horizon Labs BioTech',
          email: 'operations@horizonlabs.org',
          phone: '+1 650 555 0932',
          status: 'lead',
          assigned_to: staff3._id,
        },
      ]);

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
          title: 'Prepare Enterprise SLA Proposal',
          description: 'Draft the multi-tier uptime guarantee and dedicated engineering support agreement.',
          assigned_to: staff1._id,
          customer_id: customers[1]._id,
          status: 'pending',
          due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Onboarding Milestone Call with Nova Dynamics',
          description: 'Facilitate setup walkthrough for the executive team and configure custom webhook integrations.',
          assigned_to: staff2._id,
          customer_id: customers[2]._id,
          status: 'pending',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Contract Verification & Architecture Validation',
          description: 'Review technical prerequisites and verify cloud deployment compatibility.',
          assigned_to: staff3._id,
          customer_id: customers[4]._id,
          status: 'completed',
          due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);

      await ActivityLog.create({
        user_id: admin._id,
        action: 'Workspace Initialized',
        description: 'VeltrixCRM production database initialized successfully with multi-staff pipelines',
      });

      await Notification.create({
        user_id: admin._id,
        title: 'Welcome to VeltrixCRM',
        message: 'Your high-performance MERN architecture is operational with MongoDB.',
        is_read: false,
      });
    }
  } catch (err) {
    console.warn('[Seed] Auto-seed check notice:', err.message);
  }
};
