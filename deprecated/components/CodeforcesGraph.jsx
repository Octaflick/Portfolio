import React, { useEffect, useMemo, useState } from "react";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

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

function buildContributionWeeks(submissions, { acceptedOnly }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const firstVisibleDay = getMondayStart(
		new Date(today.getTime() - 364 * MS_PER_DAY),
	);

	const lastVisibleDay = new Date(today);

	const dailyCounts = submissions.reduce((counts, submission) => {
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

	const maxCount = Math.max(0, ...dailyCounts.values());
	const weeks = [];
	let week = [];

	for (
		let cursor = new Date(firstVisibleDay);
		cursor <= lastVisibleDay;
		cursor.setDate(cursor.getDate() + 1)
	) {
		const date = new Date(cursor);
		const dateKey = getDateKey(date);
		const count = dailyCounts.get(dateKey) || 0;
		const isFuture = date > today;
		const level =
			count === 0 ? 0
			: maxCount <= 4 ? Math.min(count, 4)
			: Math.ceil((count / maxCount) * 4);

		week.push({
			date: dateKey,
			count,
			isFuture,
			level: isFuture ? 0 : level,
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
		totalSubmissions: Array.from(dailyCounts.values()).reduce(
			(total, count) => total + count,
			0,
		),
	};
}

export default function CodeforcesSubmissionGraph({
	className = "",
	user = "vedanttapkir",
	count = 10000,
	acceptedOnly = false,
}) {
	const [submissions, setSubmissions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchSubmissions() {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(
					`https://codeforces.com/api/user.status?handle=${encodeURIComponent(
						user,
					)}&from=1&count=${count}`,
					{ signal: controller.signal },
				);

				if (!response.ok) {
					throw new Error("Failed to fetch Codeforces submissions");
				}

				const data = await response.json();

				if (data.status !== "OK") {
					throw new Error(data.comment || "Codeforces returned an error");
				}

				setSubmissions(data.result || []);
			} catch (err) {
				if (err?.name === "AbortError") {
					return;
				}

				console.error("Error fetching Codeforces submissions:", err);
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		}

		fetchSubmissions();

		return () => controller.abort();
	}, [count, user]);

	const { totalSubmissions, weeks } = useMemo(
		() => buildContributionWeeks(submissions, { acceptedOnly }),
		[submissions, acceptedOnly],
	);

	const monthLabels = useMemo(() => {
		const labels = [];
		let lastMonth = -1;

		weeks.forEach((week, weekIndex) => {
			const firstDay = week[0];
			const date = new Date(`${firstDay.date}T00:00:00`);
			const month = date.getMonth();

			if (month !== lastMonth) {
				labels.push({
					month: date.toLocaleDateString("en-US", { month: "short" }),
					weekIndex,
				});
				lastMonth = month;
			}
		});

		return labels.reduce((visibleLabels, label) => {
			const previousLabel = visibleLabels[visibleLabels.length - 1];

			if (!previousLabel || label.weekIndex - previousLabel.weekIndex >= 4) {
				visibleLabels.push(label);
			}

			return visibleLabels;
		}, []);
	}, [weeks]);

	const getLevelColor = (level, isFuture) => {
		if (isFuture) return "bg-amber-50/10 opacity-30";

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

	if (loading) {
		return (
			<div
				className={`rounded-2xl p-6 shadow-2xl border border-gray-800 relative backdrop-blur-sm ${className}`}>
				<div className='flex items-center justify-center h-[200px]'>
					<div className='text-amber-50/80'>Loading Codeforces activity...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`rounded-2xl p-6 shadow-2xl border border-gray-800 relative backdrop-blur-sm ${className}`}>
				<div className='flex items-center justify-center h-[200px]'>
					<div className='text-amber-50/80'>
						Unable to load Codeforces submissions
					</div>
				</div>
			</div>
		);
	}

	return (
		<fieldset>
			<div className='space-y-6'>
				<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
					<h3 className='text-xl md:text-lg font-light'>
						<span className='font-semibold'>
							{totalSubmissions.toLocaleString()}
						</span>{" "}
						{acceptedOnly ? "accepted submissions" : "submissions"} in the last
						year
					</h3>
					<a
						href={`https://codeforces.com/profile/${user}`}
						target='_blank'
						rel='noreferrer'
						className='text-sm text-amber-50/70 hover:text-amber-50 transition-colors'>
						@{user}
					</a>
				</div>

				<div className='relative overflow-x-auto w-full text-center'>
					<div className='inline-block text-left min-w-max'>
						<div className='mb-2 relative h-4 w-full mt-2'>
							{monthLabels.map(({ month, weekIndex }) => (
								<div
									key={`${month}-${weekIndex}`}
									className='text-xs text-amber-50/80 absolute'
									style={{ left: `calc(28px + ${weekIndex * 16.5}px)` }}>
									{month}
								</div>
							))}
						</div>

						<div className='flex gap-1'>
							<div className='flex flex-col justify-between pr-2 text-xs text-amber-50/80 h-[105px] w-[28px]'>
								{DAYS.map((day, index) => (
									<div
										key={`${day}-${index}`}
										className='h-[13px] flex items-center'>
										{day}
									</div>
								))}
							</div>

							<div className='flex gap-[3.5px]'>
								{weeks.map((week, weekIndex) => (
									<div key={weekIndex} className='flex flex-col gap-[3px]'>
										{week.map((day) => (
											<a
												key={day.date}
												href={`https://codeforces.com/submissions/${user}`}
												target='_blank'
												rel='noreferrer'
												className={`block w-[13px] h-[13px] rounded-sm ${getLevelColor(
													day.level,
													day.isFuture,
												)} hover:ring-1 hover:ring-amber-50/50 transition-all cursor-pointer`}
												title={`${day.count} ${
													acceptedOnly ? "accepted submissions" : "submissions"
												} on ${day.date}`}
												aria-label={`${day.count} Codeforces submissions on ${day.date}`}
											/>
										))}
									</div>
								))}
							</div>
						</div>

						<div className='flex items-center justify-end gap-2 m-4 text-xs text-amber-50/80'>
							<span>Less</span>
							<div className='flex gap-1'>
								{[0, 1, 2, 3, 4].map((level) => (
									<div
										key={level}
										className={`w-[13px] h-[13px] rounded-sm ${getLevelColor(
											level,
											false,
										)}`}
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
