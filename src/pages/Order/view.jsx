import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/redux/hook';
import { openAlert } from '@/redux/reducer/alert';
import Loader from '@/common/Loader';
import Alerts from '@/components/Alerts';

const ViewPreorder = ({ id, onClose, setShow }) => {
  const [loading, setLoading] = useState(false);
  const [preorderData, setPreorderData] = useState(null);
  const [preorderDetails, setPreorderDetails] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const dispatch = useAppDispatch();

  // ฟังก์ชันดึงข้อมูลเริ่มต้น (suppliers, employees, medicines)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [supRes, empRes, medRes] = await Promise.all([
          fetch('http://localhost:4000/src/manager/supplier'),
          fetch('http://localhost:4000/src/manager/emp'),
          fetch('http://localhost:4000/src/manager/medicines'),
        ]);

        if (supRes.ok) {
          const data = await supRes.json();
          setSuppliers(data.data);
        }

        if (empRes.ok) {
          const data = await empRes.json();
          setEmployees(data.data);
        }

        if (medRes.ok) {
          const data = await medRes.json();
          setMedicines(data.data);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    }
    fetchInitialData();
  }, []);

  // ฟังก์ชันดึงข้อมูล preorder และ preorder_detail
  useEffect(() => {
    async function fetchPreorderData() {
      if (!id) return;

      setLoading(true);
      try {
        // ดึงข้อมูล preorder หลัก
        const preorderRes = await fetch(`http://localhost:4000/src/preorder/preorder/${id}`);
        
        if (preorderRes.ok) {
          const preorderResult = await preorderRes.json();
          setPreorderData(preorderResult.data);
        } else {
          throw new Error('ไม่สามารถดึงข้อมูลสั่งซื้อได้');
        }

        // ดึงข้อมูล preorder_detail
        const detailRes = await fetch(`http://localhost:4000/src/preorder_detail/preorder-detail/${id}`);
        
        if (detailRes.ok) {
          const detailResult = await detailRes.json();
          setPreorderDetails(detailResult.data || []);
        } else {
          // ถ้าไม่มี detail ก็ไม่เป็นไร
          setPreorderDetails([]);
        }

      } catch (error) {
        console.error('Error fetching preorder data:', error);
        dispatch(
          openAlert({
            type: 'error',
            title: 'ເກີດຂໍ້ຜິດພາດ',
            message: error.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ',
          }),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPreorderData();
  }, [id, dispatch]);

  // Helper functions
  const getSupplierName = (sup_id) => {
    const supplier = suppliers.find(s => s.sup_id === sup_id);
    return supplier ? `${supplier.company_name} - ${supplier.address}` : '-';
  };

  const getEmployeeName = (emp_id) => {
    const employee = employees.find(e => e.emp_id === emp_id);
    return employee ? `${employee.emp_name} ${employee.emp_surname}` : '-';
  };

 const getMedicineName = (med_id) => {
  const medicine = medicines.find(m => m.med_id === med_id);
  if (!medicine) {
    console.warn('ไม่พบ med_id นี้ใน medicines:', med_id);
  }
  return medicine ? medicine.med_name : '-';
};
const getMedicineunit = (med_id) => {
  const medicine = medicines.find(m => m.med_id === med_id);
  if (!medicine) {
    console.warn('ไม่พบ med_id นี้ใน medicines:', med_id);
  }
  return medicine ? medicine.unit : '-';
};


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="rounded bg-white pt-4 dark:bg-boxdark">
      <Alerts />
      
      {/* Header */}
      <div className="flex items-center border-b border-stroke dark:border-strokedark pb-4 px-4">
        <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3">
          ລາຍລະອຽດສັ່ງຊື້ - {preorderData?.preorder_id}
        </h1>
      </div>

      <div className="p-4">
        {/* ข้อมูลสั่งซื้อหลัก */}
        {preorderData && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-strokedark dark:text-bodydark3">
              ຂໍ້ມູນການສັ່ງຊື້
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black-2">
                  ລະຫັດສັ່ງຊື້
                </label>
                <p className="mt-1 text-sm  text-black">
                  {preorderData.preorder_id}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium  text-black-2">
                  ວັນທີສັ່ງຊື້
                </label>
                <p className="mt-1 text-sm text-black">
                  {formatDate(preorderData.preorder_date)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black-2">
                  ສະຖານະ
                </label>
                <p className="mt-1 text-sm text-black">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    preorderData.status === 'ສຳເລັດ' 
                      ? 'bg-green-100 text-green-800' 
                      : preorderData.status === 'ລໍຖ້າຈັດສົ່ງ'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {preorderData.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black-2">
                  ຜູ້ສະຫນອງ
                </label>
                <p className="mt-1 text-sm text-black">
                  {getSupplierName(preorderData.sup_id)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black-2">
                  ພະນັກງານຜູ້ສ້າງ
                </label>
                <p className="mt-1 text-sm text-black">
                  {getEmployeeName(preorderData.emp_id_create)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ตารางรายละเอียดสั่งซื้อ */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-strokedark dark:text-bodydark3">
            ລາຍການຢາທີ່ສັ່ງຊື້
          </h2>
          
          
          {preorderDetails.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="w-full min-w-max table-auto border-collapse">
                  <thead>
                    <tr className="bg-strokedark text-white">
                      <th className="px-4 py-3 text-left font-medium">ລຳດັບ</th>
                      <th className="px-4 py-3 text-left font-medium">ຊື່ຢາ</th>
                      <th className="px-4 py-3 text-right font-medium">ຈຳນວນ</th>
                      <th className="px-4 py-3 text-left font-medium">ປະເພດ</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {preorderDetails.map((detail, index) => (
                      <tr
                        key={detail.preorder_detail_id || index}
                        className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 text-black-2"
                      >
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4">{getMedicineName(detail.med_id)}</td>
                        <td className="px-4 py-4 text-right">{detail.qty?.toLocaleString() || 0}</td>
                        <td className="px-4 py-4 ">{getMedicineunit(detail.med_id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg">ບໍ່ມີລາຍການຢາທີ່ສັ່ງຊື້</p>
              <p className="text-sm mt-2">ກະລຸນາເພີ່ມລາຍການຢາໃຫ້ກັບການສັ່ງຊື້ນີ້</p>
            </div>
          )}
        </div>

        {/* ปุ่มปิด */}
        <div className="flex justify-end mt-6 pt-4 border-t border-stroke dark:border-strokedark">
          <button
            onClick={() => setShow(false)}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ປິດ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPreorder;