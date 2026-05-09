import { AccountRole, address } from "@solana/kit";
import type { Instruction } from "@solana/kit";

const SYSTEM_PROGRAM = address("11111111111111111111111111111111");

export function getTransferSolInstruction(
  from: string,
  to: string,
  lamports: bigint
): Instruction {
  // System program transfer: u32(2) LE = instruction index, u64 LE = lamports
  const data = new Uint8Array(12);
  new DataView(data.buffer).setUint32(0, 2, true);
  new DataView(data.buffer).setBigUint64(4, lamports, true);
  return {
    programAddress: SYSTEM_PROGRAM,
    accounts: [
      { address: address(from), role: AccountRole.WRITABLE_SIGNER },
      { address: address(to), role: AccountRole.WRITABLE },
    ],
    data,
  };
}
