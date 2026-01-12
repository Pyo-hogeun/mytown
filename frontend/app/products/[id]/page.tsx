import ProductDetailPageClient from './ProductDetailPageClient';

type ProductSummary = {
  _id?: string;
  id?: string;
};

export async function generateStaticParams() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return [];
  }

  try {
    const response = await fetch(`${apiBaseUrl}/products`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as ProductSummary[];
    return products
      .map((product) => ({ id: String(product._id ?? product.id) }))
      .filter((product) => product.id && product.id !== 'undefined');
  } catch {
    return [];
  }
}

const ProductDetailPage = () => {
  return <ProductDetailPageClient />;
};

export default ProductDetailPage;
