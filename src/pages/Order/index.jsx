import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import Search from '@/components/Forms/Search';
import { TableAction } from '@/components/Tables/TableAction';
import ConfirmModal from '@/components/Modal';
import { iconAdd, PDF } from '@/configs/icon';
import { OrderHeaders } from './column/order';
import OrderCreate from './create';
import { useAppDispatch } from '@/redux/hook';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrder, setFilteredOrder] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const dispatch = useAppDispatch();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'http://localhost:4000/src/preorder/preorder',
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);
      setOrders(data.data);
      setFilteredOrder(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrder(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.preorder_id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredOrder(filtered);
    }
  }, [searchQuery, orders]);

  const openDeleteModal = (id) => () => {
    setSelectedOrderId(id);
    setShowModal(true);
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return;
    try {
      const response = await fetch(
        `http://localhost:4000/src/preorder/preorder/${selectedOrderId}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error('Failed to delete order');

      setOrders((prev) =>
        prev.filter((o) => o.preorder_id !== selectedOrderId),
      );
      setShowModal(false);
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/order/edit/${id}`);
  };

  return (
    <div className="rounded bg-white pt-4 dark:bg-boxdark">
      <div className="flex items-center justify-between border-b border-stroke px-4 pb-4 dark:border-strokedark">
        <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3">
          ຈັດການລາຍການສັ່ງຊື້
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/order/create')}
            icon={PDF}
            className="bg-primary"
          >
            Export
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            icon={iconAdd}
            className="bg-primary"
          >
            ເພີ່ມລາຍການ
          </Button>
        </div>
      </div>

      <div className="grid w-full gap-4 p-4">
        <Search
          type="text"
          name="search"
          placeholder="ຄົ້ນຫາ..."
          className="rounded border border-stroke dark:border-strokedark"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full min-w-max table-auto border-collapse overflow-hidden rounded-lg">
          <thead>
            <tr className="text-left bg-secondary2 text-white">
              {OrderHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300"
                >
                  {header.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrder.length > 0 ? (
              filteredOrder.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-4">{order.preorder_id}</td>
                  <td className="px-4 py-4">
                    {new Date(order.preorder_date).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-4">{order.qty}</td>
                  <td className="px-4 py-4">{order.status}</td>
                  <td className="px-4 py-4">{order.lot}</td>
                  <td className="px-4 py-4">{order.sup_id}</td>
                  <td className="px-4 py-4">{order.med_id}</td>
                  <td className="px-3 py-4 text-center">
                    <TableAction
                      onDelete={openDeleteModal(order.preorder_id)}
                      onEdit={() => handleEdit(order.preorder_id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  ບໍ່ມີຂໍ້ມູນ
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4 ">
            <div
              className="    rounded
        w-full max-w-lg     
        md:max-w-2xl        
         lg:max-w-4xl 
        xl:max-w-5xl       
        relative
        overflow-auto
        max-h-[90vh]"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute px-4 top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <OrderCreate setShow={setShowAddModal} getList={fetchOrders} />
            </div>
          </div>
        )}
      </div>

      {/* <ConfirmModal
        show={showModal}
        setShow={setShowModal}
        message="ທ່ານຕ້ອງການລົບລາຍການນີ້ອອກຈາກລະບົບບໍ່？"
        handleConfirm={handleDeleteOrder}
      /> */}
    </div>
  );
};

export default OrderPage;
