"use client";
import React from "react";
import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { profileColor } from "@/utils/ProfileColor";
import { elevatedUsers } from "@/misc/users";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { UserInfo } from "@/types/User";

const UserDialog = dynamic(
	() => import("./UserDialog").then((a) => a.default),
	{ ssr: false },
);

export default function ProfileBadge({
	className,
	user,
}: { className?: string; user: UserInfo }) {
	const router = useRouter();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [dialogRoot, setDialogRoot] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setDialogRoot(document.getElementById("dialog-root"));

		return () => {
			setDialogRoot(null);
		};
	}, []);

	const openDialog = () => setIsDialogOpen(true);
	const closeDialog = () => setIsDialogOpen(false);
	const logout = () => {
		const log = confirm("Are you sure to logout?");
		if (log) {
			router.push("/auth/logout");
		} else return;
	};

	return (
		<>
			<div
				aria-haspopup="dialog"
				// biome-ignore lint/a11y/useSemanticElements: this acts as backdrop
				role="button"
				tabIndex={0}
				onKeyDown={(key) => {
					if (key.key === "p") openDialog();
				}}
				onClick={openDialog}
				className={`${className} flex w-full items-center space-x-3 rounded-full bg-light-background-dark p-1 transition duration-150 lg:w-[82%] dark:bg-dark-background-darker`}
			>
				<div
					className={
						"flex h-10 w-10 items-center justify-center rounded-full text-dark-background-darker"
					}
					style={{ backgroundColor: profileColor(user?.regNumber as string) }}
				>
					<span className="text-lg font-semibold">
						{elevatedUsers.includes(user?.regNumber as string) ? (
							<Image
								className="mt-1"
								src="/images/batman.svg"
								alt="Batman"
								width={40}
								height={40}
								style={{ width: "auto", height: "40px" }}
							/>
						) : (
							<FaUser />
						)}
					</span>
				</div>
				<span className="text-md line-clamp-1 flex-grow text-ellipsis font-medium capitalize text-light-accent dark:text-dark-color">
					{user?.name?.toLowerCase()}
				</span>
			</div>
			{dialogRoot &&
				createPortal(
					<UserDialog
						user={user}
						logout={logout}
						isOpen={isDialogOpen}
						onClose={closeDialog}
					/>,
					dialogRoot,
				)}
		</>
	);
}
