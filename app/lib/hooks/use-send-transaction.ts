"use client";

import { useState, useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
  getBase64EncodedWireTransaction,
  type Instruction,
} from "@solana/kit";
import { useWallet } from "../wallet/context";
import { useSolanaClient } from "../solana-client-context";

export function useSendTransaction() {
  const { signer } = useWallet();
  const client = useSolanaClient();
  const { mutate } = useSWRConfig();
  const [isSending, setIsSending] = useState(false);

  const send = useCallback(
    async ({ instructions }: { instructions: readonly Instruction[] }) => {
      if (!signer) throw new Error("Wallet not connected");

      setIsSending(true);
      try {
        const { value: latestBlockhash } = await client.rpc
          .getLatestBlockhash({ commitment: "confirmed" })
          .send();

        const message = pipe(
          createTransactionMessage({ version: 0 }),
          (m) => setTransactionMessageFeePayerSigner(signer, m),
          (m) =>
            setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
          (m) => appendTransactionMessageInstructions(instructions, m)
        );

        const signedTx = await signTransactionMessageWithSigners(message);
        const signature = getSignatureFromTransaction(signedTx);
        const wireTx = getBase64EncodedWireTransaction(signedTx);

        await client.rpc
          .sendTransaction(wireTx, {
            encoding: "base64",
            preflightCommitment: "confirmed",
          })
          .send();

        mutate((key: unknown) => Array.isArray(key) && key[0] === "balance");
        return signature;
      } finally {
        setIsSending(false);
      }
    },
    [signer, client, mutate]
  );

  return { send, isSending };
}
