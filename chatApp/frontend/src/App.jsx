import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPackage,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiTruck,
  FiHome,
  FiCheckCircle,
  FiClock,
  FiMenu,
  FiX
} from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";

const BASE_URL = "https://chatapp-3-zto7.onrender.com"; 

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/orders`);
      const ordersData = res.data.data;
      setOrders(ordersData);
      
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
      const completedOrders = ordersData.filter(order => 
        order.status === 'completed' || order.purchaseMethod === 'STORE_PICKUP'
      ).length;
      
      setStats({
        totalOrders: ordersData.length,
        totalRevenue: totalRevenue,
        avgOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
        pendingOrders: ordersData.length - completedOrders,
        completedOrders: completedOrders
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (method) => {
    switch (method) {
      case 'HOME_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'STORE_PICKUP':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (method) => {
    switch (method) {
      case 'HOME_DELIVERY':
        return <FiTruck className="inline mr-1" />;
      case 'STORE_PICKUP':
        return <FiHome className="inline mr-1" />;
      default:
        return <FiShoppingBag className="inline mr-1" />;
    }
  };

  const StatsCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color}`}>
          {React.cloneElement(icon, { className: "text-lg sm:text-2xl" })}
        </div>
      </div>
    </div>
  );

  const OrderCard = ({ order }) => (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden border border-gray-100"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <span className="text-gray-500 text-xs">Order #{order.orderId?.substring(0, 6) || order._id.substring(0, 6)}</span>
            <h3 className="text-sm font-bold text-gray-900 mt-1 truncate">
              {order.customerDetails?.name || 'Customer'}
            </h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.purchaseMethod)} whitespace-nowrap ml-2`}>
            {getStatusIcon(order.purchaseMethod)}
            {order.purchaseMethod === 'HOME_DELIVERY' ? 'Delivery' : 'Pickup'}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
          <div className="flex items-center">
            <FiCalendar className="mr-1 text-xs" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center font-bold">
            <FiDollarSign className="mr-1" />
            <span>${order.pricing?.total || 0}</span>
          </div>
        </div>

        {/* Product Images for Mobile */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Products:</p>
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {order.selectedShoes?.slice(0, 4).map((product, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img
                  src={product.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop"}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop";
                  }}
                />
                {order.selectedShoes.length > 4 && idx === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                    <span className="text-white text-xs">+{order.selectedShoes.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
            {(!order.selectedShoes || order.selectedShoes.length === 0) && (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <FiPackage className="text-gray-400 text-sm" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-600">
            <BsWhatsapp className="text-green-500 mr-1" />
            <span className="truncate">{order.phone}</span>
          </div>
          <button 
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/${order.phone}`, '_blank');
            }}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 p-2"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-full">
                  <FiShoppingBag className="text-blue-600 text-lg" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold">Sarwan Shoes</h1>
                  <p className="text-blue-200 text-xs">Dashboard</p>
                </div>
              </div>
            </div>
            <button 
              onClick={fetchOrders}
              className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium flex items-center"
            >
              <FiCheckCircle className="mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Dashboard</h2>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-xl font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Stats Overview - Hidden on mobile, shown in sidebar */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FiShoppingBag className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={<FiDollarSign className="text-green-600" />}
            color="bg-green-50"
          />
          <StatsCard
            title="Avg Order"
            value={`$${stats.avgOrderValue.toFixed(2)}`}
            icon={<FiTrendingUp className="text-purple-600" />}
            color="bg-purple-50"
          />
          <StatsCard
            title="Active"
            value={stats.pendingOrders}
            icon={<FiClock className="text-yellow-600" />}
            color="bg-yellow-50"
          />
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-xs rounded ${viewMode === "grid" ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-xs rounded ${viewMode === "list" ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          /* List View for Mobile */
          <div className="space-y-3">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-lg shadow p-4 border border-gray-100"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {order.customerDetails?.name || 'Customer'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.purchaseMethod)} ml-2`}>
                        {order.purchaseMethod === 'HOME_DELIVERY' ? 'Delivery' : 'Pickup'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <FiCalendar className="mr-1" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BsWhatsapp className="text-green-500 mr-1" />
                        <span className="text-xs">{order.phone}</span>
                      </div>
                      <div className="flex items-center font-bold">
                        <FiDollarSign className="mr-1" />
                        <span>${order.pricing?.total || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal - Mobile Optimized */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 text-sm">#{selectedOrder.orderId || selectedOrder._id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                      <FiUsers className="mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium text-sm">{selectedOrder.customerDetails?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-sm flex items-center">
                          <BsWhatsapp className="text-green-500 mr-2" />
                          {selectedOrder.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                      <FiPackage className="mr-2" />
                      Order Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Order Date</span>
                        <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Method</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.purchaseMethod)}`}>
                          {selectedOrder.purchaseMethod === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${selectedOrder.pricing?.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">${selectedOrder.pricing?.deliveryFee || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-blue-600">${selectedOrder.pricing?.total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                      <FiShoppingBag className="mr-2" />
                      Products ({selectedOrder.selectedShoes?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.selectedShoes?.map((product, idx) => (
                        <div key={idx} className="flex items-center bg-gray-50 rounded-lg p-3">
                          <img
                            src={product.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg mr-3"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop";
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-600">Code: {product.code}</p>
                            <div className="flex items-center mt-1">
                              <span className="font-bold text-gray-900 text-sm">${product.price}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-xs text-gray-600">Size: {product.size}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex space-x-3">
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedOrder.phone}`, '_blank')}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center text-sm"
                  >
                    <BsWhatsapp className="mr-2" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-gray-600 text-xs">
          <p>Sarwan Shoes Admin Dashboard</p>
          <p className="mt-1">Orders: {stats.totalOrders} • Revenue: ${stats.totalRevenue.toFixed(2)}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;