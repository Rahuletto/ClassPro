import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { Themes } from "@/misc/theme";
import { ViewTransitions } from "next-view-transitions";
import ErrorBoundary from "./Boundary";
import type { ReactNode } from "react";
import Script from "next/script";

const APP_NAME = "ClassPro";
const APP_DEFAULT_TITLE = "ClassPro";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Better way to manage your academics.";
const PRODUCTION_URL = "https://class-pro.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NODE_ENV === "production"
			? PRODUCTION_URL
			: "http://localhost:0243",
	),
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: APP_DEFAULT_TITLE,
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
		images: [
			{
				url: "/images/og.png",
				width: 1280,
				height: 720,
				alt: APP_NAME,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
		images: ["/images/og.png"],
	},
	icons: {
		icon: [
			{
				url: "/icons/icon.svg",
				sizes: "192x192",
				type: "image/svg+xml",
			},
		],
		apple: [
			{
				url: "/icons/icon.svg",
				sizes: "192x192",
				type: "image/svg+xml",
			},
		],
	},
};

export const viewport: Viewport = {
	themeColor: "#11151b",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`dark h-screen bg-light-background-normal dark:bg-dark-background-normal ${GeistSans.variable} ${GeistMono.variable}`}
		>
			<ErrorBoundary>
				<ThemeProvider>
					<meta name="apple-mobile-web-app-title" content="ClassPro" />
					<meta
						name="theme-color"
						media="(prefers-color-scheme: dark)"
						content={
							Themes.find((t) => t.title === "Dark")?.properties.metacolor
						}
					/>
					<meta
						name="theme-color"
						media="(prefers-color-scheme: light)"
						content={
							Themes.find((t) => t.title === "Light")?.properties.metacolor
						}
					/>

					<meta
						name="theme-color"
						content={
							Themes.find((t) => t.title === "Dark")?.properties.metacolor
						}
					/>

					<body className="h-screen">
						<ViewTransitions>
							<Script
								defer
								src="https://static.cloudflareinsights.com/beacon.min.js"
								data-cf-beacon='{"token": "be7e879176fc4899a6d71d2cf9383fd5"}'
								strategy="afterInteractive"
							/>

							{children}
						</ViewTransitions>
					</body>
				</ThemeProvider>
			</ErrorBoundary>
		</html>
	);
}
