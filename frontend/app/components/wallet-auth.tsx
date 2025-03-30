"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useConnections, useSignMessage, useVerifyMessage, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createHash } from "crypto";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WalletAuth() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const connections = useConnections();
  const router = useRouter();
  const [nonce] = useState(() => Math.floor(Math.random() * 1000000).toString());
  const [hasSigned, setHasSigned] = useState(false);
  const [verificationState, setVerificationState] = useState<{
    pending: boolean;
    success: boolean;
    error: unknown;
  }>({
    pending: false,
    success: false,
    error: null,
  });

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
      }
    }
  }, [address]);

  useEffect(() => {
    if (
      connections.length > 0 &&
      !hasSigned &&
      !verificationState.success &&
      !signPending &&
      !signature &&
      !localStorage.getItem("walletAuth")
    ) {
      toast("Signing message...");
      signMessage({ message });
      setHasSigned(true);
    }
  }, [connections, hasSigned, signPending, signature, signMessage, message, verificationState]);

  useEffect(() => {
    if (signError) {
      toast.error(
        signError.message.includes("User rejected")
          ? "User rejected signing."
          : "Signing error occurred."
      );
      if (signError.message.includes("User rejected")) {
        disconnect();
        setHasSigned(false);
        setVerificationState({ pending: false, success: false, error: null });
      }
    }
  }, [signError, disconnect]);

  useEffect(() => {
    if (verifyPending && connections.length && !localStorage.getItem("walletAuth")) {
      setVerificationState((prev) => ({ ...prev, pending: true }));
      toast("Verifying message...");
    } else if (verifySuccess) {
      setVerificationState({ pending: false, success: true, error: null });
      localStorage.setItem("walletAuth", JSON.stringify({ address, verified: true }));
      toast.success("Verified successfully.");
      router.push("/game");
    } else if (verifyError) {
      setVerificationState({ pending: false, success: false, error: verifyError });
      toast.error("Verification failed.");
    }
  }, [verifyPending, verifySuccess, verifyError, address]);

  useEffect(() => {
    if (!connections.length) {
      setHasSigned(false);
      setVerificationState({ pending: false, success: false, error: null });
      localStorage.removeItem("walletAuth");
    }
  }, [connections]);

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
