'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { Transaction, TransactionButton, TransactionSponsor, TransactionStatus, TransactionStatusAction, TransactionStatusLabel } from "@coinbase/onchainkit/transaction"
import { encodeFunctionData, Hex } from 'viem';
import { AttendanceAbi, attendanceContract } from '@/app/lib/Attendance';
import { useAccount, useChainId, useReadContract, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { parseSession } from '@/app/lib/utils';
import { useEffect } from 'react';

// Format Unix timestamp to user-friendly date string
function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
}

// Get session status based on current time
function getSessionStatus(start: number, end: number): { label: string; color: string } {
    const now = Math.floor(Date.now() / 1000);
    if (now < start) return { label: 'Upcoming', color: 'text-blue-500' };
    if (now >= start && now < end) return { label: 'Active', color: 'text-green-500' };
    return { label: 'Ended', color: 'text-gray-500' };
}

// Calculate attendance percentage
function getAttendanceInfo(totalAttended: number, maxAttendees: number): { percentage: number | null; display: string } {
    if (maxAttendees === 0) {
        return { percentage: null, display: `${totalAttended} attended (unlimited capacity)` };
    }
    const percentage = Math.round((totalAttended / maxAttendees) * 100);
    return { percentage, display: `${totalAttended}/${maxAttendees} (${percentage}% full)` };
}

export default function App({ params }: {params: {sessionId: string}}) {
    // state for connected wallet
    const account = useAccount()

    // state for querying totalSessions
    const {data: totalSessions, isLoading: isLoadingTotal} = useReadContract({
        abi: AttendanceAbi, 
        address: attendanceContract, 
        functionName: "totalSessions"
    })

    // state for querying a session's data
    const {data: sessionRaw, isLoading: isLoadingSession} = useReadContract({
        abi: AttendanceAbi,
        address: attendanceContract,
        functionName: "sessions",
        args: [BigInt(params.sessionId)]
    })

    // state for querying if an account has attended a session
    const {data: hasAttended, isLoading: isLoadingAttended} = useReadContract({
        abi: AttendanceAbi, 
        address: attendanceContract, 
        functionName: "hasAttended", 
        args: [BigInt(params.sessionId), account.address as Hex]
    })

    // state for querying user's total attendance across all sessions
    const {data: userTotalAttendance} = useReadContract({
        abi: AttendanceAbi, 
        address: attendanceContract, 
        functionName: "totalAttendence", // Note: typo in contract
        args: [account.address as Hex],
        query: { enabled: Boolean(account.address) }
    })

    // state for wallet's currently connected chain
    const chainId = useChainId()

    // Enforce that users are connected to base sepolia
    const {switchChain} = useSwitchChain()
    useEffect(() => {
        if (chainId && chainId !== baseSepolia.id) {
            switchChain({ chainId: baseSepolia.id })
        }
    }, [chainId, switchChain])

    const session = parseSession(sessionRaw)
    const isLoading = isLoadingTotal || isLoadingSession;
    
    // Derived session info
    const status = session ? getSessionStatus(session.start, session.end) : null;
    const attendanceInfo = session ? getAttendanceInfo(session.totalAttended, session.maxAttendees) : null;

    return isLoading ? (
        // Loading state
        <div className="flex flex-col items-center justify-center min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
            <div className="animate-pulse flex flex-col items-center space-y-4">
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 w-56 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Loading session data...</div>
        </div>
    ) : parseInt(params.sessionId) >= (totalSessions ?? 0) ? (
        // If session id is greater than total sessions, session does not exist
        <div className='flex flex-col text-center justify-center min-h-screen'>Session does not exist.</div>
    ) : (
        // If session exists, display session data
        <div className="flex flex-col items-center justify-center min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
            <div className='flex flex-col space-y-4 mb-12 text-center'>
                {/* Session title and status */}
                <div className='text-3xl font-bold'>Session #{params.sessionId}</div>
                {status && (
                    <div className={`text-lg font-medium ${status.color}`}>
                        ● {status.label}
                    </div>
                )}
                
                {/* Time information */}
                <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                    <div>
                        <span className='font-medium'>Starts:</span> {session ? formatDate(session.start) : '-'}
                    </div>
                    <div>
                        <span className='font-medium'>Ends:</span> {session ? formatDate(session.end) : '-'}
                    </div>
                </div>

                {/* Attendance info with optional progress bar */}
                <div className='mt-4'>
                    <div className='text-xl font-semibold'>
                        {attendanceInfo?.display}
                    </div>
                    {attendanceInfo && attendanceInfo.percentage !== null && (
                        <div className='mt-2 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
                            <div 
                                className='bg-blue-500 h-3 rounded-full transition-all duration-300'
                                style={{ width: `${Math.min(attendanceInfo.percentage, 100)}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
            {/* If user is not connected, display connect wallet button */}
            {!account.address ? (
                <Wallet>
                    <ConnectWallet>
                    <Avatar className="h-6 w-6" />
                    <Name />
                    </ConnectWallet>
                </Wallet>
            ) : (
                <>
                    <div className='absolute top-4 right-4'>
                        <Wallet>
                            <ConnectWallet>
                                <Avatar className="h-6 w-6" />
                                <Name />
                            </ConnectWallet>
                            <WalletDropdown>
                                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                    <Avatar />
                                    <Name />
                                    <Address />
                                    <EthBalance />
                                </Identity>
                                <WalletDropdownLink
                                    icon="wallet"
                                    href="https://keys.coinbase.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >
                                    Wallet
                                </WalletDropdownLink>
                                <WalletDropdownDisconnect />
                            </WalletDropdown>
                        </Wallet>
                    </div>
                    <div className='w-1/4'>
                    {/* Show loading state while checking attendance */}
                    {isLoadingAttended ? (
                        <div className='text-center text-gray-500'>Checking attendance status...</div>
                    ) : !hasAttended ? (
                        /* If user has not attended session, display attend session button */
                        <Transaction calls={[{
                            to: attendanceContract, 
                            data: encodeFunctionData({
                                abi: AttendanceAbi, 
                                functionName: "attendSession", 
                                args: [BigInt(params.sessionId)]
                            })
                        }]}>
                            <TransactionButton text={"Attend"} />
                            <TransactionSponsor />
                            <TransactionStatus>
                                <TransactionStatusLabel />
                                <TransactionStatusAction />
                            </TransactionStatus>
                        </Transaction>  
                    ) : (
                        // If user has attended session, display message
                        <div className='text-center text-green-500 font-medium'>✓ You have attended this session!</div>
                    )}
                    
                    {/* User's total attendance counter */}
                    {userTotalAttendance !== undefined && (
                        <div className='mt-6 text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                            <div className='text-2xl font-bold text-blue-500'>
                                {userTotalAttendance.toString()}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                                Your total attendance: {userTotalAttendance.toString()} session{Number(userTotalAttendance) !== 1 ? 's' : ''}
                            </div>
                        </div>
                    )}
                    </div>
                </>
            )}
        </div>
    );
}