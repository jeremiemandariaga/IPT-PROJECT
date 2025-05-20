import React, { useEffect, useState } from "react";
import { supabase } from "../../createClient";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [movementHistory, setMovementHistory] = useState([]);

  useEffect(() => {
    loadData();
    fetchStockMovement();
  }, []);

  async function loadData() {
    const { data: stockData } = await supabase.rpc("get_stocks_with_names");
    const { data: productData } = await supabase.from("products").select("*");
    const { data: warehouseData } = await supabase.from("warehouses").select("*");

    setStocks(stockData || []);
    setProducts(productData || []);
    setWarehouses(warehouseData || []);
  }

  async function fetchStockMovement() {
    const { data, error } = await supabase
      .from("stock_entries")
      .select(
        `id, 
         product_id, 
         warehouse_id, 
         quantity, 
         date_received, 
         products ( name ), 
         warehouses ( name )`
      )
      .order("date_received", { ascending: false });

    if (!error) {
      setMovementHistory(data);
    } else {
      console.error("Error fetching stock movements:", error);
    }
  }

  const filteredStocks = selectedWarehouse
    ? stocks.filter((s) => s.warehouse_id.toString() === selectedWarehouse)
    : stocks;

  const lowStock = filteredStocks.filter((s) => s.quantity <= 50);
  const normalStock = filteredStocks.filter((s) => s.quantity > 50);

  return (
    <div
      style={{
        maxHeight: "75vh",
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #ddd",
        minWidth: "200px",
      }}
    >
      <h2 style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Stock Management</h2>

      {/* Filter Dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Filter by Warehouse:{" "}
          <select
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            value={selectedWarehouse}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '180px' }}
          >
            <option value="">All</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Low Stock Alert */}
      <h3 className="text-lg font-semibold mb-2">🚨 Low Stock Alerts</h3>
      {lowStock.length === 0 ? (
        <p className="mb-6">No low stock items.</p>
      ) : (
        <ul className="mb-6 list-disc list-inside text-red-600">
          {lowStock.map((stock) => (
            <li key={stock.id}>
              {stock.product_name} - {stock.quantity} pcs in {stock.warehouse_name} <strong>(Low Stock)</strong>
            </li>
          ))}
        </ul>
      )}

      {/* Normal Stock Table */}
      <h3 className="text-lg font-semibold mb-2">Current Stock</h3>
      {normalStock.length === 0 ? (
        <p>No stock available.</p>
      ) : (
        <div width="100%" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
          <table width="100%" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
            <thead style={{ backgroundColor: '#2E8B57', color: 'white' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, index) => (
                <tr
                  key={stock.id}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                  }}
                >
                  <td style={{ padding: "10px" }}>{stock.product_name}</td>
                  <td style={{ padding: "10px" }}>{stock.warehouse_name}</td>
                  <td style={{ padding: "10px" }}>{stock.quantity}</td>
                  <td style={{ padding: "10px" }}>
                    {stock.quantity < stock.threshold ? (
                      <span style={{ color: "red", fontWeight: "bold" }}>Low</span>
                    ) : (
                      <span style={{ color: "#2e7d32", fontWeight: "bold" }}>Good</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Movement History */}
      <h3 className="text-lg font-semibold mt-10 mb-2">Stock Movement History</h3>
      {movementHistory.length === 0 ? (
        <p>No stock movement records found.</p>
      ) : (
        <div className="overflow-x-auto rounded shadow border border-gray-200 mt-2">
          <table width="100%" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
            <thead style={{ backgroundColor: '#2E8B57', color: 'white' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Entry ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Product Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date Received</th>
              </tr>
            </thead>
            <tbody>
              {movementHistory.map((entry, index) => (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                  }}
                >
                  <td style={{ padding: '12px', textAlign: 'left' }}>{entry.id}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{entry.products?.name || "N/A"}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{entry.warehouses?.name || "N/A"}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{entry.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>
                    {new Date(entry.date_received).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
