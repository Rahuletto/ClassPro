"use client";
import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";
import type { Course } from "@/types/Course";
import Card from "../components/Card";
import { CoursePapers } from "@/types/CoursePapers";

export default function Library({ courses, files }: { courses: Course[]; files: CoursePapers[] }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [semester, setSemester] = useState(0);
	const [searchResults, setSearchResults] = useState<CoursePapers[]>([]);
	const sortedFiles = files.sort((a, b) =>
		a.code.startsWith("21") ? -1 : b.code.startsWith("21") ? 1 : 0,
	);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const fuse = new Fuse(sortedFiles, {
		keys: ["name", "code"],
		threshold: 0.3,
	});

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (query.length > 1) {
			const results = fuse.search(query).map((result) => result.item);
			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	};

	return (
		<main
			className="relative p-2"
			style={{
				fontFamily: "'Bricolage Grotesque'",
			}}
		>
			<div className="flex flex-col md:flex-row justify-between mb-6 px-2 gap-5 items-center">
				<div
					id="title"
					className="title transition duration-200 flex flex-col gap-1 dark:text-dark-color items-center md:items-start justify-start text-light-color"
				>
					<h1 className="font-semibold text-4xl">Sem PYQs.</h1>

					<p className="dark:text-dark-color text-light-color transition duration-200 opacity-50 text-md font-medium">
						Get your hands on all the semester papers you need.
					</p>
				</div>
				<input
					type="text"
					placeholder="Search for papers"
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
					className="w-full py-2 px-4 rounded-xl focus:outline-hidden bg-light-input dark:bg-dark-input max-w-80 text-light-color dark:text-dark-color"
				/>
			</div>

			<div className="bg-light-background-light/50 pb-16 relative min-h-screen shadow-lg dark:bg-dark-background-darker/50 backdrop-blur-xs w-full h-full rounded-t-3xl p-4">
				<div className="flex overflow-x-auto pb-4 gap-4 items-center mb-2 justify-start w-full">
					<button
						type="button"
						onClick={() => setSemester(0)}
						disabled={searchQuery.length >= 1}
						className={`${
							searchQuery.length < 1 && semester === 0
								? "dark:bg-dark-accent bg-light-accent rounded-full text-light-background-light dark:text-dark-background-darker"
								: "dark:bg-dark-accent/20 bg-light-accent/20 rounded-xl text-light-accent dark:text-dark-accent"
						} transition-all px-3 py-2 min-w-32 text-base w-full disabled:opacity-20 disabled:cursor-not-allowed font-semibold cursor-pointer`}
					>
						My Papers
					</button>
					<div className="h-9 w-3 rounded-full bg-light-background-dark dark:bg-dark-background-light" />
					{Array.from({ length: 8 }, (_, i) => (
						<button
							key={i}
							type="button"
							onClick={() => setSemester(i + 1)}
							disabled={searchQuery.length >= 1}
							className={`${
								searchQuery.length < 1 && semester === i + 1
									? "dark:bg-dark-accent bg-light-accent rounded-full text-light-background-light dark:text-dark-background-darker"
									: "dark:bg-dark-accent/20 bg-light-accent/20 rounded-xl text-light-accent dark:text-dark-accent"
							} transition-all duration-500 px-3 py-2 min-w-32 text-base w-full disabled:opacity-20 disabled:cursor-not-allowed font-semibold cursor-pointer`}
						>
							Semester {i + 1}
						</button>
					))}
				</div>
				{semester === 0 ? null : (
					<p className="w-full text-center text-light-color dark:text-dark-color gap-1 flex items-center justify-center opacity-40 font-medium text-sm mb-4">
						Results:{" "}
						<strong className="text-light-accent dark:text-dark-accent">
							{searchResults.length > 1
								? searchResults.length
								: sortedFiles.filter((file) =>
										file.urls.some((url) => Number(url.semester) === semester),
									).length}{" "}
							courses
						</strong>{" "}
						with{" "}
						<strong className="text-light-accent dark:text-dark-accent">
							{searchResults.length > 1
								? searchResults.reduce(
										(acc, file) =>
											acc +
											file.urls.reduce(
												(urlAcc, urlGroup) => urlAcc + urlGroup.urls.length,
												0,
											),
										0,
									)
								: sortedFiles
										.filter((file) =>
											file.urls.some(
												(url) => Number(url.semester) === semester,
											),
										)
										.reduce(
											(acc, file) =>
												acc +
												file.urls.reduce(
													(urlAcc, urlGroup) => urlAcc + urlGroup.urls.length,
													0,
												),
											0,
										)}{" "}
							papers
						</strong>
					</p>
				)}
				{mounted && (
					<div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-4">
						{(searchResults.length >= 1
							? searchResults.sort((a, b) => {
									const aSemester = Math.min(
										...a.urls.map((url) => Number(url.semester)),
									);
									const bSemester = Math.min(
										...b.urls.map((url) => Number(url.semester)),
									);
									return aSemester - bSemester;
								})
							: semester === 0
								? sortedFiles.filter((a) =>
										courses.some((b) => a.code === b.code),
									)
								: sortedFiles.filter((file) =>
										file.urls.some((url) => Number(url.semester) === semester),
									)
						).map((result, index) => (
							<Card result={result} key={index} />
						))}
					</div>
				)}
				<p className="w-full absolute bottom-6 text-center text-light-color dark:text-dark-color gap-1 flex items-center justify-center opacity-40 font-medium text-sm mt-4">
					Database of
					<strong className="text-light-accent dark:text-dark-accent">
						{sortedFiles.length} courses
					</strong>{" "}
					with{" "}
					<strong className="text-light-accent dark:text-dark-accent">
						{sortedFiles.reduce(
							(acc, file) =>
								acc +
								file.urls.reduce(
									(urlAcc, urlGroup) => urlAcc + urlGroup.urls.length,
									0,
								),
							0,
						)}{" "}
						papers
					</strong>
				</p>
			</div>
		</main>
	);
}
