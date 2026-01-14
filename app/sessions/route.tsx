import { NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, encodeFunctionData, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains';
import { AttendanceAbi, attendanceContract } from '@/app/lib/Attendance';
import { parseSession } from '@/app/lib/utils';

// Create a new session
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { start, end, maxAttendees = 0 } = body;

    if (!start || !end) {
      return NextResponse.json({ error: 'Missing start or end time' }, { status: 400 });
    }
    
    // Instantiate account using private key
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json({ error: 'Server configuration error', message: 'PRIVATE_KEY environment variable is not set' }, { status: 500 });
    }
    const account = privateKeyToAccount(privateKey as Hex)

    // Instantiate client that can use wallet to send transactions
    const walletClient = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http()
      })

    // Send a transaction to create a new session
    // Writes Attendance.createSession(start, end, maxAttendees)
    const transactionHash = await walletClient.sendTransaction({
      to: attendanceContract,
      data: encodeFunctionData({
        abi: AttendanceAbi,
        functionName: "createSession",
        args: [start, end, maxAttendees]
      })
    })

    return NextResponse.json({ transactionHash }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request', message: (error as Error).message }, { status: 400 });
  }
}

// Get all sessions created by the contract
export async function GET(req: Request) {
  const PAGE_SIZE = 50
  try {
    const { searchParams } = new URL(req.url);
    const startId = parseInt(searchParams.get('startId') ?? "0");

    // Instantiate client to interact with the blockchain
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    })

    // Get the total number of sessions created by the contract
    // Reads Attendance.totalSessions()
    const totalSessionsRes = await publicClient.readContract({
      address: attendanceContract,
      abi: AttendanceAbi,
      functionName: 'totalSessions',
      args: []
    })
    const totalSessions = parseInt(totalSessionsRes.toString())

    if (startId > totalSessions - 1) throw Error("startId exceeds max possible id")

    const endId = totalSessions - startId > PAGE_SIZE ? startId + PAGE_SIZE : totalSessions - 1
    const sessionIds = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
    
    // Get the session data for each session id
    // Reads Attendance.sessions(id) through a multicall contract (https://www.multicall3.com/)
    const sessionsRes = await publicClient.multicall({
      contracts: sessionIds.map(sessionId => ({
        abi: AttendanceAbi, 
        address: attendanceContract, 
        functionName: "sessions", 
        args: [sessionId]
      }))
    })
    const sessions = sessionsRes.map(({result}, i) => ({
      sessionId: sessionIds[i],
      ...parseSession(result as unknown as [number, number, bigint, bigint])
    }))

    return NextResponse.json({totalSessions: parseInt(totalSessions.toString()), sessions}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request', message: (error as Error).message }, { status: 400 });
  }
}