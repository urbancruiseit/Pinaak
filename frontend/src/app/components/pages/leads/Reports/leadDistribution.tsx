"use client";
import { fetchLeadDistribution } from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import App from "next/app";
import { useState, Fragment, use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const months = [
  { name: "Jan", days: 31 },
  { name: "Feb", days: 28 },
  { name: "Mar", days: 31 },
  { name: "Apr", days: 30 },
  { name: "May", days: 31 },
  { name: "Jun", days: 30 },
  { name: "Jul", days: 31 },
  { name: "Aug", days: 31 },
  { name: "Sep", days: 30 },
  { name: "Oct", days: 31 },
  { name: "Nov", days: 30 },
  { name: "Dec", days: 31 },
];

const team60 = [
  {
    name: "JK",
    color: "bg-indigo-50",
    bookColor: "bg-indigo-50",
    nameColor: "bg-indigo-50",
    leads: Array.from({ length: 31 }, () => Math.floor(Math.random() * 5)),
    book: Array.from({ length: 31 }, () => Math.floor(Math.random() * 2)),
  },
  {
    name: "LP",
    color: "bg-cyan-50",
    bookColor: "bg-cyan-50",
    nameColor: "bg-cyan-50",
    leads: Array.from({ length: 31 }, () => Math.floor(Math.random() * 6)),
    book: Array.from({ length: 31 }, () => Math.floor(Math.random() * 3)),
  },
  {
    name: "MN",
    color: "bg-rose-50",
    bookColor: "bg-rose-50",
    nameColor: "bg-rose-50",
    leads: Array.from({ length: 31 }, () => Math.floor(Math.random() * 5)),
    book: Array.from({ length: 31 }, () => Math.floor(Math.random() * 1)),
  },
];

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export default function DailyLeadReport() {
  const [year, setYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState(months[0].name);

  const monthObj = months.find((m) => m.name === selectedMonth)!;
  const daysArray = Array.from({ length: monthObj.days }, (_, i) => i);

  const allTeams = [{ teamName: "Team 60", members: team60 }];

  const cell = "border-r border-b border-gray-300 text-center px-1 py-1";
  const headCell = "border-r border-b border-gray-300 px-2 py-2 text-center";

  const allTeamsTotalLeads = allTeams.reduce(
    (tAcc, team) =>
      tAcc +
      team.members.reduce(
        (mAcc, p) => mAcc + sum(p.leads.slice(0, monthObj.days)),
        0,
      ),
    0,
  );

  const allTeamsTotalBook = allTeams.reduce(
    (tAcc, team) =>
      tAcc +
      team.members.reduce(
        (mAcc, p) => mAcc + sum(p.book.slice(0, monthObj.days)),
        0,
      ),
    0,
  );

  const allTeamsAvg = Math.round(allTeamsTotalLeads / monthObj.days);

  const allTeamsCntb =
    allTeamsTotalLeads > 0
      ? ((allTeamsTotalBook / allTeamsTotalLeads) * 100).toFixed(1)
      : "0.0";

  const allTeamsDayTotal = (day: number) =>
    allTeams.reduce(
      (tAcc, team) =>
        tAcc + team.members.reduce((mAcc, p) => mAcc + (p.leads[day] || 0), 0),
      0,
    );

  const dispatch = useDispatch<AppDispatch>();
  const { distribution } = useSelector((state: RootState) => state.report);
  console.log("Lead Distribution from Redux:", distribution);
  useEffect(() => {
    dispatch(fetchLeadDistribution({ month: selectedMonth, year }));
  }, [selectedMonth, year, dispatch]);
  return (
    <div className="">
      {/* HEADER */}
      <div className="mb-4 bg-orange-100 shadow-lg rounded-md flex justify-between items-center">
        <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
              <h2 className="text-4xl font-bold text-left py-4 text-orange-600 p-2">
                📊 Leads Distribution Report – {selectedMonth} {year}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded px-3 py-2 font-semibold"
          >
            {months.map((m) => (
              <option key={m.name}>{m.name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded px-3 py-2 font-semibold"
          >
            {["2024", "2025", "2026", "2027"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-400 border-separate border-spacing-0 text-md font-semibold">
          <thead>
            <tr className="bg-blue-950 text-white">
              <th className={headCell}>TEAM</th>
              <th className={headCell}>NAME</th>
              <th className={headCell}>STATUS</th>
              {daysArray.map((d) => (
                <th key={d} className={headCell}>
                  {d + 1}
                </th>
              ))}
              <th className="border-b border-white bg-blue-950 text-white px-2 py-2 relative">
                TOTAL
                {/* White border using outline */}
                <div className="absolute inset-0 pointer-events-none border-r border-white"></div>
              </th>
              <th className="border-b border-white bg-blue-950 text-white px-2 py-2 relative">
                AVG
                <div className="absolute inset-0 pointer-events-none border-r border-white"></div>
              </th>
              <th className="border-b border-white bg-blue-950 text-white px-2 py-2 relative">
                CNTB %
              </th>
            </tr>
          </thead>

          <tbody>
            {allTeams.map((team) => (
              <Fragment key={team.teamName}>
                {team.members.map((p, index) => {
                  const leads = p.leads.slice(0, monthObj.days);
                  const book = p.book.slice(0, monthObj.days);
                  const totalLeads = sum(leads);
                  const totalBook = sum(book);
                  const avg = Math.round(totalLeads / monthObj.days);
                  const cntb = totalLeads
                    ? ((totalBook / totalLeads) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <Fragment key={p.name}>
                      <tr className={p.color}>
                        {/* TEAM NAME VERTICAL */}
                        {index === 0 && (
                          <td
                            rowSpan={team.members.length * 2}
                            className="border-r border-b border-white text-center font-bold bg-blue-900 w-10"
                          >
                            <div className="flex items-center justify-center h-full">
                              <span
                                className="font-extrabold text-white text-lg whitespace-nowrap"
                                style={{
                                  writingMode: "vertical-rl",
                                  transform: "rotate(180deg)",
                                }}
                              >
                                {team.teamName}
                              </span>
                            </div>
                          </td>
                        )}

                        <td
                          rowSpan={2}
                          className={`${cell} font-bold text-xl ${p.nameColor}`}
                        >
                          {p.name}
                        </td>

                        <td className={`${cell} text-blue-700`}>Lead</td>

                        {leads.map((v, i) => (
                          <td key={i} className={cell}>
                            {v}
                          </td>
                        ))}

                        <td
                          className={`${cell} font-extrabold text-green-700 bg-amber-200`}
                        >
                          {totalLeads}
                        </td>

                        <td className={`${cell} font-extrabold bg-amber-200`}>
                          {avg}
                        </td>

                        <td
                          rowSpan={2}
                          className="border-b border-gray-400 px-2 py-1 font-extrabold text-purple-700 bg-amber-200"
                        >
                          {cntb}%
                        </td>
                      </tr>

                      <tr className={p.bookColor}>
                        <td className={`${cell} text-pink-700`}>Book</td>

                        {book.map((v, i) => (
                          <td key={i} className={cell}>
                            {v}
                          </td>
                        ))}

                        <td
                          className={`${cell} font-extrabold text-red-600 bg-amber-200`}
                        >
                          {totalBook}
                        </td>

                        <td
                          className={`${cell} font-extrabold text-red-600 bg-amber-200`}
                        >
                          -
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}

                {/* TEAM TOTAL */}
                <tr className="bg-amber-600 text-white font-extrabold">
                  <td colSpan={3} className={cell}>
                    Team Total
                  </td>

                  {daysArray.map((d) => (
                    <td key={d} className={cell}>
                      {team.members.reduce((a, p) => a + (p.leads[d] || 0), 0)}
                    </td>
                  ))}

                  <td className={`${cell} `}>
                    {team.members.reduce(
                      (a, p) => a + sum(p.leads.slice(0, monthObj.days)),
                      0,
                    )}
                  </td>
                  <td className={`${cell} `}>—</td>
                  <td className="">—</td>
                </tr>
              </Fragment>
            ))}

            {/* ALL TEAMS TOTAL */}
            <tr className="bg-blue-950 text-white font-extrabold text-xl h-10">
              <td colSpan={3} className={cell}>
                All Teams Total
              </td>
              {daysArray.map((d) => (
                <td key={d} className={cell}>
                  {allTeamsDayTotal(d)}
                </td>
              ))}
              <td className={`${cell}`}>{allTeamsTotalLeads}</td>
              <td className={`${cell} `}>{allTeamsAvg}</td>
              <td className="">{allTeamsCntb}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
