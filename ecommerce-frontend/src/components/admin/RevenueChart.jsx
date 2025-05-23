import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { apiClient } from '../../utils/apiHelper';
import toast from 'react-hot-toast';

// Registrasi komponen Chart.js yang diperlukan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = () => {  // Set tanggal awal ke awal bulan ini
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  // Set tanggal akhir ke hari ini
  const [endDate, setEndDate] = useState(dayjs());
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue data with dates:', {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      });

      const response = await apiClient.get('/admin/revenue', {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });

      console.log('Revenue data received:', response.data);
      setRevenueData(response.data || []); // Ensure we always set an array
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      toast.error('Gagal memuat data pendapatan');
      setRevenueData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate]);

  // Hitung total pendapatan dan pesanan untuk periode yang dipilih
  const totalRevenue = revenueData.reduce((sum, item) => sum + Number(item.daily_revenue), 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + Number(item.order_count), 0);

  const chartData = {
    labels: revenueData.map(item => dayjs(item.date).format('DD MMM YYYY')),
    datasets: [
      {
        label: 'Pendapatan Harian',
        data: revenueData.map(item => item.daily_revenue),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        yAxisID: 'y'
      },
      {
        label: 'Jumlah Pesanan',
        data: revenueData.map(item => item.order_count),
        fill: false,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Grafik Pendapatan dan Pesanan'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Pendapatan Harian') {
              return `Pendapatan: Rp ${context.parsed.y.toLocaleString('id-ID')}`;
            } else {
              return `Jumlah Pesanan: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pendapatan (Rp)'
        },
        ticks: {
          callback: function(value) {
            return 'Rp ' + value.toLocaleString('id-ID');
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jumlah Pesanan'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="mb-6 flex flex-wrap gap-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Tanggal Mulai"
            value={startDate}
            onChange={setStartDate}
            maxDate={endDate}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true
              }
            }}
          />
          <DatePicker
            label="Tanggal Akhir"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate}
            maxDate={dayjs()}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true
              }
            }}
          />
        </LocalizationProvider>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Pendapatan Periode Ini</h3>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-600">Total Pesanan Periode Ini</h3>
          <p className="text-2xl font-bold text-orange-800 mt-1">
            {totalOrders} pesanan
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : revenueData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Tidak ada data pendapatan untuk periode ini</p>
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default RevenueChart;
