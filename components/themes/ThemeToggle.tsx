"use client";
import { Themes } from "@/misc/theme";
import { useTheme } from "@/provider/ThemeProvider";
import { Link } from "next-view-transitions";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { BiBrush } from "react-icons/bi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";

export default function ThemeToggle({
	className,
}: {
	className?: string;
}) {
	const { theme: actualtheme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const selectRef = React.useRef<HTMLSelectElement>(null);

	const handleButtonClick = () => {
		setOpen((prev) => !prev);
		setDropdownOpen(false);
		if (selectRef.current) {
			selectRef.current.focus();
			selectRef.current.size = Themes.length;
		}
	};

	const handleThemeSelect = (themeTitle: string) => {
		setTheme(themeTitle);
		setDropdownOpen(false);
	};

	return (
		<>
			<div className={className ?? ""}>
				<div className="relative">
					<button
						type="button"
						onClick={handleButtonClick}
						title="Toggle Theme (Ctrl+Shift+P)"
						className={
							"text-md rounded-full p-2 opacity-60 transition duration-150 text-light-color dark:text-dark-color hover:bg-light-background-dark active:-rotate-45 dark:hover:bg-dark-background-dark cursor-pointer"
						}
					>
						<BiBrush className="text-lg" />
					</button>
				</div>
			</div>
			{open &&
				createPortal(
					<div
						onClick={() => {
							setOpen(false);
							setDropdownOpen(false);
						}}
						onKeyDown={(event) => {
							if (event.key === "Escape") {
								setOpen(false);
								setDropdownOpen(false);
							}
						}}
						className="fixed transition-all duration-75 animate-fadeIn inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 dark:bg-black/30 overflow-hidden"
					>
						<div
							onClick={(e) => {
								e.stopPropagation();
							}}
							onKeyDown={() => { }}
							className={`${dropdownOpen ? "max-h-[80vh] h-full" : "max-h-[calc(100vh-8rem)]"} relative w-[calc(100%-2rem)] sm:w-full max-w-96 m-4 rounded-3xl shadow-lg bg-light-background-normal dark:bg-dark-background-normal`}
						>
							<div className={`h-full overflow-y-auto`}>
								<ul
									className="p-3 text-sm text-light-color dark:text-dark-color flex flex-col gap-1"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="options-menu"
								>
									{Themes.map((theme) => {
										const isMainTheme = ["Light", "Dark", "Batman"].includes(theme.title);
										if (isMainTheme) {
											return (
												<li
													key={theme.title}
													className={`cursor-pointer flex items-center justify-start gap-5 select-none rounded-xl font-semibold relative py-2.5 pl-3 pr-9 hover:bg-light-input dark:hover:bg-dark-input ${actualtheme === theme.title ? "bg-light-input dark:bg-dark-input" : ""}`}
													onClick={() => handleThemeSelect(theme.title)}
												>
													<ColorPalette properties={theme.properties} /> {theme.title}
												</li>
											);
										}
										return null;
									})}
									<div className="relative">
										<li
											className={`cursor-pointer flex items-center justify-between gap-5 select-none rounded-xl font-semibold relative py-2.5 px-3 hover:bg-light-input dark:hover:bg-dark-input ${dropdownOpen ? "bg-light-input dark:bg-dark-input" : ""}`}
											onClick={() => setDropdownOpen(!dropdownOpen)}
										>
											<div className="flex gap-2 items-center">
												<div className="flex gap-1 rounded-full p-0.5 bg-black/10 dark:bg-white/10">
													<div className="w-4 h-4 rounded-lg bg-light-accent dark:bg-dark-accent" />
												</div>
												More Themes
											</div>
											{dropdownOpen ? <FaChevronDown  /> :
											<FaChevronRight />}
										</li>
										{dropdownOpen && (
											<ul className="bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-lg p-2 z-20 h-full overflow-y-auto">
												{Themes.map((theme) => {
													const isMainTheme = ["Light", "Dark", "Batman"].includes(theme.title);
													if (!isMainTheme) {
														return (
															<li
																key={theme.title}
																className={`cursor-pointer flex items-center justify-start gap-5 select-none rounded-xl font-semibold relative py-2.5 pl-3 pr-9 hover:bg-light-input dark:hover:bg-dark-input ${actualtheme === theme.title ? "bg-light-input dark:bg-dark-input" : ""}`}
																onClick={() => handleThemeSelect(theme.title)}
															>
																<ColorPalette properties={theme.properties} /> {theme.title}
															</li>
														);
													}
													return null;
												})}
											</ul>
										)}
									</div>
									<Link
										href="https://github.com/rahuletto/classpro/blob/ssr/CONTRIBUTING.md#theming"
										target="_blank"
										className={
											"cursor-pointer flex bg-light-accent dark:bg-dark-accent items-center justify-start gap-5 select-none rounded-xl font-semibold relative py-2.5 mt-2 px-6 text-light-background-light dark:text-dark-background-darker"
										}
									>
										Bring your theme
									</Link>
								</ul>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

function ColorPalette({
	properties,
}: {
	properties: Record<string, string>;
}) {
	return (
		<div className="flex gap-1 rounded-full p-0.5 bg-black/10 dark:bg-white/10">
			{["background-normal", "background-light", "accent", "color"].map(
				(key, index) => (
					<div
						key={key}
						className={"w-4 h-4  rounded-lg"}
						style={{
							backgroundColor: `rgb(${properties[key]})`,
							marginLeft: index !== 0 ? "-8px" : "0px",
						}}
					/>
				),
			)}
		</div>
	);
}
