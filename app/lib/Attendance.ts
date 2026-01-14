import { Address } from "viem";

export const attendanceContract =
  "0x29Bab318Dd0f1c93B7577D3357D98f5eCBef3Dd8" as Address;
export const AttendanceAbi = [
  {
    inputs: [{ internalType: "address", name: "owner_", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "uint256", name: "sessionId", type: "uint256" },
      { internalType: "address", name: "sender", type: "address" },
    ],
    name: "HasAttendedSession",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint48", name: "start", type: "uint48" },
      { internalType: "uint48", name: "end", type: "uint48" },
    ],
    name: "InvalidStartEnd",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "NotOwner",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "sessionId", type: "uint256" },
      { internalType: "uint256", name: "totalSessions", type: "uint256" },
    ],
    name: "SessionDoesNotExist",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "sessionId", type: "uint256" }],
    name: "SessionNotActive",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "sessionId", type: "uint256" },
      { internalType: "uint256", name: "maxAttendees", type: "uint256" },
    ],
    name: "SessionFull",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "sessionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "attendee",
        type: "address",
      },
    ],
    name: "SessionAttended",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "sessionId",
        type: "uint256",
      },
      { indexed: false, internalType: "uint48", name: "start", type: "uint48" },
      { indexed: false, internalType: "uint48", name: "end", type: "uint48" },
    ],
    name: "SessionCreated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "sessionId", type: "uint256" }],
    name: "attendSession",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint48", name: "start", type: "uint48" },
      { internalType: "uint48", name: "end", type: "uint48" },
      { internalType: "uint256", name: "maxAttendees", type: "uint256" },
    ],
    name: "createSession",
    outputs: [{ internalType: "uint256", name: "sessionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "sessionId", type: "uint256" },
      { internalType: "address", name: "attendee", type: "address" },
    ],
    name: "hasAttended",
    outputs: [{ internalType: "bool", name: "attended", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "sessionId", type: "uint256" }],
    name: "isActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "sessions",
    outputs: [
      { internalType: "uint48", name: "start", type: "uint48" },
      { internalType: "uint48", name: "end", type: "uint48" },
      { internalType: "uint256", name: "totalAttended", type: "uint256" },
      { internalType: "uint256", name: "maxAttendees", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "attendee", type: "address" }],
    name: "totalAttendence",
    outputs: [{ internalType: "uint256", name: "total", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSessions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
