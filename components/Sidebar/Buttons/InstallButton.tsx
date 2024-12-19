import React, { forwardRef } from 'react';
import { GrInstallOption } from "react-icons/gr";
import { usePwa } from "@dotmind/react-use-pwa";
import { useCallback } from "react";

export default forwardRef<HTMLButtonElement, {anchor: boolean}>(function InstallButton({
  anchor,
}, ref) {
  const { installPrompt, isInstalled, isStandalone, isOffline, canInstall } =
    usePwa();

  const handleInstallPrompt = useCallback(() => {
    if (canInstall) {
      installPrompt();
    }
  }, [canInstall, installPrompt]);

  if (isOffline) return;

  return (
    (!isInstalled || !isStandalone ) && canInstall && (
      <>
      <button
        ref={ref}
        type="button"
        name="Open navbar"
        className={`fixed bottom-[5.14rem] flex items-center justify-start gap-3 rounded-full p-3 transition-all duration-100 lg:bottom-36 ${anchor ? "right-[2.1rem] lg:left-8" : "lg:right-7"} bg-light-background-light dark:bg-dark-background-light`}
        onClick={handleInstallPrompt}
      >
        <GrInstallOption
          className={`text-xl text-light-color transition-all duration-75 dark:text-dark-color`}
        />
        {anchor && <p className="m-0 hidden font-semibold lg:block text-light-color dark:text-dark-color">Install</p>}
      </button>
      </>
    )
  );
}
)