import React, { useEffect, useMemo, useState } from "react";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const LEETCODE_API_BASE_URL = "https://leetcode-api-faisalshohag.vercel.app";

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMondayStart(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - daysFromMonday);

  return result;
}

function parseLeetcodeCalendar(submissionCalendar) {
  if (!submissionCalendar) return new Map();

  try {
    const calendar =
      typeof submissionCalendar === "string"
        ? JSON.parse(submissionCalendar)
        : submissionCalendar;

    return Object.entries(calendar).reduce((counts, [timestamp, count]) => {
      const submittedAt = new Date(Number(timestamp) * 1000);
      submittedAt.setHours(0, 0, 0, 0);
      counts.set(getDateKey(submittedAt), Number(count) || 0);

      return counts;
    }, new Map());
  } catch (err) {
    console.error("Error parsing LeetCode submission calendar:", err);
    return new Map();
  }
}

function buildCodeforcesCounts(
  submissions,
  { acceptedOnly, firstVisibleDay, today },
) {
  return submissions.reduce((counts, submission) => {
    if (acceptedOnly && submission.verdict !== "OK") {
      return counts;
    }

    if (!submission.creationTimeSeconds) {
      return counts;
    }

    const submittedAt = new Date(submission.creationTimeSeconds * 1000);
    submittedAt.setHours(0, 0, 0, 0);

    if (submittedAt < firstVisibleDay || submittedAt > today) {
      return counts;
    }

    const dateKey = getDateKey(submittedAt);
    counts.set(dateKey, (counts.get(dateKey) || 0) + 1);

    return counts;
  }, new Map());
}

