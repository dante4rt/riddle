"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createHash } from "crypto";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount, useConnections, useDisconnect, useSignMessage, useVerifyMessage } from "wagmi";

export function WalletAuth() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const connections = useConnections();
  const router = useRouter();
  const pathname = usePathname();
  const [nonce] = useState(() => Math.floor(Math.random() * 1000000).toString());
  const [verificationState, setVerificationState] = useState<{
    pending: boolean;
    success: boolean;
    error: unknown;
  }>({
    pending: false,
    success: false,
    error: null,
  });
  const hasSignedRef = useRef(false);

  const hashedNonce = useMemo(() => createHash("sha256").update(nonce).digest("base64"), [nonce]);

  const message = useMemo(() => {
    if (!address) return "";

    return `I confirm that my address is ${address} with nonce ${hashedNonce}`;
  }, [address, hashedNonce]);

  const {
    signMessage,
    data: signature,
    isPending: signPending,
    error: signError,
  } = useSignMessage();
  const {
    isSuccess: verifySuccess,
    isPending: verifyPending,
    error: verifyError,
  } = useVerifyMessage({
    address,
    message,
    signature,
  });

  useEffect(() => {
    const savedVerification = localStorage.getItem("walletAuth");

    if (savedVerification) {
      const parsed = JSON.parse(savedVerification);

      if (parsed.address === address && parsed.verified) {
        setVerificationState({ pending: false, success: true, error: null });
        hasSignedRef.current = true;
      } else {
        setVerificationState({ pending: false, success: false, error: null });
        hasSignedRef.current = false;
        localStorage.removeItem("walletAuth");
      }
    } else {
      setVerificationState({ pending: false, success: false, error: null });
      hasSignedRef.current = false;
    }
  }, [address]);

  const triggerSigning = useCallback(() => {
    if (
      connections.length > 0 &&
      !hasSignedRef.current &&
      !verificationState.success &&
      !signPending &&
      !signature
    ) {
      console.log("Triggering sign for address:", address);

      toast("Please sign the message to verify your wallet...");
      signMessage({ message });

      hasSignedRef.current = true;
    }
  }, [connections, signPending, signature, signMessage, message, verificationState, address]);

  useEffect(() => {
    triggerSigning();
  }, [triggerSigning]);

  useEffect(() => {
    if (signError) {
      toast.error(
        signError.message.includes("User rejected")
          ? "User rejected signing."
          : "Signing error occurred."
      );
      if (signError.message.includes("User rejected")) {
        disconnect();

        hasSignedRef.current = false;
        setVerificationState({ pending: false, success: false, error: null });

        localStorage.removeItem("walletAuth");
      }
    }
  }, [signError, disconnect]);

  useEffect(() => {
    if (verifyPending) {
      setVerificationState((prev) => ({ ...prev, pending: true }));
    } else if (verifySuccess) {
      setVerificationState({ pending: false, success: true, error: null });

      localStorage.setItem("walletAuth", JSON.stringify({ address, verified: true }));
      toast.success("Verified successfully.");

      if (pathname !== "/game") {
        router.push("/game");
      }
    } else if (verifyError) {
      setVerificationState({ pending: false, success: false, error: verifyError });

      toast.error("Verification failed.");
    }
  }, [verifyPending, verifySuccess, verifyError, address, router, pathname]);

  useEffect(() => {
    if (!connections.length) {
      hasSignedRef.current = false;

      setVerificationState({ pending: false, success: false, error: null });
      localStorage.removeItem("walletAuth");

      if (pathname !== "/") {
        router.push("/");
      }
    }
  }, [connections, router, pathname]);

  return (
    <div className="px-4">
      <div className="mt-4 justify-center flex gap-2">
        <ConnectButton accountStatus={"avatar"} />
      </div>

      {connections.length > 0 && (
        <>
          {signError && (
            <p className="mt-2 text-red-500">
              {signError.message.includes("rejected")
                ? "Signature rejected, wallet disconnected"
                : `Sign Error: ${signError.message}`}
            </p>
          )}
        </>
      )}
    </div>
  );
}
