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

const RevenueChart = () => {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/revenue', {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });
      setRevenueData(response.data);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      toast.error('Gagal memuat data pendapatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate]);

  const chartData = {
    labels: revenueData.map(item => dayjs(item.date).format('DD MMM YYYY')),
    datasets: [
      {
        label: 'Pendapatan Harian',
        data: revenueData.map(item => item.daily_revenue),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Grafik Pendapatan Harian'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Rp ' + value.toLocaleString('id-ID');
          }
        }
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
