import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Button from '@/components/Button';
import TypeService from '../TypeService/TypeService';
import { useForm } from 'react-hook-form';
import SelectPatientPopup from '../TypeService/Component/SelectPatientPopup';
import AntdTextArea from '../../../components/Forms/AntdTextArea';
import BoxDate from '../../../components/Date';
import InputBox from '../../../components/Forms/Input_new';
import useStoreServices from '../../../store/selectServices';
import BillPopup from './BillPopup';
import useStoreMed from '../../../store/selectMed';
import useStoreQi from '../../../store/selectQi';

const Treatment = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inspectionId, setInspectionId] = useState(null);

  const { services } = useStoreServices();
  const { medicines } = useStoreMed();
  const { medicine } = useStoreQi();

  const [intivalue, setIntivalue] = useState({
    diseases_now: '',
    symptom: '',
    note: '',
    checkup: '',
  });

  const [formData, setFormData] = useState({
    patient_id: '',
    in_id: '',
    date: '',
  });

  const getGenderLabel = (gender) => {
    if (gender === 'male') return 'ຊາຍ';
    if (gender === 'female') return 'ຍິງ';
    return '';
  };

  const getDob = (dob) => {
    return dob ? dob : '';
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:4000/src/manager/patient');
      const data = await res.json();
      setPatients(data.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handlePatientSelect = async (patientData) => {
    console.log('Selected patient:', patientData);
    setSelectedPatient(patientData);

    setFormData((prev) => ({
      ...prev,
      patient_id: patientData.patient_id,
    }));

    try {
      const res = await fetch(
        `http://localhost:4000/src/in/inspection/${patientData.patient_id}`,
      );
      const result = await res.json();

      console.log('Inspection API response:', result);

      if (res.ok && result?.data?.in_id) {
        const inspection = result.data;
        setInspectionId(inspection.in_id);
        setFormData((prev) => ({
          ...prev,
          in_id: inspection.in_id,
          date: inspection.date,
        }));
        console.log('Inspection ID set:', inspection.in_id);
      } else {
        console.warn('No inspection data found or invalid response:', result);
      }
    } catch (err) {
      console.error('Error fetching inspection data:', err);
    }
  };

  const [idPatient, setIdPatient] = useState('');
  const [test, setTest] = useState('');
  const [checkID, setCheckID] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  console.log(medicines);

  useEffect(() => {
    if (checkID) {
      setIdPatient(idPatient);
    }
  }, [checkID]);

  const HandlenSubmit = async () => {
    console.log('kk');
    setLoading(true);

    let newService = services.map((item) => ({
      ser_id: item.ser_id,
      qty: item.qty,
      price: item.price,
    }));

    const sendData = {
      diseases_now: intivalue.diseases_now || '',
      symptom: intivalue.symptom || '',
      note: intivalue.note || '',
      checkup: intivalue.checkup || '',
      detailed: newService,
    };

    // const medicineData = medicines.map((med) => ({
    //   med_id: med.med_id,
    //   qty: med.qty,
    //   price: med.price,
    // }));
    const medicineData = [
      ...medicines.map((med) => ({
        med_id: med.med_id,
        qty: med.qty,
        price: med.price,
      })),
      ...medicine.map((item) => ({
        med_id: item.med_id,
        qty: item.qty,
        price: item.price,
      })),
    ];

    const sendMed = { data: medicineData };

    try {
      const response = await fetch(
        `http://localhost:4000/src/in/inspection/${inspectionId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sendData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Inspection response:', result);

      const medicineRes = await fetch(
        `http://localhost:4000/src/in/inspectionmedicines/${inspectionId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sendMed),
        },
      );

      if (!medicineRes.ok) {
        throw new Error(`HTTP error! status: ${medicineRes.status}`);
      }

      const results = await medicineRes.json();
      console.log('Medicine response:', results);

      alert('ບັນທຶກສຳເລັດ');

      setIntivalue({
        diseases_now: '',
        symptom: '',
        note: '',
        checkup: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('ມີຂໍ້ຜິດພາດ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowBill = () => {
    if (!selectedPatient || !inspectionId) {
      alert('ກະລຸນາເລືອກຄົນເຈັບແລະມີຂໍ້ມູນການປິ່ນປົວກ່ອນ');
      return;
    }
    setShowBillPopup(true);
  };

  const inspectionData = {
    in_id: inspectionId,
    date: formData.date,
    symptom: intivalue.symptom,
    checkup: intivalue.checkup,
    diseases_now: intivalue.diseases_now,
    note: intivalue.note,
  };

  return (
    <div className="rounded-lg bg-white pt-4 p-4 dark:bg-boxdark shadow-md">
      <div className="mb-6 border-b border-stroke dark:border-strokedark pb-4">
        <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3">
          ບໍລິການ
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <label className="text-sm text-gray-600 mb-1 block">
            ເລືອກຄົນເຈັບ
          </label>
          <input
            type="text"
            readOnly
            className="w-full rounded border text-purple-700 font-medium border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:disabled:bg-meta-4 dark:focus:border-primary dark:text-white capitalize cursor-pointer"
            placeholder="ປ້ອນຄົນເຈັບ"
            value={
              selectedPatient
                ? `${selectedPatient.patient_id ?? ''} ${selectedPatient.patient_name ?? ''} ${selectedPatient.patient_surname ?? ''} ${getGenderLabel(selectedPatient?.gender)}`
                : ''
            }
            onClick={() => setShowPopup(true)}
          />

          <div
            className="absolute top-8 right-2 cursor-pointer text-gray-600 hover:text-primary"
            onClick={() => setShowPopup(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-purple-800"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"
              />
            </svg>
          </div>

          {showPopup && (
            <SelectPatientPopup
              patients={patients}
              onSelect={handlePatientSelect}
              onClose={() => setShowPopup(false)}
              callback={(x) => {
                if (x) {
                  setIdPatient(x);
                  setCheckID(true);
                }
              }}
            />
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            ເລກທີປິ່ນປົວ
          </label>
          <input
            type="text"
            readOnly
            className="w-full rounded border border-stroke bg-gray-50 py-3 px-4 outline-none"
            value={inspectionId || ''}
            placeholder="ລໍຖ້າເລືອກຄົນເຈັບ"
          />
        </div>

        <BoxDate
          name="date"
          label="ວັນທີປິ່ນປົວ"
          select="date"
          formOptions={false}
          withTime={true}
          value={formData.date}
        />

        <AntdTextArea
          label="ອາການເບື່ອງຕົ້ນ (Symptom)"
          name="symptom"
          rows={2}
          placeholder="ປ້ອນອາການ"
          onChange={(e) =>
            setIntivalue({ ...intivalue, symptom: e.target.value })
          }
          value={intivalue.symptom}
        />

        <AntdTextArea
          label="ບົ່ງມະຕິ (Checkup)"
          name="checkup"
          rows={2}
          placeholder="ປ້ອນຂໍ້ມູນບບົ່ງມະຕິ"
          onChange={(e) =>
            setIntivalue({ ...intivalue, checkup: e.target.value })
          }
          value={intivalue.checkup}
        />

        <AntdTextArea
          label="ພະຍາດ (diseases Now)"
          name="diseases_now"
          rows={2}
          placeholder="ປ້ອນຜົນກວດ"
          onChange={(e) =>
            setIntivalue({ ...intivalue, diseases_now: e.target.value })
          }
          value={intivalue.diseases_now}
        />

        <AntdTextArea
          label="ໝາຍເຫດ"
          name="note"
          rows={2}
          placeholder="ປ້ອນລາຍລະອຽດເພີ່ມເຕີມຖ້າມີ"
          onChange={(e) => setIntivalue({ ...intivalue, note: e.target.value })}
          value={intivalue.note}
        />
      </div>

      <div className="overflow-x-auto shadow mb-8">
        <TypeService />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleShowBill}
            className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 flex items-center transition"
          >
            <FileText className="mr-2" size={20} />
            Bill
          </button>

          <Button
            variant="save"
            onClick={HandlenSubmit}
            disabled={loading || !inspectionId}
          >
            {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
          </Button>
        </div>
      </div>

      {/* เพิ่ม BillPopup */}
      <BillPopup
        isOpen={showBillPopup}
        onClose={() => setShowBillPopup(false)}
        patientData={selectedPatient}
        inspectionData={inspectionData}
        services={services}
        medicines={selectedMedicines}
      />
    </div>
  );
};

export default Treatment;

// import React, { useEffect, useState } from 'react';
// import { FileText } from 'lucide-react';
// import Button from '@/components/Button';
// import TypeService from '../TypeService/TypeService';
// import { useForm } from 'react-hook-form';
// import SelectPatientPopup from '../TypeService/Component/SelectPatientPopup';
// import AntdTextArea from '../../../components/Forms/AntdTextArea';
// import BoxDate from '../../../components/Date';
// import InputBox from '../../../components/Forms/Input_new';
// import useStoreServices from '../../../store/selectServices';

// const Treatment = () => {
//   const [patients, setPatients] = useState([]);
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [inspectionId, setInspectionId] = useState(null);

//   const { services } = useStoreServices();

//   const [intivalue, setIntivalue] = useState({
//     diseases_now: '',
//     symptom: '',
//     note: '',
//     checkup: '',
//   });

//   const getGenderLabel = (gender) => {
//     if (gender === 'male') return 'ຊາຍ';
//     if (gender === 'female') return 'ຍິງ';
//     return '';
//   };

//   const getDob = (dob) => {
//     return dob ? dob : '';
//   };

//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   const fetchPatients = async () => {
//     try {
//       const res = await fetch('http://localhost:4000/src/manager/patient');
//       const data = await res.json();
//       // console.log(data);
//       setPatients(data.data);
//     } catch (err) {
//       console.error('Error fetching patients:', err);
//     }
//   };

//   // const handlePatientSelect = (patientData) => {
//   //   setSelectedPatient(patientData);
//   //   setValue('patient_id', patientData.patient_id);

//   //   if (patientData.inspectionId) {
//   //     setInspectionId(patientData.inspectionId);
//   //     setValue('in_id', patientData.inspectionId);
//   //   }

//   //   if (patientData.inspectionDate) {
//   //     setValue('date', patientData.inspectionDate);
//   //   }
//   // };

//   const handlePatientSelect = async (patientData) => {
//     setSelectedPatient(patientData);
//     setValue('patient_id', patientData.patient_id);

//     try {
//       const res = await fetch(
//         `http://localhost:4000/src/in/inspection/${patientData.patient_id}`,
//       );
//       const result = await res.json();

//       if (res.ok && result?.data?.in_id) {
//         const inspection = result.data;
//         setInspectionId(inspection.in_id);
//         setValue('in_id', inspection.in_id);
//         setValue('date', inspection.date);
//       }
//     } catch (err) {
//       console.error('Error fetching inspection data:', err);
//     }
//   };

//   const [idPatient, setIdPatient] = useState('');
//   const [test, setTest] = useState('');
//   const [checkID, setCheckID] = useState(false);

//   useEffect(() => {
//     if (checkID) {
//       setIdPatient(idPatient);
//     }
//   }, [checkID]);
//   // console.log(test)

//   const HandlenSubmit = async () => {
//   setLoading(true);

//   let newService = services.map((item) => ({
//     ser_id: item.ser_id,
//     qty: item.qty,
//     price: item.price,
//   }));

//   const sendData = {
//     diseases_now: intivalue.diseases_now || '',
//     symptom: intivalue.symptom || '',
//     note: intivalue.note || '',
//     checkup: intivalue.checkup || '',
//     detailed: newService,
//   };

//   try {
//     if (!inspectionId) {
//       alert('can not find inspection ID');
//       return;
//     }

//     await fetch(`http://localhost:4000/src/in/inspection/${inspectionId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(sendData),
//     });

//     alert('ບັນທຶກສຳເລັດ');
//   } catch (error) {
//     console.error('Error submitting form:', error);
//     alert('ມີຂໍ້ຜິດພາດ: ' + error.message);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="rounded-lg bg-white pt-4 p-4 dark:bg-boxdark shadow-md">
//       <div className="mb-6 border-b border-stroke dark:border-strokedark pb-4">
//         <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3">
//           ບໍລິການ
//         </h1>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//         <div className="relative">
//           <label className="text-sm text-gray-600 mb-1 block">
//             ເລືອກຄົນເຈັບ
//           </label>
//           <input
//             type="text"
//             readOnly
//             className="w-full rounded border text-purple-700  font-medium border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:disabled:bg-meta-4 dark:focus:border-primary  dark:text-white capitalize cursor-pointer"
//             placeholder="ປ້ອນຄົນເຈັບ"
//             value={
//               selectedPatient
//                 ? `${selectedPatient.patient_id ?? ''} ${selectedPatient.patient_name ?? ''} ${selectedPatient.patient_surname ?? ''}  ${getGenderLabel(selectedPatient?.gender)}`
//                 : ''
//             }
//             onClick={() => setShowPopup(true)}
//           />
//           <input
//             type="hidden"
//             // {...register('patient_id', { required: 'ກະລຸນາເລືອກຄົນເຈັບ' })}
//             value={selectedPatient ? selectedPatient.patient_id : ''}
//           />

//           <div
//             className="absolute top-8 right-2 cursor-pointer text-gray-600 hover:text-primary"
//             onClick={() => setShowPopup(true)}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-5 h-5 text-purple-800"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 fill="currentColor"
//                 d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"
//               />
//             </svg>
//           </div>

//           {showPopup && (
//             <SelectPatientPopup
//               patients={patients}
//               onSelect={handlePatientSelect}
//               onClose={() => setShowPopup(false)}
//               callback={(x) => {
//                 if (x) {
//                   setIdPatient(x);
//                   setCheckID(true);
//                 }
//               }}
//             />
//           )}
//         </div>
//         <p>{idPatient?.in_id}</p>
//         {/* <InputBox
//           label="ເລກທີປິ່ນປົວ"
//           type="text"
//           placeholder="ປ້ອນລະຫັດ"
//           value={test?.in_id}
//           readOnly={true}
//         /> */}

//         <BoxDate
//           name="date"
//           label="ວັນທີປິ່ນປົວ"
//           select="date_addmintted"
//           formOptions={false}
//           withTime={true}
//         />

//         <AntdTextArea
//           label="ອາການເບື່ອງຕົ້ນ (Symptom)"
//           name="symptom"
//           rows={2}
//           placeholder="ປ້ອນອາການ"
//           onChange={(e) =>
//             setIntivalue({ ...intivalue, symptom: e.target.value })
//           }
//           value={intivalue.symptom}
//         />

//         <InputBox
//           label="ບົ່ງມະຕິ (Checkup)"
//           name="checkup"
//           type="text"
//           placeholder="ປ້ອນຂໍ້ມູນ"
//           onChange={(e) =>
//             setIntivalue({ ...intivalue, checkup: e.target.value })
//           }
//           value={intivalue.checkup}
//         />
//         <AntdTextArea
//           label="ພະຍາດ (diseases Now)"
//           name="diseases_now"
//           rows={2}
//           placeholder="ປ້ອນຜົນກວດ"
//           onChange={(e) =>
//             setIntivalue({ ...intivalue, diseases_now: e.target.value })
//           }
//           value={intivalue.diseases_now}
//         />
//         <AntdTextArea
//           label="ໝາຍເຫດ"
//           name="note"
//           rows={2}
//           placeholder="ປ້ອນລາຍລະອຽດເພີ່ມເຕີມຖ້າມີ"
//           onChange={(e) => setIntivalue({ ...intivalue, note: e.target.value })}
//           value={intivalue.note}
//         />
//       </div>

//       <div className="overflow-x-auto shadow mb-8">
//         <TypeService />
//       </div>

//       <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//         <div className="flex space-x-4">
//           <button
//             type="button"
//             className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 flex items-center transition"
//           >
//             <FileText className="mr-2" size={20} />
//             Bill
//           </button>

//           <Button variant="save" onClick={HandlenSubmit} disabled={loading}>
//             {/* {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'} */}
//             save
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Treatment;

// import React, { useEffect, useState } from 'react';
// import { FileText } from 'lucide-react';
// import Button from '@/components/Button';
// import TypeService from '../TypeService/TypeService';
// import { useForm } from 'react-hook-form';
// import SelectPatientPopup from '../TypeService/Component/SelectPatientPopup';
// import AntdTextArea from '../../../components/Forms/AntdTextArea';
// import BoxDate from '../../../components/Date';
// import InputBox from '../../../components/Forms/Input_new';

// const Treatment = ({ setShow, getList }) => {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm();

//   const [patients, setPatients] = useState([]);
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const getGenderLabel = (gender) => {
//     if (gender === 'male') return 'ຊາຍ';
//     if (gender === 'female') return 'ຍິງ';
//     return '';
//   };
//   const getDob = (dob) => {
//     return dob ? dob : '';
//   };
//   const selectedDate = watch('date_addmintted');

//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   const fetchPatients = async () => {
//     try {
//       const res = await fetch('http://localhost:4000/src/manager/patient');
//       const data = await res.json();
//       setPatients(data.data);
//       if (data.in_id) {
//         setInspectionId(data.in_id);
//       }
//     } catch (err) {
//       console.error('Error fetching patients:', err);
//     }
//   };

//   const onSubmit = (data) => {
//     setLoading(true);
//     setLoading(false);
//   };
//   const [inspectionId, setInspectionId] = useState(null);

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="rounded-lg bg-white pt-4 p-4 dark:bg-boxdark shadow-md"
//     >
//       <div className="mb-6 border-b border-stroke dark:border-strokedark pb-4">
//         <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3">
//           ບໍລິການ
//         </h1>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//         <div className="relative">
//           <label className="text-sm text-gray-600 mb-1 block">
//             ເລືອກຄົນເຈັບ
//           </label>
//           <input
//             type="text"
//             readOnly
//             className="w-full rounded border text-purple-700  font-medium border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:disabled:bg-meta-4 dark:focus:border-primary  dark:text-white capitalize cursor-pointer"
//             placeholder="ປ້ອນຄົນເຈັບ"
//             value={
//               selectedPatient
//                 ? `${selectedPatient.patient_id ?? ''} ${selectedPatient.patient_name ?? ''} ${selectedPatient.patient_surname ?? ''}  ${getGenderLabel(selectedPatient?.gender)}`
//                 : ''
//             }
//             onClick={() => setShowPopup(true)}
//           />
//           <input
//             type="hidden"
//             {...register('patient_id', { required: 'ກະລຸນາເລືອກຄົນເຈັບ' })}
//             value={selectedPatient ? selectedPatient.patient_id : ''}
//           />
//           {errors.patient_id && (
//             <p className="text-red-500 text-sm mt-1">
//               {errors.patient_id.message}
//             </p>
//           )}

//           <div
//             className="absolute top-8 right-2 cursor-pointer text-gray-600 hover:text-primary"
//             onClick={() => setShowPopup(true)}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-5 h-5 text-purple-800"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 fill="currentColor"
//                 d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"
//               />
//             </svg>
//           </div>

//           {showPopup && (
//             <SelectPatientPopup
//               patients={patients}
//               onSelect={(patient) => {
//                 setSelectedPatient(patient);
//                 setValue('patient_id', patient.patient_id);
//               }}
//               onClose={() => setShowPopup(false)}
//             />
//           )}
//         </div>
//         <InputBox
//           label="ເລກທີປິ່ນປົວ"
//           name="in_id"
//           type="text"
//           placeholder="ປ້ອນລະຫັດ"
//           register={register}
//           formOptions={false}
//           errors={errors}
//           value={inspectionId}
//           readOnly={true}
//         />

//         <BoxDate
//           name="date"
//           label="ວັນທີປິ່ນປົວ"
//           register={register}
//           errors={errors}
//           select={selectedDate}
//           formOptions={{ required: 'ກະລຸນາເລືອກວັນທີປິ່ນປົວ' }}
//           setValue={setValue}
//           withTime={true}
//         />
//         <AntdTextArea
//           label="ອາການເບື່ອງຕົ້ນ (Symptom)"
//           name="symptom"
//           rows={2}
//           placeholder="ປ້ອນອາການ"
//           register={register}
//           formOptions={{ required: 'ກະລຸນາປ້ອນອາການກ່ອນ' }}
//           errors={errors}
//         />

//         <AntdTextArea
//           label="ບົ່ງມະຕິ (Checkup)"
//           name="checkup"
//           rows={2}
//           placeholder="ປ້ອນຜົນກວດ"
//           register={register}
//           formOptions={{ required: 'ກະລຸນາປ້ອນຜົນກວດ' }}
//           errors={errors}
//         />
//         <AntdTextArea
//           label="ໝາຍເຫດ"
//           name="note"
//           rows={2}
//           placeholder="ປ້ອນລາຍລະອຽດເພີ່ມເຕີມຖ້າມີ"
//           register={register}
//           formOptions={{ required: false }}
//           errors={errors}
//         />
//       </div>

//       <div className="overflow-x-auto shadow mb-8">
//         <TypeService />
//       </div>
//       <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//         <div className="flex space-x-4">
//           <button
//             type="button"
//             className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 flex items-center transition"
//           >
//             <FileText className="mr-2" size={20} />
//             Bill
//           </button>

//           <Button variant="save" type="submit" disabled={loading}>
//             {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
//           </Button>
//         </div>
//       </div>
//     </form>
//   );
// };

// export default Treatment;
