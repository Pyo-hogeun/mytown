import SettlementDetailPageClient from './SettlementDetailPageClient';

type SettlementSummary = {
  _id?: string;
  id?: string;
};

export async function generateStaticParams() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return [];
  }

  try {
    const response = await fetch(`${apiBaseUrl}/settlement/manage`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { settlements?: SettlementSummary[] };
    const settlements = data.settlements ?? [];

    return settlements
      .map((settlement) => ({ id: String(settlement._id ?? settlement.id) }))
      .filter((settlement) => settlement.id && settlement.id !== 'undefined');
  } catch {
    return [];
  }
}

const SettlementDetailPage = () => {
  return <SettlementDetailPageClient />;
};

export default SettlementDetailPage;
