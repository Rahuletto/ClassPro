"use client";
import React, { useCallback, useState } from "react";
import UidInput from "./form/UidInput";
import PasswordInput from "./form/PasswordInput";
import { Cookie as cookies } from "@/utils/Cookies";
import rotateUrl, { revalUrl } from "@/utils/URL";
import Button from "@/components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { token } from "@/utils/Tokenize";
import { fetcher, useData } from "@/provider/DataProvider";
import useSWR from "swr";

export default function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWR(`${revalUrl}/getData`);
  const redirParam = searchParams.get("redirect") || "/academia";

  const [uid, setUid] = useState("");
  const [pass, setPass] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [response, setResponse] = useState<any>(null);

  const [error, setError] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const handleCaptcha = useCallback(async () => {
    setError(-1);

    const r = await fetch(`${rotateUrl()}/login/captcha`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${token()}`,
        Connection: "keep-alive",
        "content-type": "application/json",
        Origin: "https://academia-pro.vercel.app",
      },
      body: JSON.stringify({
        account: uid.replaceAll(" ", "").replace("@srmist.edu.in", ""),
        password: pass,
        captcha: captcha,
        identifier: response.identifier,
        digest: response.digest,
        cdigest: response.cdigest,
      }),
    });

    if (!r.ok) {
      setError(1);
      setMessage("Server down.");
    }
    const res = await r.json();
    if (res.authenticated) {
      setError(2);
      cookies.set("key", res.cookies);
      router.push(redirParam);
    } else if (res?.message) {
      setError(1);
      setMessage(res?.message);
    }
  }, [captcha, uid, pass, router, response, redirParam]);

  const handleLogin = useCallback(async () => {
    setError(-1);

    try {
      const response = await fetch(`${rotateUrl()}/login`, {
        method: "POST",
        cache: "no-cache",
        headers: {
          Authorization: `Bearer ${token()}`,
          Connection: "keep-alive",
          "content-type": "application/json",
          Origin: "https://academia-pro.vercel.app",
        },
        body: JSON.stringify({
          account: uid.replaceAll(" ", "").replace("@srmist.edu.in", ""),
          password: pass,
        }),
      });
      if (!response.ok) {
        setError(1);
        setMessage("Server down.");
      }

      const res = await response.json();

      if (res.cookies && res.cookies?.includes("undefined")) {
        setError(1);
        setMessage("Session invalid?");
      }
      if (res.captcha) {
        setResponse(res);
      } else if (res?.message?.includes("HIP")) {
        if (res?.localized_message) {
          setError(1);
          setMessage(res.localized_message);
        } else {
          setError(1);
          setMessage(res?.message);
        }
      } else if (res.authenticated) {
        setError(2);
        setMessage("Loading data...");
        cookies.set("key", res.cookies);
        setTimeout(() => {
          fetcher(`${revalUrl}/update`, res.cookies, true).then((data) => {
            mutate(data, {
              optimisticData: data,
              revalidate: false,
              populateCache: true,
            }).then(() => router.push("/academia")).catch(() => {
              console.warn("Failed to update data.");
              router.push("/academia");
            })
          });
        }, 100);
      } else if (res?.message) {
        setError(1);
        setMessage(res?.message);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setTimeout(() => setError(0), 6000);
    }
  }, [uid, pass, router]);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        response?.captcha ? handleCaptcha() : handleLogin();
      }}
    >
      {error === 1 && (
        <p className="rounded-2xl bg-light-error-background px-4 py-2 text-light-error-color dark:bg-dark-error-background dark:text-dark-error-color">
          SRM: {message}
        </p>
      )}

      {error === 2 && message && (
        <p className="rounded-2xl bg-light-success-background px-4 py-2 text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color">
          {message}
        </p>
      )}

      {!response?.captcha && (
        <div className="relative flex flex-col gap-1">
          <UidInput uid={uid} setUid={setUid} />
          <PasswordInput password={pass} setPassword={setPass} />
        </div>
      )}
      {response?.captcha && (
        <>
          <div className="flex flex-col gap-2">
            <img src={response?.captcha} alt="captcha" className="rounded-xl" />
            <input
              type="text"
              className="rounded-2xl border border-light-background-darker bg-light-input px-6 py-3 font-sans font-medium text-light-color dark:border-dark-background-darker dark:bg-dark-input dark:text-dark-color"
              placeholder="Enter captcha"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
            />
          </div>
          <button
            type="submit"
            onClick={handleCaptcha}
            className={`w-fit transform rounded-xl bg-light-accent px-4 py-2 font-medium text-light-background-dark transition-all duration-200 hover:scale-95 hover:opacity-80 hover:shadow-lg active:scale-90 dark:bg-dark-accent dark:text-dark-background-dark`}
          >
            Validate
          </button>
        </>
      )}
      {!response?.captcha && (
        <Button
          disabled={!uid || !pass || error === -1 || error === 2}
          className={`w-full md:w-fit ${
            error === 2
              ? "border border-light-success-color bg-light-success-background text-light-success-color dark:border-dark-success-color dark:bg-dark-success-background dark:text-dark-success-color"
              : error === -1
                ? "border border-light-warn-color bg-light-warn-background text-light-warn-color dark:border-dark-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color"
                : error === 1
                  ? "border border-light-error-color bg-light-error-background text-light-error-color dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color"
                  : ""
          }`}
          type="submit"
          onClick={handleLogin}
        >
          {error === -1 ? "Authenticating" : error === 2 ? "Success" : "Login"}
        </Button>
      )}
    </form>
  );
}
