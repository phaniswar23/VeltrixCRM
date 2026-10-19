import axios from 'axios';

const getVeltrixFallbackReply = (message) => {
  const msg = (message || '').toLowerCase();

  if (
    msg.includes('ceo') ||
    msg.includes('founder') ||
    msg.includes('creator') ||
    msg.includes('owner') ||
    msg.includes('phaniswar')
  ) {
    return 'The Founder and CEO of VeltrixCRM is Phaniswar. Under his leadership, VeltrixCRM has been crafted as a premium, high-end SaaS CRM platform designed for ultimate clarity, dynamic control, and intelligent customer operations.';
  }

  if (msg.includes('lead') || msg.includes('customer') || msg.includes('pipeline')) {
    return "In VeltrixCRM, leads and customers are managed under the 'Customers' tab. You can track contact information, pipeline stages (active/lead/inactive), and quickly inspect details or start direct WhatsApp communications.";
  }

  if (
    msg.includes('staff') ||
    msg.includes('member') ||
    msg.includes('personnel') ||
    msg.includes('team')
  ) {
    return "VeltrixCRM allows administrators to orchestrate team permissions in the 'Staff Management' section. You can view, add, or edit team members, assign custom roles, and inspect staff profiles via the details modal.";
  }

  if (msg.includes('task') || msg.includes('todo') || msg.includes('assign')) {
    return "The 'Tasks' section is designed to manage day-to-day deliverables. You can create new tasks, prioritize them, assign them to team members, and track completion status in real-time.";
  }

  if (
    msg.includes('chart') ||
    msg.includes('analytic') ||
    msg.includes('metric') ||
    msg.includes('stat')
  ) {
    return 'The Analytics dashboard gives you visual insights into staff performance flows, lead distributions, and operational milestones, helping you make data-driven decisions.';
  }

  if (
    msg.includes('price') ||
    msg.includes('plan') ||
    msg.includes('cost') ||
    msg.includes('upgrade')
  ) {
    return "VeltrixCRM offers flexible plans tailored to your team size: Starter (₹0 forever), Professional (₹999/mo), and Enterprise (₹2999/mo). You can upgrade your plan directly by navigating to the Pricing page or clicking the 'Upgrade Experience' card.";
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return 'Hello! I am Veltrix AI, your intelligent virtual assistant. How can I facilitate your CRM leads, staff management, tasks, or analytics today?';
  }

  return 'VeltrixCRM is a premium SaaS customer management platform designed for operational intelligence and seamless team collaboration. You can manage customer pipelines, delegate team tasks, inspect staff performance, and utilize live analytics directly from the navigation sidebar.';
};

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [
              {
                parts: [{ text: message }],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: 'You are Veltrix AI, the intelligent virtual assistant built into VeltrixCRM. VeltrixCRM is a premium, high-end SaaS CRM platform for orchestrating customer operations, managing lead pipelines, task flows, and operational analytics. The Founder and CEO of VeltrixCRM is Phaniswar. Keep your responses highly professional, clean, helpful, concise, and focused on assisting the staff or administrator with CRM capabilities.',
                },
              ],
            },
          },
          { timeout: 7000 }
        );

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({ reply });
        }
      } catch (geminiErr) {
        console.warn('[Veltrix AI] Gemini API call skipped or errored; falling back to contextual AI reply');
      }
    }

    // Smart contextual fallback
    const fallbackReply = getVeltrixFallbackReply(message);
    return res.json({ reply: fallbackReply });
  } catch (error) {
    const fallbackReply = getVeltrixFallbackReply(req.body?.message || '');
    return res.json({ reply: fallbackReply });
  }
};
