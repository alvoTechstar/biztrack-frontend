import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts";
import { Package } from "lucide-react";

const TopProductsChart = ({ productSales }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-gray-700 font-medium">
                        Top Selling Products
                    </h3>
                    <Package size={20} className="text-amber-600" />
                </div>
            </div>
            <div className="px-2 py-2 h-36">
                {productSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={productSales}
                            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                opacity={0.3}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <RechartsTooltip />
                            <Bar
                                dataKey="sales"
                                fill="#3b82f6"
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No product sales data
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopProductsChart;