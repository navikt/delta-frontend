import { Metadata } from 'next';
import GroupDetails from '@/components/grupper/GroupDetails';

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
    return <GroupDetails id={id} />;
}