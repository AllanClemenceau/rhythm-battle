'use client';

import { PartySocketProvider } from '@/contexts/PartySocketContext';
import { useParams } from 'next/navigation';

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <PartySocketProvider roomId={roomId}>
      {children}
    </PartySocketProvider>
  );
}
