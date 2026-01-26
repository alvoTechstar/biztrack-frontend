import React from 'react';
import { useState } from 'react';
import { Search, Plus, Edit, Trash, Filter, ChevronDown, Package, Utensils, X, Save, ShoppingCart, DollarSign } from 'lucide-react';

export default function IngredientsManagementPage() {
  const [activeView, setActiveView] = useState('ingredients'); // 'ingredients' or 'products'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Sample ingredient data
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Flour', category: 'Baking', quantity: 25, unit: 'kg', costPerUnit: 1.20, totalCost: 30.00 },
    { id: 2, name: 'Sugar', category: 'Baking', quantity: 15, unit: 'kg', costPerUnit: 0.85, totalCost: 12.75 },
    { id: 3, name: 'Eggs', category: 'Dairy', quantity: 120, unit: 'pieces', costPerUnit: 0.25, totalCost: 30.00 },
    { id: 4, name: 'Milk', category: 'Dairy', quantity: 18, unit: 'liters', costPerUnit: 1.50, totalCost: 27.00 },
    { id: 5, name: 'Butter', category: 'Dairy', quantity: 10, unit: 'kg', costPerUnit: 8.75, totalCost: 87.50 },
    { id: 6, name: 'Chocolate Chips', category: 'Baking', quantity: 8, unit: 'kg', costPerUnit: 12.00, totalCost: 96.00 },
    { id: 7, name: 'Vanilla Extract', category: 'Flavoring', quantity: 2, unit: 'liters', costPerUnit: 25.00, totalCost: 50.00 },
    { id: 8, name: 'Salt', category: 'Spices', quantity: 5, unit: 'kg', costPerUnit: 0.60, totalCost: 3.00 },
    { id: 9, name: 'Baking Powder', category: 'Baking', quantity: 3, unit: 'kg', costPerUnit: 4.50, totalCost: 13.50 },
    { id: 10, name: 'Cinnamon', category: 'Spices', quantity: 1, unit: 'kg', costPerUnit: 18.00, totalCost: 18.00 },
  ]);

  // Sample product data
  const [products] = useState([
    { id: 1, name: 'Chocolate Chip Cookies', category: 'Cookies', ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate Chips', 'Eggs', 'Vanilla Extract', 'Salt'], costPerUnit: 2.15, price: 3.50 },
    { id: 2, name: 'Vanilla Cake', category: 'Cakes', ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Milk', 'Vanilla Extract', 'Baking Powder'], costPerUnit: 12.40, price: 24.99 },
    { id: 3, name: 'Cinnamon Rolls', category: 'Pastries', ingredients: ['Flour', 'Sugar', 'Butter', 'Milk', 'Cinnamon'], costPerUnit: 1.75, price: 3.25 },
    { id: 4, name: 'Buttermilk Pancakes', category: 'Breakfast', ingredients: ['Flour', 'Sugar', 'Eggs', 'Milk', 'Baking Powder'], costPerUnit: 0.90, price: 2.50 },
  ]);

  const categories = [...new Set(ingredients.map(item => item.category))];
  const productCategories = [...new Set(products.map(item => item.category))];

  const handleAddNew = () => {
    setCurrentIngredient({
      id: Date.now(),
      name: '',
      category: categories[0] || 'Other',
      quantity: 0,
      unit: 'kg',
      costPerUnit: 0,
      totalCost: 0
    });
    setShowAddModal(true);
  };

  const handleEdit = (ingredient) => {
    setCurrentIngredient({...ingredient});
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const handleSaveAdd = () => {
    // Calculate total cost
    const newIngredient = {
      ...currentIngredient,
      totalCost: currentIngredient.quantity * currentIngredient.costPerUnit
    };
    
    setIngredients([...ingredients, newIngredient]);
    setShowAddModal(false);
  };

  const handleSaveEdit = () => {
    // Calculate total cost
    const updatedIngredient = {
      ...currentIngredient,
      totalCost: currentIngredient.quantity * currentIngredient.costPerUnit
    };
    
    setIngredients(ingredients.map(ing => 
      ing.id === updatedIngredient.id ? updatedIngredient : ing
    ));
    setShowEditModal(false);
  };

  const handleQuantityChange = (value) => {
    const qty = parseFloat(value) || 0;
    setCurrentIngredient({
      ...currentIngredient,
      quantity: qty,
      totalCost: qty * currentIngredient.costPerUnit
    });
  };

  const handleCostChange = (value) => {
    const cost = parseFloat(value) || 0;
    setCurrentIngredient({
      ...currentIngredient,
      costPerUnit: cost,
      totalCost: currentIngredient.quantity * cost
    });
  };

  const filteredIngredients = ingredients
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => filterCategory === 'All' ? true : item.category === filterCategory);

  const filteredProducts = products
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => filterCategory === 'All' ? true : item.category === filterCategory);

  const totalIngredientCost = ingredients.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Ingredients Management</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Toggle View */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${activeView === 'ingredients' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveView('ingredients');
                  setFilterCategory('All');
                }}
              >
                <Utensils size={18} />
                <span>Ingredients</span>
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${activeView === 'products' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveView('products');
                  setFilterCategory('All');
                }}
              >
                <Package size={18} />
                <span>Products</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeView}...`}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <Filter size={18} className="text-gray-500 mr-2" />
                <select
                  className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {activeView === 'ingredients' ? (
                    categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  ) : (
                    productCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  )}
                </select>
              </div>
              
              {activeView === 'ingredients' && (
                <button 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  onClick={handleAddNew}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Ingredient</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        {activeView === 'ingredients' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <DollarSign size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Total Ingredient Cost</h3>
                  <p className="text-2xl font-bold">${totalIngredientCost.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <ShoppingCart size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Total Ingredients</h3>
                  <p className="text-2xl font-bold">{ingredients.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients List */}
        {activeView === 'ingredients' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingredient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Per Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{ingredient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ingredient.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ingredient.quantity} {ingredient.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${ingredient.costPerUnit.toFixed(2)} / {ingredient.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        ${ingredient.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEdit(ingredient)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(ingredient.id)}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredIngredients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No ingredients found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products List */}
        {activeView === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Cost per unit:</span>
                    <span className="font-medium">${product.costPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-500">Selling price:</span>
                    <span className="font-bold text-green-600">${product.price.toFixed(2)}</span>
                  </div>
                  
                  <h4 className="font-medium mb-2">Ingredients:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {product.ingredients.map((ing, index) => (
                      <li key={index}>{ing}</li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-3 bg-gray-50 flex justify-end">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    View Recipe Details
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No products found matching your criteria.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Ingredient Modal */}
      {showAddModal && currentIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Ingredient</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2" 
                  value={currentIngredient.name}
                  onChange={(e) => setCurrentIngredient({...currentIngredient, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={currentIngredient.category}
                  onChange={(e) => setCurrentIngredient({...currentIngredient, category: e.target.value})}
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2" 
                    value={currentIngredient.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={currentIngredient.unit}
                    onChange={(e) => setCurrentIngredient({...currentIngredient, unit: e.target.value})}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="liters">Liters</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pieces">Pieces</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border rounded-lg p-2" 
                    value={currentIngredient.costPerUnit}
                    onChange={(e) => handleCostChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2 bg-gray-100" 
                    value={(currentIngredient.quantity * currentIngredient.costPerUnit).toFixed(2)}
                    disabled
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                onClick={handleSaveAdd}
                disabled={!currentIngredient.name}
              >
                <Save size={18} />
                Save Ingredient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ingredient Modal */}
      {showEditModal && currentIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Ingredient</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2" 
                  value={currentIngredient.name}
                  onChange={(e) => setCurrentIngredient({...currentIngredient, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={currentIngredient.category}
                  onChange={(e) => setCurrentIngredient({...currentIngredient, category: e.target.value})}
                  list="edit-categories"
                />
                <datalist id="edit-categories">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2" 
                    value={currentIngredient.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={currentIngredient.unit}
                    onChange={(e) => setCurrentIngredient({...currentIngredient, unit: e.target.value})}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="liters">Liters</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pieces">Pieces</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Unit ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border rounded-lg p-2" 
                    value={currentIngredient.costPerUnit}
                    onChange={(e) => handleCostChange(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2 bg-gray-100" 
                    value={(currentIngredient.quantity * currentIngredient.costPerUnit).toFixed(2)}
                    disabled
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                onClick={handleSaveEdit}
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}