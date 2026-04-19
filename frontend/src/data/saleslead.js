import { NextResponse } from 'next/server';
import { Lead } from '@/types/types';

// Mock data for leads
const leads: Lead[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    company: 'Tech Solutions Inc',
    location: 'mumbai',
    status: 'new',
    priority: 'hot',
    source: 'Website',
    assignedTo: '1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    value: 50000
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    company: 'Global Enterprises',
    location: 'delhi',
    status: 'contacted',
    priority: 'warm',
    source: 'Referral',
    assignedTo: '2',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15',
    value: 75000
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    company: 'Innovate Corp',
    location: 'mumbai',
    status: 'qualified',
    priority: 'hot',
    source: 'Social Media',
    assignedTo: '1',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-14',
    value: 100000
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91 98765 43213',
    company: 'Digital Solutions',
    location: 'bangalore',
    status: 'completed',
    priority: 'warm',
    source: 'Website',
    assignedTo: '3',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-13',
    value: 60000
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 98765 43214',
    company: 'Finance Plus',
    location: 'delhi',
    status: 'lost',
    priority: 'cold',
    source: 'Email Campaign',
    assignedTo: '2',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-12',
    value: 45000
  },
  {
    id: '6',
    name: 'Anjali Mehta',
    email: 'anjali@example.com',
    phone: '+91 98765 43215',
    company: 'Health Care Ltd',
    location: 'mumbai',
    status: 'negotiation',
    priority: 'hot',
    source: 'Referral',
    assignedTo: '1',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-11',
    value: 120000
  },
  {
    id: '7',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    phone: '+91 98765 43216',
    company: 'EduTech Solutions',
    location: 'chennai',
    status: 'proposal',
    priority: 'warm',
    source: 'Website',
    assignedTo: '4',
    createdAt: '2024-01-09',
    updatedAt: '2024-01-10',
    value: 80000
  },
  {
    id: '8',
    name: 'Neha Gupta',
    email: 'neha@example.com',
    phone: '+91 98765 43217',
    company: 'Retail Hub',
    location: 'delhi',
    status: 'new',
    priority: 'hot',
    source: 'Social Media',
    assignedTo: '2',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-09',
    value: 55000
  },
  {
    id: '9',
    name: 'Sanjay Malhotra',
    email: 'sanjay@example.com',
    phone: '+91 98765 43218',
    company: 'Manufacturing Corp',
    location: 'mumbai',
    status: 'contacted',
    priority: 'warm',
    source: 'Email Campaign',
    assignedTo: '1',
    createdAt: '2024-01-07',
    updatedAt: '2024-01-08',
    value: 95000
  },
  {
    id: '10',
    name: 'Pooja Joshi',
    email: 'pooja@example.com',
    phone: '+91 98765 43219',
    company: 'Tech Innovations',
    location: 'hyderabad',
    status: 'qualified',
    priority: 'hot',
    source: 'Referral',
    assignedTo: '3',
    createdAt: '2024-01-06',
    updatedAt: '2024-01-07',
    value: 70000
  },
  // Add more Mumbai leads
  {
    id: '11',
    name: 'Manoj Desai',
    email: 'manoj@example.com',
    phone: '+91 98765 43220',
    company: 'Mumbai Finance',
    location: 'mumbai',
    status: 'new',
    priority: 'warm',
    source: 'Website',
    assignedTo: '1',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-06',
    value: 65000
  },
  {
    id: '12',
    name: 'Suresh Nair',
    email: 'suresh@example.com',
    phone: '+91 98765 43221',
    company: 'Coastal Shipping',
    location: 'mumbai',
    status: 'completed',
    priority: 'hot',
    source: 'Referral',
    assignedTo: '1',
    createdAt: '2024-01-04',
    updatedAt: '2024-01-05',
    value: 85000
  },
  // Add more Delhi leads
  {
    id: '13',
    name: 'Rohan Khanna',
    email: 'rohan@example.com',
    phone: '+91 98765 43222',
    company: 'Delhi Traders',
    location: 'delhi',
    status: 'negotiation',
    priority: 'hot',
    source: 'Social Media',
    assignedTo: '2',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-04',
    value: 90000
  },
  {
    id: '14',
    name: 'Kavita Singh',
    email: 'kavita@example.com',
    phone: '+91 98765 43223',
    company: 'North India Corp',
    location: 'delhi',
    status: 'proposal',
    priority: 'warm',
    source: 'Website',
    assignedTo: '2',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-03',
    value: 75000
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const salesId = searchParams.get('salesId');
  const status = searchParams.get('status');

  let filteredLeads = [...leads];

  if (location && location !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.location === location);
  }

  if (salesId && salesId !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.assignedTo === salesId);
  }

  if (status && status !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.status === status);
  }

  return NextResponse.json(filteredLeads);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newLead: Lead = {
      id: (leads.length + 1).toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      ...data
    };
    
    leads.push(newLead);
    
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}