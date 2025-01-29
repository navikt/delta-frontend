import { Metadata } from 'next';
import GroupDetails from '@/components/faggrupper/GroupDetails';
import { checkToken } from "@/auth/token";

interface Props {
    params: {
        id: string
    }
}

export const metadata: Metadata = {
    title: 'Faggruppe Δ Delta',
};

export default async function ArticlePage({ params }: Props) {
    await checkToken(`/faggrupper2/${params.id}`);
    return <GroupDetails id={params.id} />;
}