function getContributionLevel(count) {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

function buildContributionWeeks({
  leetcodeCalendar,
  codeforcesSubmissions,
  acceptedOnly,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstVisibleDay = getMondayStart(
    new Date(today.getTime() - 364 * MS_PER_DAY),
  );
  const lastVisibleDay = new Date(today);
  const leetcodeCounts = parseLeetcodeCalendar(leetcodeCalendar);
  const codeforcesCounts = buildCodeforcesCounts(codeforcesSubmissions, {
    acceptedOnly,
    firstVisibleDay,
    today,
  });
  const weeks = [];
  let leetcodeTotal = 0;
  let codeforcesTotal = 0;
  let week = [];

  for (
    let cursor = new Date(firstVisibleDay);
    cursor <= lastVisibleDay;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const date = new Date(cursor);
    const dateKey = getDateKey(date);
    const leetcodeCount = leetcodeCounts.get(dateKey) || 0;
    const codeforcesCount = codeforcesCounts.get(dateKey) || 0;
    const count = leetcodeCount + codeforcesCount;

    leetcodeTotal += leetcodeCount;
    codeforcesTotal += codeforcesCount;
    week.push({
      date: dateKey,
      count,
      leetcodeCount,
      codeforcesCount,
      level: getContributionLevel(count),
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    weeks.push(week);
  }

  return {
    weeks,
    leetcodeTotal,
    codeforcesTotal,
    totalSubmissions: leetcodeTotal + codeforcesTotal,
  };
}

async function fetchLeetcodeCalendar(user, signal) {
  const response = await fetch(
    `${LEETCODE_API_BASE_URL}/${encodeURIComponent(user)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch LeetCode submissions");
  }

  const data = await response.json();

  if (!data?.submissionCalendar) {
    throw new Error("LeetCode user was not found");
  }

  return data.submissionCalendar;
}

async function fetchCodeforcesSubmissions(user, count, signal) {
  const response = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
      user,
    )}&from=1&count=${count}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Codeforces submissions");
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(data.comment || "Codeforces returned an error");
  }

  return data.result || [];
}

export default function CombinedCodingContributionGraph({
  className = "",
  leetcodeUser = "VedantTapkir",
  codeforcesUser = "vedanttapkir",
  codeforcesCount = 10000,
  acceptedOnly = false,
}) {
  const [leetcodeCalendar, setLeetcodeCalendar] = useState(null);
  const [codeforcesSubmissions, setCodeforcesSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSubmissions() {
      try {
        setLoading(true);
        setError(null);

        const [nextLeetcodeCalendar, nextCodeforcesSubmissions] =
          await Promise.all([
            fetchLeetcodeCalendar(leetcodeUser, controller.signal),
            fetchCodeforcesSubmissions(
              codeforcesUser,
              codeforcesCount,
              controller.signal,
            ),
          ]);

        setLeetcodeCalendar(nextLeetcodeCalendar);
        setCodeforcesSubmissions(nextCodeforcesSubmissions);
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }

        console.error("Error fetching coding submissions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSubmissions();

    return () => controller.abort();
  }, [acceptedOnly, codeforcesCount, codeforcesUser, leetcodeUser]);

  const { totalSubmissions, leetcodeTotal, codeforcesTotal, weeks } = useMemo(
    () =>
      buildContributionWeeks({
        leetcodeCalendar,
        codeforcesSubmissions,
        acceptedOnly,
      }),
    [acceptedOnly, codeforcesSubmissions, leetcodeCalendar],
  );

  const monthLabels = useMemo(() => {
    const allMonthChanges = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const date = new Date(`${week[0].date}T00:00:00`);
        const month = date.getMonth();

        if (month !== lastMonth) {
          allMonthChanges.push({
            month: date.toLocaleDateString("en-US", { month: "short" }),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return allMonthChanges.reduce((labels, change) => {
      const lastAddedLabel = labels[labels.length - 1];
      const pixelDistance = lastAddedLabel
        ? (change.weekIndex - lastAddedLabel.weekIndex) * 16.5
        : Infinity;

      if (
        !lastAddedLabel ||
        (pixelDistance >= 65 && change.month !== lastAddedLabel.month)
      ) {
        labels.push(change);
      }

      return labels;
    }, []);
  }, [weeks]);

  const getLevelColor = (level) => {
    switch (level) {
      case 0:
        return "bg-amber-50/10";
      case 1:
        return "bg-amber-50/40";
      case 2:
        return "bg-amber-50/60";
      case 3:
        return "bg-amber-50/80";
      case 4:
        return "bg-amber-50";
      default:
        return "bg-zinc-900";
    }
  };

  const getTileLink = (day) => {
    if (day.codeforcesCount > day.leetcodeCount) {
      return `https://codeforces.com/submissions/${codeforcesUser}`;
    }

    return `https://leetcode.com/u/${leetcodeUser}/`;
  };

  if (loading) {
    return (
      <div
        className={`rounded-2xl p-6 shadow-2xl border border-gray-800 relative backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-amber-50/80">Loading coding activity...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl p-6 shadow-2xl border border-gray-800 relative backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-amber-50/80">
            Unable to load coding submissions
          </div>
        </div>
      </div>
    );
  }

  return (
    <fieldset>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl md:text-lg font-light">
              <span className="font-semibold">
                {totalSubmissions.toLocaleString()}
              </span>{" "}
              coding submissions in the last year
            </h3>
            <div className="mt-1 text-xs text-amber-50/70">
              LeetCode {leetcodeTotal.toLocaleString()} | Codeforces{" "}
              {codeforcesTotal.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <a
              href={`https://leetcode.com/u/${leetcodeUser}/`}
              target="_blank"
              rel="noreferrer"
              className="text-amber-50/70 hover:text-amber-50 transition-colors"
            >
              @{leetcodeUser}
            </a>
            <a
              href={`https://codeforces.com/profile/${codeforcesUser}`}
              target="_blank"
              rel="noreferrer"
              className="text-amber-50/70 hover:text-amber-50 transition-colors"
            >
              @{codeforcesUser}
            </a>
          </div>
        </div>

        <div className="relative overflow-x-auto w-full text-center">
          <div className="inline-block text-left min-w-max">
            <div className="mb-2 relative h-4 w-full mt-2">
              {monthLabels.map(({ month, weekIndex }) => (
                <div
                  key={`${month}-${weekIndex}`}
                  className="text-xs text-amber-50/80 absolute"
                  style={{ left: `calc(28px + ${weekIndex * 16.5}px)` }}
                >
                  {month}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col justify-between pr-2 text-xs text-amber-50/80 h-[105px] w-[28px]">
                {DAYS.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="h-[13px] flex items-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex gap-[3.5px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <a
                        key={day.date}
                        href={getTileLink(day)}
                        target="_blank"
                        rel="noreferrer"
                        className={`block w-[13px] h-[13px] rounded-sm ${getLevelColor(
                          day.level,
                        )} hover:ring-1 hover:ring-amber-50/50 transition-all cursor-pointer`}
                        title={`${day.count} submissions on ${day.date} | LeetCode ${day.leetcodeCount}, Codeforces ${day.codeforcesCount}`}
                        aria-label={`${day.count} coding submissions on ${day.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 m-4 text-xs text-amber-50/80">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-[13px] h-[13px] rounded-sm ${getLevelColor(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
