import React, { useEffect, useState } from "react";

export default function GitHubContributionGraph({ className = "" }) {
	const [contributions, setContributions] = useState(0);
	const [weeks, setWeeks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const username = "OctaFlick";

	useEffect(() => {
		async function fetchContributions() {
			try {
				// Fetch from GitHub's public contribution API (using the SVG endpoint)
				const response = await fetch(
					`https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
				);

				if (!response.ok) {
					throw new Error("Failed to fetch contributions");
				}

				const data = await response.json();

				// Transform the data to match our component format
				// Get total contributions by getting data.total.lastYear
				const totalContributions = data.total.lastYear;
				const transformedWeeks = [];
				const contributions = data.contributions;

				// Group contributions by week
				let currentWeek = [];
				contributions.forEach((contribution, index) => {
					const date = new Date(contribution.date);
					const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)

					const count = contribution.count;
					const level =
						count === 0 ? 0
						: count < 3 ? 1
						: count < 6 ? 2
						: count < 10 ? 3
						: 4;

					currentWeek.push({
						date: contribution.date,
						count,
						level,
					});

					// When we hit Saturday or it's the last item, push the week
					if (dayOfWeek === 6 || index === contributions.length - 1) {
						if (currentWeek.length > 0) {
							transformedWeeks.push([...currentWeek]);
							currentWeek = [];
						}
					}
				});

				setContributions(totalContributions);
				setWeeks(transformedWeeks);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching GitHub contributions:", err);
				setError(err instanceof Error ? err.message : "Unknown error");
				setLoading(false);
			}
		}

		fetchContributions();
	}, []);

	// Generate month labels based on actual contribution dates
	const getMonthLabels = () => {
		if (weeks.length === 0) return [];

		// First, collect all month change points
		const allMonthChanges = [];
		let lastMonth = -1;

		weeks.forEach((week, weekIndex) => {
			if (week.length > 0) {
				const date = new Date(week[0].date);
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

		// Filter to ensure minimum visual spacing (prevents label clumping)
		// Each week is 16.5px wide (13px square + 3.5px gap), min spacing ~65px for text
		const minPixelSpacing = 65;
		const pixelsPerWeek = 16.5;
		const labels = [];

		allMonthChanges.forEach((change) => {
			if (labels.length === 0) {
				// Always include the first month
				labels.push(change);
			} else {
				const lastAddedLabel = labels[labels.length - 1];
				const pixelDistance =
					(change.weekIndex - lastAddedLabel.weekIndex) * pixelsPerWeek;

				// Only add label if it's far enough from the last displayed label
				// AND it's not the same month name (prevents duplicate months)
				if (
					pixelDistance >= minPixelSpacing &&
					change.month !== lastAddedLabel.month
				) {
					labels.push(change);
				}
			}
		});

		return labels;
	};

	const monthLabels = getMonthLabels();
	const days = ["M", "T", "W", "T", "F", "S", "S"];

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

	if (loading) {
		return (
			<div
				className={`rounded-2xl p-6 shadow-2xl border border-gray-800 relative backdrop-blur-sm ${className}`}>
				<div className='flex items-center justify-center h-[200px]'>
					<div className='text-amber-50/80'>Loading contributions...</div>
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
						Unable to load GitHub contributions
					</div>
				</div>
			</div>
		);
	}

	return (
		<fieldset>
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h3 className='text-xl md:text-lg font-light'>
						<span className='font-semibold'>
							{contributions.toLocaleString()}
						</span>{" "}
						contributions in the last year
					</h3>
				</div>

				<div className='relative overflow-x-auto w-full text-center'>
					<div className='inline-block text-left min-w-max'>
						{/* Month labels */}
						<div className='mb-2 relative h-4 w-full mt-2'>
							{monthLabels.map(({ month, weekIndex }) => (
								<div
									key={`${month}-${weekIndex}`}
									className='text-xs text-amber-50/80 absolute'
									style={{ left: `calc(28px + ${weekIndex * 16}px)` }}>
									{month}
								</div>
							))}
						</div>

						<div className='flex gap-1'>
							{/* Day labels */}
							<div className='flex flex-col justify-between pr-2 text-xs text-amber-50/80 h-[105px] w-[28px]'>
								{days.map((day) => (
									<div key={day} className='h-[13px] flex items-center'>
										{day}
									</div>
								))}
							</div>

							{/* Contribution grid */}
							<div className='flex gap-[3.5px]'>
								{weeks.map((week, weekIndex) => (
									<div key={weekIndex} className='flex flex-col gap-[3px]'>
										{week.map((day, dayIndex) => (
											<div
												key={`${weekIndex}-${dayIndex}`}
												className={`w-[13px] h-[13px] rounded-sm ${getLevelColor(day.level)} hover:ring-1 hover:ring-amber-50/50 transition-all cursor-pointer`}
												title={`${day.count} contributions on ${day.date}`}
												onClick={() => {
													const formattedDate = day.date;
													window.open(
														`https://github.com/${username}?tab=overview&from=${formattedDate}&to=${formattedDate}`,
														"_blank",
													);
												}}
											/>
										))}
									</div>
								))}
							</div>
						</div>

						{/* Legend */}
						<div className='flex items-center justify-end gap-2 m-4 text-xs text-amber-50/80'>
							<span>Less</span>
							<div className='flex gap-1'>
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
