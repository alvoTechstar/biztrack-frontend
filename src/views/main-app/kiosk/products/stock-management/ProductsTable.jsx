import React from 'react';
import { Package, PlusCircle } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import DataTable from '../../../../../components/datatable';
import AppFormButton from '../../../../../components/buttons/AppFormButton';

const PRODUCTS_TABLE_HEADERS = [
  { title: '', key: 'all' },
  { title: 'Product Name', key: 'name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Category', key: 'category' },
  { title: 'Stock Level', key: 'stock' },
  { title: 'Buy Price (KES)', key: 'buyingPrice' },
  { title: 'Sell Price (KES)', key: 'price' },
  { title: 'Potential Profit (KES)', key: 'potentialProfit' },
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'action' },
];

const ProductsTable = ({
  products = [],
  sortField,
  sortDirection,
  handleSort,
  onEditProduct,
  onRestockProduct,
  onDeleteProduct,
  onAddProduct,
}) => {
  const theme = useTheme();
  const safeProducts = Array.isArray(products) ? products : [];

  if (safeProducts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300 mt-4">
        <div className="max-w-md mx-auto">
          <Package size={64} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Oops! Nothing in the database yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first product to manage your inventory.
          </p>
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Your First Product
              </div>
            }
            color={theme.primaryColor}
            action={onAddProduct}
            validation={true}
          />
        </div>
      </div>
    );
  }

  const getActionsForStatus = () => {
    return ['View', 'Restock', 'Edit', 'Delete'];
  };

  const handleActionSelected = (action, id) => {
    // Find the product from original data - NOT transformed
    const product = safeProducts.find(p => p._id === id || p.id === id);
    
    if (!product) {
      console.error('❌ Product not found with id:', id);
      return;
    }

    console.log(`✅ Action "${action}" selected for product: ${product.name}`);
    console.log('📦 Product data passed:', product);

    switch (action.toLowerCase()) {
      case 'view':
        console.log('👀 View product:', product.name);
        break;
      case 'edit':
        console.log('✏️ Edit product:', product.name);
        onEditProduct?.(product);
        break;
      case 'restock':
        console.log('📦 Restock product:', product.name);
        onRestockProduct?.(product);
        break;
      case 'delete':
        console.log('🗑️ Delete product:', product.name);
        onDeleteProduct?.(product);
        break;
      default:
        console.warn('⚠️ Unknown action:', action);
    }
  };

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
  };

  // Transform only for display - keep raw data intact in safeProducts
  const transformedProducts = safeProducts.map(product => {
    const productId = product._id || product.id;
    const profitPerUnit = (product.price || 0) - (product.buyingPrice || 0);
    const totalPotentialProfit = profitPerUnit * (product.stock || 0);
    
    return {
      ...product,
      id: productId,
      _id: productId,
      buyingPrice: `KES ${parseFloat(product.buyingPrice || 0).toFixed(2)}`,
      price: `KES ${parseFloat(product.price || 0).toFixed(2)}`,
      potentialProfit: `KES ${totalPotentialProfit.toFixed(2)}`,
      stock: `${product.stock || 0} ${product.unit || 'units'}`,
      status: product.status || 'Out of Stock',
    };
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <DataTable
        data={transformedProducts}
        headers={PRODUCTS_TABLE_HEADERS}
        type="products"
        selected={[]}
        selectedAction={() => {}}
        selectAll={() => {}}
        all={false}
        actionSelected={handleActionSelected}
        selectedRow={handleRowClick}
        actions={getActionsForStatus}
        clickable={true}
        color={theme.primaryColor}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
};

export default ProductsTable;