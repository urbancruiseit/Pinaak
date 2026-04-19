"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type LeadRecord = {
  id: string;
  date: string;
  enquiryTime?: string;
  source: "Call" | "Email" | "WhatsApp" | "Reference" | "Repeat";
  status: "New" | "RFQ" | "Hot" | "Book" | "Veh-n" | "Lost" | "Kyc";
  telecaller: string;
  region: string;
  city: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  customerType: "Personal" | "Corporate" | "Travel Agent";
  serviceType: "Wedding" | "Vacation" | "Pilgrimage" | "Corporate" | "Local";
  tripType: "pickup" | "drop" | "both";
  pickupDateTime: string;
  dropDateTime?: string;
  pickupAddress?: string;
  dropAddress?: string;
  itinerary?: string[];
  vehicles?: { type: string; category: string; vehicle3: string }[];
  passengerTotal: number;
  days: number;
  km: number;
  petsNumber: number;
  petsNames?: string;
  smallBaggage: number;
  mediumBaggage: number;
  largeBaggage: number;
  airportBaggage: number;
  totalBaggage: number;
  remarks?: string;
  message?: string;
  lost_reason?: string;
};

export default function BDMDashboard() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const response = await fetch("/api/leads");
        if (response.ok) {
          const data = await response.json();
          setLeads(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load leads:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLeads();
  }, []);

  const totalLeads = leads.length;
  const bookedLeads = leads.filter((lead) => lead.status === "Book").length;
  const conversionRate =
    totalLeads > 0 ? Math.round((bookedLeads / totalLeads) * 100) : 0;
  const revenue = bookedLeads * 50000; // Assuming average revenue per booking

  // Team performance
  const teamPerformance = leads.reduce((acc: any, lead) => {
    const telecaller = lead.telecaller || "Unknown";
    if (!acc[telecaller]) {
      acc[telecaller] = { total: 0, booked: 0 };
    }
    acc[telecaller].total++;
    if (lead.status === "Book") acc[telecaller].booked++;
    return acc;
  }, {});

  // City-wise stats
  const cityStats = leads.reduce((acc: any, lead) => {
    const city = lead.city || "Unknown";
    if (!acc[city]) {
      acc[city] = { total: 0, current: 0, aged: 0 };
    }
    acc[city].total++;
    if (lead.status !== "Book" && lead.status !== "Lost") acc[city].current++;
    const leadDate = new Date(lead.date);
    const now = new Date();
    const diffTime = now.getTime() - leadDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    if (diffDays > 7) acc[city].aged++;
    return acc;
  }, {});

  const stats = [
    { title: "Total Leads", value: totalLeads, color: "bg-blue-500" },
    { title: "Booked Leads", value: bookedLeads, color: "bg-green-500" },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      color: "bg-purple-500",
    },
    {
      title: "Estimated Revenue",
      value: `₹${revenue.toLocaleString()}`,
      color: "bg-yellow-500",
    },
  ];

  // Chart data for leads over time
  const chartData = leads.reduce((acc: any, lead) => {
    const date = new Date(lead.date);
    let key: string;
    if (period === "month") {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else if (period === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = lead.date;
    }
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartArray = Object.entries(chartData)
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">BDM Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg shadow p-6 border">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${stat.color} mr-3`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leads Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Leads Over Time</h2>
        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              value="month"
              checked={period === "month"}
              onChange={(e) => setPeriod(e.target.value as "month")}
              className="mr-2"
            />
            Month
          </label>
          <label className="mr-4">
            <input
              type="radio"
              value="week"
              checked={period === "week"}
              onChange={(e) => setPeriod(e.target.value as "week")}
              className="mr-2"
            />
            Week
          </label>
          <label>
            <input
              type="radio"
              value="day"
              checked={period === "day"}
              onChange={(e) => setPeriod(e.target.value as "day")}
              className="mr-2"
            />
            Day
          </label>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartArray}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Telecaller
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Leads
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Booked
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(teamPerformance).map(
                  ([telecaller, stats]: [string, any]) => (
                    <tr key={telecaller} className="border-t">
                      <td className="px-4 py-2 text-sm font-medium">
                        {telecaller}
                      </td>
                      <td className="px-4 py-2 text-sm">{stats.total}</td>
                      <td className="px-4 py-2 text-sm">{stats.booked}</td>
                      <td className="px-4 py-2 text-sm">
                        {stats.total > 0
                          ? Math.round((stats.booked / stats.total) * 100)
                          : 0}
                        %
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* City-wise Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">City-wise Overview</h2>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    City
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Trips
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Current
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Aged
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cityStats).map(
                  ([city, stats]: [string, any]) => (
                    <tr key={city} className="border-t">
                      <td className="px-4 py-2 text-sm font-medium">{city}</td>
                      <td className="px-4 py-2 text-sm">{stats.total}</td>
                      <td className="px-4 py-2 text-sm">{stats.current}</td>
                      <td className="px-4 py-2 text-sm">{stats.aged}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
