import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iconAdd } from '@/configs/icon';
import Button from '@/components/Button';
import Search from '@/components/Forms/Search';
import { TableAction } from '@/components/Tables/TableAction';
import ConfirmModal from '@/components/Modal';
import Alerts from '@/components/Alerts';
import { ServiceHeaders } from './column/service';

const ServicePage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]); // Data ของบริการ
  const [filteredServices, setFilteredServices] = useState<any[]>([]); // Data ที่กรองแล้ว
  const [showModal, setShowModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // ค่าของการค้นหาที่ผู้ใช้ป้อน
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/manager/servicelist`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data received:', data); // Debugging
        setServices(data.data); // บันทึกข้อมูลบริการ
        setFilteredServices(data.data); // เริ่มต้นให้ผลลัพธ์เป็นทั้งหมด
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Add a useEffect to apply search filtering whenever searchQuery or services change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service =>
        service.ser_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const openDeleteModal = (id: string) => () => {
    setSelectedServiceId(id);
    setShowModal(true);
  };

  const handleDeleteService = async () => {
    if (!selectedServiceId) return;

    try {
      const response = await fetch(
        `http://localhost:4000/manager/servicelist/${selectedServiceId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Just update the services state - the useEffect will automatically update filteredServices
      setServices((prevServices) =>
        prevServices.filter(
          (service) => service.ser_id !== selectedServiceId
        ),
      );

      setShowModal(false);
      setSelectedServiceId(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEditService = (id: string) => {
    navigate(`/servicelist/edit/${id}`);
  };

  const handleViewService = (id: string) => {
    navigate(`/servicelist/detail/${id}`);
  };

  return (
    <div className="rounded bg-white pt-4 dark:bg-boxdark">
      <div className="flex items-center justify-between border-b border-stroke px-4 pb-4 dark:border-strokedark">
        <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3">ຈັດການຂໍ້ມູນລາຍງານບໍລິການ</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/servicelist/create')}
            icon={iconAdd}
            className="bg-primary"
          >
            ເພີ່ມຂໍ້ມູນລາຍການ
          </Button>
        </div>
      </div>

      <div className="grid w-full gap-4 p-4">
        <Search
          type="text"
          name="search"
          placeholder="ຄົ້ນຫາຊື່ລາຍການ..."
          className="rounded border border-stroke dark:border-strokedark"
          onChange={(e) => {
            const query = e.target.value;
            setSearchQuery(query);
          }}
        />
      </div>

      <div className="text-md text-strokedark dark:text-bodydark3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto border-collapse ">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100 text-left dark:bg-meta-4 bg-blue-100">
                {ServiceHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 "
                  >
                    {header.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                  <tr
                    key={index}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-4">{service.ser_id}</td>

                    <td className="px-4 py-4">{service.ser_name}</td>
                    <td className="px-4 py-4">{(service.price * 1).toLocaleString()}</td>


                    <td className="px-3 py-4 text-center">
                      <TableAction
                        // onView={() => handleViewService(service.ser_id)}
                        onDelete={openDeleteModal(service.ser_id)}
                        onEdit={() => handleEditService(service.ser_id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    ບໍ່ມີຂໍ້ມູນ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        show={showModal}
        setShow={setShowModal}
        message="ທ່ານຕ້ອງການລົບລາຍການນີ້ອອກຈາກລະບົບບໍ່？"
        handleConfirm={handleDeleteService} 
      />
    </div>
  );
};

export default ServicePage;
