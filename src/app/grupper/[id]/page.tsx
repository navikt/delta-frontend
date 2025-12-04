import { Metadata } from 'next';
import GroupDetails from '@/components/grupper/GroupDetails';
import { checkToken } from "@/auth/token";

interface Props {
    params: Promise<{
        id: string
    }>
}

export const metadata: Metadata = {
    title: 'Gruppe Δ Delta',
};

export default async function ArticlePage({ params }: Props) {
    const { id } = await params;
    await checkToken(`/grupper/${id}`);
    return <GroupDetails id={id} />;
}