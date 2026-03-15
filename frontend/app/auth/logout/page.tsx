"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { RiLoader3Fill } from "react-icons/ri";
import { deleteCookie } from "@/utils/Cookies";

export default function Logout() {
	const router = useRouter();

	useEffect(() => {
		(async () => {
			try {
				// Call the logout API to clear server-side session
				await fetch("/api/logout", {
					method: "DELETE",
				});

				// Revalidate cached paths
				await fetch("/api/revalidate", {
					method: "POST",
				});
			} catch (error) {
				console.error("Logout error:", error);
			} finally {
				// Clear all browser cookies
				deleteCookie("key");
				
				// Wait a moment before redirecting to ensure cookies are cleared
				setTimeout(() => {
					router.push("/");
				}, 500);
			}
		})();
	}, [router]);

	return (
		<main className="flex h-screen w-screen animate-fadeIn flex-col items-center justify-center p-12 text-light-accent dark:text-dark-accent">
			<RiLoader3Fill
				title="loading"
				className="animate-spin text-5xl font-medium text-light-accent dark:text-dark-accent"
			/>
			<h1 className="mt-4 text-xl font-medium">Logging out...</h1>
		</main>
	);
}
