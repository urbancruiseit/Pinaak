import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

import { Bell } from "lucide-react";
import { getTodayFollowups } from "@/app/features/leadsFollowups/lead_followupsSlice";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function NotificationDropdown({ isOpen, onToggle }: Props) {
  const dispatch = useAppDispatch();

  const { todayFollowups, todayFollowupsLoading, todayFollowupsError } =
    useAppSelector((state) => state.followUp);

  useEffect(() => {
    dispatch(getTodayFollowups());
  }, [dispatch]);

  const unreadCount = todayFollowups.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border-2 border-orange-200 text-orange-600 hover:border-orange-400 hover:shadow-md transition-all duration-200"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Today's Followups
            </h3>
          </div>

          <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {todayFollowupsLoading && (
              <li className="px-4 py-3 text-sm text-gray-400">Loading...</li>
            )}

            {!todayFollowupsLoading && todayFollowupsError && (
              <li className="px-4 py-3 text-sm text-red-500">
                {todayFollowupsError}
              </li>
            )}

            {!todayFollowupsLoading &&
              !todayFollowupsError &&
              todayFollowups.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400">
                  No followups for today.
                </li>
              )}

            {!todayFollowupsLoading &&
              todayFollowups.map((f) => (
                <li
                  key={f.followup_id}
                  className="flex gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50"
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-orange-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {f.firstName} {f.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {f.remark || "No remark added"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {f.followup_date} • {f.customerPhone}
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
