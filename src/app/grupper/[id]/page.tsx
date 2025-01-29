import { Metadata } from 'next';
import GroupDetails from '@/components/grupper/GroupDetails';
import { checkToken } from "@/auth/token";

interface Props {
    params: {
        id: string
    }
}

export const metadata: Metadata = {
    title: 'Gruppe Δ Delta',
};

export default async function ArticlePage({ params }: Props) {
    await checkToken(`/grupper/${params.id}`);
    return <GroupDetails id={params.id} />;
}