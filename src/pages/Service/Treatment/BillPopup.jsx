import {
  X,
  Printer,
  FileText,
  User,
  CreditCard,
  Hash,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import Logo from '../../../images/logo/cps.png';
import React, { useState, useEffect } from 'react';

const BillPopup = ({
  isOpen,
  onClose,
  patientData,
  inspectionData,
  services = [],
  medicines = [],
}) => {
  if (!isOpen) return null;

  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [invoiceData, setInvoiceData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const totalServiceCost = services.reduce(
    (total, service) => total + service.price * service.qty,
    0,
  );

  const totalMedicineCost = medicines.reduce(
    (total, medicine) => total + medicine.price * medicine.qty,
    0,
  );

  const grandTotal = totalServiceCost + totalMedicineCost;

  // Generate Invoice when component mounts
  useEffect(() => {
    if (isOpen && !invoiceData) {
      generateInvoice();
    }
  }, [isOpen]);

  const generateInvoice = () => {
    const newInvoice = {
      invoice_id: `INV-${Date.now()}`,
      pay_id: null,
      date: new Date().toISOString(),
      pay_amount: grandTotal,
      debt_amount: grandTotal,
      debt: grandTotal,
      status: 'pending',
      ex_rate: 1,
      ex_type: 'LAK',
    };
    setInvoiceData(newInvoice);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ກີບ';
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');

    try {
      const newPayment = {
        pay_id: `PAY-${Date.now()}`,
        in_id: inspectionData?.in_id,
        date: new Date().toISOString(),
        amount: grandTotal,
        debt: 0,
        status: 'completed',
      };

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const updatedInvoice = {
        ...invoiceData,
        pay_id: newPayment.pay_id,
        debt_amount: 0,
        debt: 0,
        status: 'paid',
      };

      setPaymentData(newPayment);
      setInvoiceData(updatedInvoice);
      setPaymentStatus('completed');

      setTimeout(() => {
        setPaymentStatus('pending');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
      setTimeout(() => setPaymentStatus('pending'), 3000);
    }
  };

  const handlePartialPayment = (amount) => {
    if (amount <= 0 || amount > grandTotal) return;

    setPaymentStatus('processing');

    setTimeout(() => {
      const newPayment = {
        pay_id: `PAY-${Date.now()}`,
        in_id: inspectionData?.in_id,
        date: new Date().toISOString(),
        amount: amount,
        debt: grandTotal - amount,
        status: 'partial',
      };

      const updatedInvoice = {
        ...invoiceData,
        pay_id: newPayment.pay_id,
        debt_amount: grandTotal - amount,
        debt: grandTotal - amount,
        status: amount === grandTotal ? 'paid' : 'partial',
      };

      setPaymentData(newPayment);
      setInvoiceData(updatedInvoice);
      setPaymentStatus('completed');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header - Hidden on print */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50 print:hidden">
          <h2 className="text-xl font-semibold text-form-input flex items-center">
            <Receipt className="mr-3 text-form-strokedark" size={24} />
            ໃບບິນການປິ່ນປົວ
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <Printer className="mr-2" size={16} />
              ພິມ
            </button>
            <button
              onClick={onClose}
              className="text-form-strokedark hover:text-form-input p-2 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-8 print:p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8 pb-6 ">
            <div className="flex-shrink-0">
              <img src={Logo} alt="CPS Logo" width={200} className="h-auto" />
            </div>

            <div className="text-right">
              <h1 className="text-2xl font-bold text-form-input mb-4">
                ໃບບິນການປິ່ນປົວ
              </h1>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center min-w-[200px]">
                  <span className="text-form-strokedark">ເລກທີໃບບິນ:</span>
                  <span className="font-semibold text-form-input ml-4">
                    {invoiceData?.invoice_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-form-strokedark">ວັນທີອອກໃບບິນ:</span>
                  <span className="font-semibold text-form-input ml-4">
                    {formatDate(new Date())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient & Treatment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-5 rounded-lg ">
              <h3 className="font-semibold text-form-input mb-4 flex items-center text-lg">
                <User className="mr-2 text-form-strokedark" size={18} />
                ຂໍ້ມູນຄົນເຈັບ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ລະຫັດຄົນເຈັບ:</span>
                  <span className="font-medium text-form-input">
                    {patientData?.patient_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ເລກທີປິ່ນປົວ:</span>
                  <span className="font-medium text-form-input">
                    {inspectionData?.in_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ຊື່-ນາມສະກູນ:</span>
                  <span className="font-medium text-form-input">
                    {patientData?.patient_name || ''}{' '}
                    {patientData?.patient_surname || ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ເພດ:</span>
                  <span className="font-medium text-form-input">
                    {patientData?.gender === 'male' ? 'ຊາຍ' : 'ຍິງ'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 ">
              <h3 className="font-semibold text-form-input mb-4 flex items-center text-lg">
                <Hash className="mr-2 text-form-strokedark" size={18} />
                ຂໍ້ມູນການປິ່ນປົວ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ວັນທີປິ່ນປົວ:</span>
                  <span className="font-medium text-form-input">
                    {formatDate(inspectionData?.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ອາການເບື່ອງຕົ້ນ:</span>
                  <span className="font-medium text-form-input">
                    {inspectionData?.symptom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ການວິເຄາະ:</span>
                  <span className="font-medium text-form-input">
                    {inspectionData?.diseases_now}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-form-strokedark">ການກວດ:</span>
                  <span className="font-medium text-form-input">
                    {inspectionData?.checkup}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Services and Medicines Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-form-input mb-4 text-lg">
              ລາຍການບໍລິການ ແລະ ຢາທີ່ໃຊ້:
            </h3>
            <div className="overflow-x-auto border border-stroke rounded-lg">
              <table className="w-full min-w-max table-auto border-collapse overflow-hidden rounded-lg">
                <thead>
                  <tr className="text-left bg-secondary2 text-white">
                    <th className="border-b border-gray-200 px-4 py-3 text-left  ">
                      ລຳດັບ
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left  ">
                      ລາຍການ
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-center  ">
                      ຈຳນວນ
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-right  ">
                      ລາຄາ/ຫົວ
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-right  ">
                      ລາຄາລວມ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Services */}
                  {services.map((service, index) => (
                    <tr
                      key={`service-${index}`}
                      className="border-b border-stroke  hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 text-form-strokedark">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 text-form-input font-medium">
                        {service.name || service.ser_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center text-form-strokedark">
                        {service.qty}
                      </td>
                      <td className="px-4 py-3 text-right text-form-strokedark">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-form-input font-semibold">
                        {formatCurrency(service.price * service.qty)}
                      </td>
                    </tr>
                  ))}

                  {/* Medicines */}
                  {medicines.map((medicine, index) => (
                    <tr
                      key={`medicine-${index}`}
                      className="border-b border-stroke hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 text-form-strokedark">
                        {services.length + index + 1}
                      </td>

                      <td className="px-4 py-3 text-form-input font-medium">
                        {medicine.name || medicine.med_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center text-form-strokedark">
                        {medicine.qty}
                      </td>
                      <td className="px-4 py-3 text-right text-form-strokedark">
                        {formatCurrency(medicine.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-form-input font-semibold">
                        {formatCurrency(medicine.price * medicine.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {inspectionData?.note && (
            <div className="mb-8">
              <h3 className="font-semibold text-form-input mb-3 text-lg">
                ໝາຍເຫດ:
              </h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-form-strokedark leading-relaxed">
                  {inspectionData.note}
                </p>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className=" pt-6">
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <div className="bg-gray-50 p-6 space-y-4">
                  {/* Subtotals */}
                  {services.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-form-strokedark">ລວມບໍລິການ:</span>
                      <span className="font-semibold text-form-input">
                        {formatCurrency(totalServiceCost)}
                      </span>
                    </div>
                  )}

                  {medicines.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-form-strokedark">ລວມຢາ:</span>
                      <span className="font-semibold text-form-input">
                        {formatCurrency(totalMedicineCost)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-form-input">
                        ລາຄາລວມທັງໝົດ:
                      </span>
                      <span className="font-bold text-blue-600 text-xl">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {invoiceData && (
                    <>
                      <div className="border-t border-gray-300 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-form-strokedark">
                            ຈຳນວນເງິນທີ່ຊຳລະ:
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(
                              invoiceData.pay_amount - invoiceData.debt_amount,
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-form-strokedark">
                            ຄົງເຫຼືອ:
                          </span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(invoiceData.debt_amount)}
                          </span>
                        </div>

                        {paymentData && (
                          <div className="flex justify-between text-sm">
                            <span className="text-form-strokedark">
                              ເລກການຊຳລະ:
                            </span>
                            <span className="font-semibold text-form-input">
                              {paymentData.pay_id}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-form-strokedark">ສະຖານະ:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              invoiceData.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoiceData.status === 'partial'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {invoiceData.status === 'paid'
                              ? 'ຊຳລະແລ້ວ'
                              : invoiceData.status === 'partial'
                                ? 'ຊຳລະບາງສ່ວນ'
                                : 'ຍັງບໍ່ຊຳລະ'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Buttons - Hidden on print */}
          <div className="mt-8 print:hidden">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handlePayment}
                  disabled={
                    paymentStatus === 'processing' ||
                    paymentStatus === 'completed' ||
                    (invoiceData && invoiceData.status === 'paid')
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                    paymentStatus === 'completed' ||
                    (invoiceData && invoiceData.status === 'paid')
                      ? 'bg-green-500 cursor-default'
                      : paymentStatus === 'processing'
                        ? 'bg-yellow-500 animate-pulse cursor-wait'
                        : paymentStatus === 'failed'
                          ? 'bg-red-500'
                          : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
                  }`}
                >
                  {paymentStatus === 'completed' ||
                  (invoiceData && invoiceData.status === 'paid') ? (
                    <CheckCircle size={18} />
                  ) : (
                    <CreditCard size={18} />
                  )}
                  {paymentStatus === 'pending' && 'ຊຳລະເງິນເຕັມຈຳນວນ'}
                  {paymentStatus === 'processing' && 'ກຳລັງດຳເນີນການ...'}
                  {paymentStatus === 'completed' && 'ຊຳລະເງິນສຳເລັດ'}
                  {paymentStatus === 'failed' && 'ຊຳລະເງິນບໍ່ສຳເລັດ'}
                  {invoiceData && invoiceData.status === 'paid' && 'ຊຳລະແລ້ວ'}
                </button>
              </div>

              {/* Partial Payment Options */}
              {paymentStatus === 'pending' &&
                invoiceData?.status !== 'paid' && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handlePartialPayment(grandTotal * 0.5)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      ຊຳລະ 50%
                    </button>
                    <button
                      onClick={() => handlePartialPayment(grandTotal * 0.25)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      ຊຳລະ 25%
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <div className="space-y-2">
              <p className="text-form-input font-medium text-lg">
                ຂອບໃຈທີ່ມາໃຊ້ບໍລິການ
              </p>
              <p className="text-form-strokedark">CPS Client Dental</p>
              <p className="text-form-strokedark text-sm">
                ໂທລະສັບ: 021-xxxxxx | ອີເມວ: info@cps-dental.la
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPopup;

// import {
//   X,
//   Printer,
//   FileText,
//   User,
//   CreditCard,
//   Hash,
//   Receipt,
//   CheckCircle,
// } from 'lucide-react';
// import Logo from '../../../images/logo/cps.png';
// import React, { useState, useEffect } from 'react';

// const BillPopup = ({
//   isOpen,
//   onClose,
//   patientData,
//   inspectionData,
//   services = [],
//   medicines = [],
// }) => {
//   if (!isOpen) return null;

//   const [paymentStatus, setPaymentStatus] = useState('pending');
//   const [invoiceData, setInvoiceData] = useState(null);
//   const [paymentData, setPaymentData] = useState(null);

//   const totalServiceCost = services.reduce(
//     (total, service) => total + service.price * service.qty,
//     0,
//   );

//   const totalMedicineCost = medicines.reduce(
//     (total, medicine) => total + medicine.price * medicine.qty,
//     0,
//   );

//   const grandTotal = totalServiceCost + totalMedicineCost;

//   // Generate Invoice when component mounts
//   useEffect(() => {
//     if (isOpen && !invoiceData) {
//       generateInvoice();
//     }
//   }, [isOpen]);

//   const generateInvoice = () => {
//     const newInvoice = {
//       invoice_id: `INV-${Date.now()}`,
//       pay_id: null, // Will be set when payment is made
//       date: new Date().toISOString(),
//       pay_amount: grandTotal,
//       debt_amount: grandTotal, // Initially all amount is debt
//       debt: grandTotal,
//       status: 'pending',
//       ex_rate: 1, // Assuming LAK currency
//       ex_type: 'LAK',
//     };
//     setInvoiceData(newInvoice);
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('lo-LA', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('lo-LA').format(amount) + ' ກີບ';
//   };

//   const handlePayment = async () => {
//     setPaymentStatus('processing');

//     try {
//       // Create Payment record
//       const newPayment = {
//         pay_id: `PAY-${Date.now()}`,
//         in_id: inspectionData?.in_id,
//         date: new Date().toISOString(),
//         amount: grandTotal,
//         debt: 0, // After full payment, debt becomes 0
//         status: 'completed',
//       };

//       // Simulate payment processing
//       await new Promise((resolve) => setTimeout(resolve, 3000));

//       // Update Invoice with payment information
//       const updatedInvoice = {
//         ...invoiceData,
//         pay_id: newPayment.pay_id,
//         debt_amount: 0, // Payment completed, no debt remaining
//         debt: 0,
//         status: 'paid',
//       };

//       setPaymentData(newPayment);
//       setInvoiceData(updatedInvoice);
//       setPaymentStatus('completed');

//       // Auto close after showing success
//       setTimeout(() => {
//         setPaymentStatus('pending');
//         onClose();
//       }, 2000);
//     } catch (error) {
//       console.error('Payment failed:', error);
//       setPaymentStatus('failed');
//       setTimeout(() => setPaymentStatus('pending'), 3000);
//     }
//   };

//   const handlePartialPayment = (amount) => {
//     if (amount <= 0 || amount > grandTotal) return;

//     setPaymentStatus('processing');

//     setTimeout(() => {
//       const newPayment = {
//         pay_id: `PAY-${Date.now()}`,
//         in_id: inspectionData?.in_id,
//         date: new Date().toISOString(),
//         amount: amount,
//         debt: grandTotal - amount,
//         status: 'partial',
//       };

//       const updatedInvoice = {
//         ...invoiceData,
//         pay_id: newPayment.pay_id,
//         debt_amount: grandTotal - amount,
//         debt: grandTotal - amount,
//         status: amount === grandTotal ? 'paid' : 'partial',
//       };

//       setPaymentData(newPayment);
//       setInvoiceData(updatedInvoice);
//       setPaymentStatus('completed');
//     }, 2000);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
//           {/* <h2 className="text-xl font-semibold text-gray-800 flex items-center">
//             <FileText className="mr-2" size={24} />
//             ໃບບິນການປິ່ນປົວ
//             {invoiceData && (
//               <span className="ml-2 text-sm text-gray-500">
//                 #{invoiceData.invoice_id}
//               </span>
//             )}
//           </h2> */}

//           <div className="flex space-x-2">
//             <button
//               onClick={handlePrint}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition"
//             >
//               <Printer className="mr-2" size={16} />
//               ພິມ
//             </button>
//             <button
//               onClick={onClose}
//               className="text-strokedark p-2 rounded-md transition"
//             >
//               <X size={16} />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 print:p-8">
//           <div className="flex justify-between items-start mb-8">
//             <div className="w-1/2">
//               <img src={Logo} alt="Logo" width={150} className="ml-0" />
//             </div>
//             <div className="flex justify-end w-full">
//               <div className="mb-6  p-4 rounded w-full max-w-xs">
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-form-strokedark">
//                     <p className="text-form-strokedark text-xl font-medium mb-2">
//                       ໃບບິນການປິ່ນປົວ
//                     </p>
//                     <span className="text-green-700 font-semibold"></span>
//                   </div>

//                   <div className="flex justify-between items-center text-sm text-form-strokedark mt-2">
//                     <span>ວັນທີອອກໃບບິນ:</span>
//                     <span className="font-semibold">
//                       {formatDate(new Date())}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm text-form-strokedark mt-2">
//                     <span>ເລກທີໃບບິນ:</span>
//                     <span className="font-semibold">
//                       {/* {invoiceData.invoice_id} */}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold text-form-strokedark mb-3 flex items-center">
//                 <User className="mr-2" size={18} />
//                 ຂໍ້ມູນຄົນເຈັບ
//               </h3>
//               <div className="space-y-2 text-sm">
//                 <p>
//                   <span className="font-medium">ລະຫັດ:</span>{' '}
//                   {patientData?.patient_id || 'N/A'}
//                 </p>
//                 <p>
//                   <span className="font-medium">ເລກທີປິ່ນປົວ:</span>{' '}
//                   {inspectionData?.in_id || 'N/A'}
//                 </p>
//                 <p>
//                   <span className="font-medium">ຊື່:</span>{' '}
//                   {patientData?.patient_name || ''}{' '}
//                   {patientData?.patient_surname || ''}
//                 </p>
//                 <p>
//                   <span className="font-medium">ເພດ:</span>{' '}
//                   {patientData?.gender === 'male' ? 'ຊາຍ' : 'ຍິງ'}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold text-form-input mb-3 flex items-center">
//                 <Hash className="mr-2" size={18} />
//                 ຂໍ້ມູນການປິ່ນປົວ
//               </h3>
//               <div className="space-y-2 text-sm">
//                 <p>
//                   <span className="font-medium text-form-strokedark">ວັນທີປິ່ນປົວ:</span>{' '}
//                   {formatDate(inspectionData?.date)}
//                 </p>
//                 <p>
//                   <span className="font-medium">ອາການເບື່ອງຕົ້ນ:</span>{' '}
//                   {inspectionData?.symptom || 'N/A'}
//                 </p>
//                 <p>
//                   <span className="font-medium">ບົ່ງມະຕີ:</span>{' '}
//                   {inspectionData?.diseases_now || 'N/A'}
//                 </p>
//                 <p>
//                   <span className="font-medium">ພະຍາດ:</span>{' '}
//                   {inspectionData?.checkup || 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Services Table */}
//           {services.length > 0 && (
//             <div className="mb-6">
//               <h3 className="font-semibold text-form-strokedark mb-3">
//                 ບໍລິການທີ່ໃຊ້:
//               </h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full border border-gray-300 text-sm">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="border border-gray-300 px-3 py-2 text-left">
//                         ລຳດັບ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-left">
//                         ຊື່ບໍລິການ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-center">
//                         ຈຳນວນ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-right">
//                         ລາຄາ/ຫົວ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-right">
//                         ລາຄາລວມ
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {services.map((service, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="border border-gray-300 px-3 py-2">
//                           {index + 1}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2">
//                           {service.name || service.ser_name || 'N/A'}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2 text-center">
//                           {service.qty}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2 text-right">
//                           {formatCurrency(service.price)}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2 text-right">
//                           {formatCurrency(service.price * service.qty)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-gray-100">
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="border border-gray-300 px-3 py-2 text-right font-semibold"
//                       >
//                         ລວມບໍລິການ:
//                       </td>
//                       <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
//                         {formatCurrency(totalServiceCost)}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Medicines Table */}
//           {medicines.length > 0 && (
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-800 mb-3">ຢາທີ່ຈ່າຍ:</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full border border-gray-300 text-sm">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="border border-gray-300 px-3 py-2 text-left">
//                         ລຳດັບ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-left">
//                         ຊື່ຢາ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-center">
//                         ຈຳນວນ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-right">
//                         ລາຄາ/ຫົວ
//                       </th>
//                       <th className="border border-gray-300 px-3 py-2 text-right">
//                         ລາຄາລວມ
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {medicines.map((medicine, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="border border-gray-300 px-3 py-2">
//                           {index + 1}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2">
//                           {medicine.name || medicine.med_name || 'N/A'}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2 text-center">
//                           {medicine.qty}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2 text-right">
//                           {formatCurrency(medicine.price)}
//                         </td>
//                         <td className="border border-gray-300 px-3 py-2 text-right">
//                           {formatCurrency(medicine.price * medicine.qty)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-gray-100">
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="border border-gray-300 px-3 py-2 text-right font-semibold"
//                       >
//                         ລວມຢາ:
//                       </td>
//                       <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
//                         {formatCurrency(totalMedicineCost)}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Notes */}
//           {inspectionData?.note && (
//             <div className="mb-6">
//               <h3 className="font-semibold text-form-strokedark mb-2">ໝາຍເຫດ:</h3>
//               <p className="bg-blue-50 p-3 rounded  text-sm">
//                 {inspectionData.note}
//               </p>
//             </div>
//           )}

//           {/* Invoice & Payment Summary */}
//           {invoiceData && (
//             <div className="flex justify-end w-full">
//               <div className="mb-6 bg p-4 rounded w-full max-w-xs">
//                 <div className="space-y-2">
//                   <div className="flex justify-between ">
//                     <span className="font-medium text-form-strokedark">
//                       ຈຳນວນເງິນທີ່ຊຳລະ:
//                     </span>
//                     <span className="font-semibold text-form-strokedark">
//                       {formatCurrency(
//                         invoiceData.pay_amount - invoiceData.debt_amount,
//                       )}
//                     </span>
//                   </div>

//                   <div className="flex justify-between">
//                     <span className="font-medium text-form-strokedark">
//                       ຈຳນວນຄົບຫນີ້:
//                     </span>
//                     <span className="font-semibold text-form-strokedark">
//                       {formatCurrency(invoiceData.debt_amount)}
//                     </span>
//                   </div>

//                   {paymentData && (
//                     <div className="flex justify-between">
//                       <span className="font-medium text-form-strokedark">
//                         ເລກການຊຳລະ:
//                       </span>
//                       <span className="font-semibold text-form-strokedark">
//                         {paymentData.pay_id}
//                       </span>
//                     </div>
//                   )}

//                   <div className="flex justify-between items-center pt-1">
//                     <span className="font-medium text-form-strokedark">
//                       ສະຖານະ:
//                     </span>
//                     <span
//                       className={`px-6 py-2 rounded text-sm font-semibold ${
//                         invoiceData.status === 'paid'
//                           ? 'bg-green-100 text-green-800'
//                           : invoiceData.status === 'partial'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : 'bg-red-100 text-red-800'
//                       }`}
//                     >
//                       {invoiceData.status === 'paid'
//                         ? 'ຊຳລະແລ້ວ'
//                         : invoiceData.status === 'partial'
//                           ? 'ຊຳລະບາງສ່ວນ'
//                           : 'ຍັງບໍ່ຊຳລະ'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="border-t-2 border-gray-300 pt-4">
//             {invoiceData && (
//               <div className="flex justify-end w-full">
//                 <div className="mb-6 bg-blue-50 p-4 rounded w-full max-w-xs">
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-form-strokedark">
//                       <span>ລາຄາລວມທັງໝົດ:</span>
//                       <span className="text-green-700 font-semibold">
//                         {formatCurrency(grandTotal)}
//                       </span>
//                     </div>

//                     {invoiceData && invoiceData.debt_amount > 0 && (
//                       <div className="flex justify-between items-center text-sm text-red-600 mt-2">
//                         <span>ຍັງຫນີ້:</span>
//                         <span className="font-semibold">
//                           {formatCurrency(invoiceData.debt_amount)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Payment Section */}
//           <div className="mb-4 mt-8 print:hidden">
//             <div className="mt-6 flex flex-col space-y-3">
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={handlePayment}
//                   disabled={
//                     paymentStatus === 'processing' ||
//                     paymentStatus === 'completed' ||
//                     (invoiceData && invoiceData.status === 'paid')
//                   }
//                   className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition ${
//                     paymentStatus === 'completed' ||
//                     (invoiceData && invoiceData.status === 'paid')
//                       ? 'bg-green-500'
//                       : paymentStatus === 'processing'
//                         ? 'bg-yellow-500 animate-pulse'
//                         : paymentStatus === 'failed'
//                           ? 'bg-red-500'
//                           : 'bg-blue-600 hover:bg-blue-700'
//                   }`}
//                 >
//                   {paymentStatus === 'completed' ||
//                   (invoiceData && invoiceData.status === 'paid') ? (
//                     <CheckCircle size={18} />
//                   ) : (
//                     <CreditCard size={18} />
//                   )}
//                   {paymentStatus === 'pending' && 'ຊຳລະເງິນເຕັມຈຳນວນ'}
//                   {paymentStatus === 'processing' && 'ກຳລັງດຳເນີນການ...'}
//                   {paymentStatus === 'completed' && 'ຊຳລະເງິນສຳເລັດ'}
//                   {paymentStatus === 'failed' && 'ຊຳລະເງິນບໍ່ສຳເລັດ'}
//                   {invoiceData && invoiceData.status === 'paid' && 'ຊຳລະແລ້ວ'}
//                 </button>
//               </div>

//               {/* Partial Payment Options */}
//               {paymentStatus === 'pending' &&
//                 invoiceData?.status !== 'paid' && (
//                   <div className="flex justify-end space-x-2">
//                     <button
//                       onClick={() => handlePartialPayment(grandTotal * 0.5)}
//                       className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm transition"
//                     >
//                       ຊຳລະ 50%
//                     </button>
//                     <button
//                       onClick={() => handlePartialPayment(grandTotal * 0.25)}
//                       className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm transition"
//                     >
//                       ຊຳລະ 25%
//                     </button>
//                   </div>
//                 )}
//             </div>
//           </div>

//           <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
//             <p>ຂອບໃຈທີ່ມາໃຊ້ບໍລິການ</p>
//             <p className="mt-2">CPS Client Dental - ໂທ: 021-xxxxxx</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillPopup;
