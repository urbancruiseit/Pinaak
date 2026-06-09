"use client";

export default function MonthlyEnquiryReportUI() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // Current Month Index
  const currentMonthIndex = new Date().getMonth();

  // Reorder months from current month
  const orderedMonths = [
    ...months.slice(currentMonthIndex),
    ...months.slice(0, currentMonthIndex),
  ];

  // Split into 2 containers
  const firstContainerMonths = orderedMonths.slice(0, 6);
  const secondContainerMonths = orderedMonths.slice(6, 12);

  const containers = [firstContainerMonths, secondContainerMonths];

  return (
    <div className="p-4 overflow-auto bg-white">
      {containers.map((displayMonths, index) => (
        <div
          key={index}
          className="border-[3px] border-black mb-8 min-w-[1700px]"
        >
          {/* Header */}
          <div className="flex">
            <div className="w-[70px] bg-purple-700 border-r border-black"></div>

            <div className="flex-1 bg-green-700 text-white text-center font-bold text-2xl py-1 border-r border-black">
              MONTHLY ENQUIRY REPORT - LEAD TRENDS
            </div>

            <div className="w-[120px] bg-green-700 text-yellow-300 text-center font-bold text-xl border-r border-black flex items-center justify-center">
              DELHI
            </div>

            {/* Current Month */}
            <div className="w-[100px] bg-pink-600 text-white text-center font-bold text-xl border-r border-black flex items-center justify-center">
              {displayMonths[0]}
            </div>

            {/* Months */}
            <div className="w-[350px] bg-yellow-300 text-green-700 text-center font-bold text-lg flex items-center justify-center">
              {displayMonths.join(" | ")}
            </div>
          </div>

          {/* Table */}
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-gray-500 bg-yellow-200 w-[80px]">
                  Month
                </th>

                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-500 bg-yellow-100 text-xs w-[40px]"
                  >
                    {day}
                  </th>
                ))}

                <th className="border border-gray-500 bg-yellow-300 w-[70px]">
                  TOT
                </th>

                <th className="border border-gray-500 bg-yellow-300 w-[70px]">
                  AVG
                </th>

                <th className="border border-gray-500 bg-yellow-300 w-[70px]">
                  AVG-2
                </th>
              </tr>
            </thead>

            <tbody>
              {displayMonths.map((month) => (
                <tr key={month}>
                  <td className="border border-gray-400 text-red-600 font-semibold text-center">
                    {month}
                  </td>

                  {days.map((day) => (
                    <td
                      key={day}
                      className="border border-gray-300 bg-gray-100 h-7"
                    >
                      &nbsp;
                    </td>
                  ))}

                  <td className="border border-gray-400 bg-lime-200"></td>
                  <td className="border border-gray-400 bg-lime-200"></td>
                  <td className="border border-gray-400 bg-lime-200"></td>
                </tr>
              ))}

              {/* Total Row */}
              <tr>
                <td className="border border-black bg-yellow-300 font-bold text-center">
                  TOTAL
                </td>

                {days.map((day) => (
                  <td
                    key={day}
                    className="border border-black bg-yellow-100"
                  ></td>
                ))}

                <td className="border border-black bg-yellow-300"></td>
                <td className="border border-black bg-yellow-300"></td>
                <td className="border border-black bg-yellow-300"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
