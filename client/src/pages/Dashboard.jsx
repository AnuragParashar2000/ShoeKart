import React, { useEffect, useState } from "react";
import "../styles/adminDashboard.css";
import DashCard from "../components/DashCard";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import Axios from "../Axios";
import { toast } from "react-toastify";
import TriangleLoader from "../components/TriangleLoader";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  ArcElement,
  Legend
);
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bar1: { labels: [], data: [] },
    bar2: { labels: [], data: [] },
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalSales: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwtAdmin");
        if (!token) {
          return toast.error("Access denied. Please login first.");
        }
        const res = await Axios.get("/api/v1/admin/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data && res.data.bar1 && res.data.bar1.data) {
          const myData = res.data.bar1.data.map((item) => Number(item));
          setData({
            ...res.data,
            bar1: { labels: res.data.bar1.labels, data: myData },
          });
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Something went wrong");
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const data1 = {
    labels: data.bar1.labels,
    datasets: [
      {
        data: data.bar1.data,
        backgroundColor: "#28A745",
        label: "Amount",
      },
    ],
  };
  const data2 = {
    labels: data.bar2.labels,
    datasets: [
      {
        data: data.bar2.data,
        backgroundColor: ["#FFC107", "#28A745", "red", "#DC3545"],
        label: "No of Orders",
      },
    ],
  };
  const options1 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      }
    }
  };
  const options2 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: false,
      },
    },
  };
  if (loading) return <TriangleLoader height="500px" />;
  return (
    <div className="dashboardMain">
      <h1>Dashboard</h1>
      <div className="dashOverview">
        <DashCard title="Total Users" amount={data.totalUsers} />
        <DashCard title="Total Orders" amount={data.totalOrders} />
        <DashCard title="Total Products" amount={data.totalProducts} />
        <DashCard title="Total Products" amount={`₹${data.totalSales}`} />
      </div>
      <div className="graphBox">
        <div className="graph-box box-1">
          <h3>Order Status Distribution</h3>
          {data.totalOrders === 0 ? (
            <div className="no-data-message">
              <p>No orders yet. Start selling to see order status distribution!</p>
            </div>
          ) : (
            <Doughnut data={data2} options={options2} />
          )}
        </div>
        <div className="graph-box box-2">
          <h3>Monthly Sales</h3>
          {data.totalSales === "0.00" ? (
            <div className="no-data-message">
              <p>No sales data yet. Start selling to see monthly sales chart!</p>
            </div>
          ) : (
            <Bar data={data1} options={options1} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
