"use client";
import React, { useCallback, useState } from "react";
import UidInput from "./form/UidInput";
import PasswordInput from "./form/PasswordInput";
import rotateUrl from "@/utils/URL";
import Button from "@/components/Button";
import { token } from "@/utils/Tokenize";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
import { setCookie } from "@/utils/Cookies";
import { BiChevronLeft } from "react-icons/bi";

export default function Form() {
	const router = useTransitionRouter();
	const [uid, setUid] = useState("");
	const [pass, setPass] = useState("");
	const [captchaInput, setCaptchaInput] = useState("");
	const [captchaImage, setCaptchaImage] = useState<string | null>(null);
	const [cdigest, setCdigest] = useState<string | null>(null);

	const [status, setStatus] = useState<number>(0);
	const [statusMessage, setMessage] = useState("");

	const handleBack = useCallback(() => {
		setCaptchaImage(null);
		setCdigest(null);
		setCaptchaInput("");
		setStatus(0);
		setMessage("");
	}, []);

	const handleLogin = useCallback(async (account: string, password: string, captcha?: string, cdigestValue?: string) => {
		setStatus(1);
		const body: {
			account: string;
			password: string;
			captcha?: string;
			cdigest?: string;
		} = {
			account: account.replaceAll(" ", "").replace("@srmist.edu.in", ""),
			password: password,
		};

		if (captcha && cdigestValue) {
			body.captcha = captcha;
			body.cdigest = cdigestValue;
		}

		const login = await fetch(`${rotateUrl()}/login`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token()}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!login.ok) {
			setStatus(-1);
			setMessage("Server down.");
			return;
		}

		const loginResponse = await login.json();

		if (loginResponse.authenticated) {
			setStatus(2);
			setMessage("Loading data...");
			if(!loginResponse.cookies) {
				setStatus(-1);
				setMessage("No cookies received. Wrong password.");
				return;
			}
			setCookie("key", loginResponse.cookies);
			
			setCaptchaImage(null);
			setCdigest(null);
			setCaptchaInput("");
			
			router.push("/academia");
		} else if (loginResponse?.captcha) {
			setStatus(0);
			setCaptchaImage(loginResponse.captcha.image);
			setCdigest(loginResponse.captcha.cdigest);
			setMessage(loginResponse.message || "Please enter the CAPTCHA.");
		} else if (loginResponse?.message) {
			setStatus(-1);
			if (loginResponse.message?.includes("Digest"))
				setMessage(
					"Seems like this is your first time. Go to academia.srmist.edu.in and setup password!",
				);
			else setMessage(loginResponse?.message);
		}
	}, [router]);

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			{status === -1 && (
				<p className="rounded-2xl bg-light-error-background px-4 py-2 text-light-error-color dark:bg-dark-error-background dark:text-dark-error-color">
					{statusMessage?.includes(">_") ? "" : ""}
					{statusMessage?.replace(">_", "")}
				</p>
			)}

			{status === 2 && statusMessage && (
				<p className="rounded-2xl bg-light-success-background px-4 py-2 text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color">
					{statusMessage}
				</p>
			)}

			{status === 0 && captchaImage && statusMessage && (
				<p className="rounded-2xl bg-light-warn-background px-4 py-2 text-light-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color">
					{statusMessage}
				</p>
			)}

			<div className={`relative flex flex-col gap-1 ${captchaImage ? "hidden" : ""}`}>
				<UidInput uid={uid} setUid={setUid} />
				<PasswordInput password={pass} setPassword={setPass} />
			</div>

			{captchaImage && cdigest && (
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-center">
						<img 
							src={captchaImage} 
							alt="CAPTCHA" 
							className="rounded-xl"
						/>
					</div>
					<input
						type="text"
						value={captchaInput}
						onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
						maxLength={10}
						className="rounded-2xl dark:bg-dark-input bg-light-input dark:text-dark-color text-light-color px-6 py-3 font-medium text-left"
						placeholder="Enter CAPTCHA"
						autoComplete="off"
					/>
				</div>
			)}

			<div className="flex flex-row gap-2">
				{captchaImage && (
					<button
						type="button"
						onClick={handleBack}
						className="flex items-center justify-center rounded-2xl border-2 border-light-accent cursor-pointer dark:border-dark-accent px-4 py-2 text-light-color dark:text-dark-color hover:opacity-80 transition-opacity"
						aria-label="Go back to login"
					>
						<BiChevronLeft className="text-xl" />
					</button>
				)}
				<Button
					disabled={!uid || !pass || status === 1 || status === 2 || (captchaImage !== null && !captchaInput)}
					className={`w-full md:w-fit ${
						status === 2
							? "border border-light-success-color bg-light-success-background text-light-success-color dark:border-dark-success-color dark:bg-dark-success-background dark:text-dark-success-color"
							: status === 1
								? "border border-light-warn-color bg-light-warn-background text-light-warn-color dark:border-dark-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color"
								: status === -1
									? "border border-light-error-color bg-light-error-background text-light-error-color dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color"
									: ""
					}`}
					type="submit"
					onClick={() => {
						if (captchaImage && cdigest && captchaInput) {
							handleLogin(uid, pass, captchaInput, cdigest);
						} else {
							handleLogin(uid, pass);
						}
					}}
				>
					{status === 1 ? "Authenticating" : status === 2 ? "Success" : "Login"}
				</Button>
				{!captchaImage && (
					<Link
						href="https://academia.srmist.edu.in/reset"
						className="border-2 opacity-50 text-light-color dark:text-dark-color border-light-color dark:border-dark-color px-4 py-2 rounded-full text-sm font-medium"
					>
						Forgot
					</Link>
				)}
			</div>
		</form>
	);
}
