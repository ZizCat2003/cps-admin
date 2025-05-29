import { useForm } from 'react-hook-form';
import Button from '@/components/Button';
import React, { useState, useEffect, useRef } from 'react'; // ✅ เพิ่ม useRef
import SelectID from '@/components/Forms/SelectID';
import Loader from '@/common/Loader';
import Alerts from '@/components/Alerts';
import { useAppDispatch } from '@/redux/hook';
import { openAlert } from '@/redux/reducer/alert';
import FileUploadInput from '@/components/Forms/FileUploadInput';
import BoxDate from '../../../components/Date';

const CreateImport = ({ setShow, getList, onCloseCallback }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    
    formState: { isDirty, errors },
  } = useForm();

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState('');
  const [sup, setSup] = useState('');
  const [med, setMed] = useState('');
  const [selectMed, setSelectMed] = useState('');
  const [selectSup, setSelectSup] = useState('');
  const [selectEmpCreate, setSelectEmpCreate] = useState('');
  const [selectEmpUpdate, setSelectEmpUpdate] = useState('');
  const [medicine, setMedicine] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [employees, setEmployees] = useState([]);

  // ✅ ใช้ useRef เพื่อเก็บ current value ของ isDirty
  const isDirtyRef = useRef(isDirty);
  
  // ✅ อัพเดต ref ทุกครั้งที่ isDirty เปลี่ยน
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  
  // ✅ เตือนเมื่อมีการพยายามออกจากหน้าด้วย navigation (Back / เปลี่ยน route)
  usePrompt('ທ່ານຕ້ອງການອອກຈາກໜ້ານີ້ແທ້ຫຼືບໍ? ຂໍ້ມູນທີ່ກຳລັງປ້ອນຈະສູນເສຍ.', isDirty);

  // ✅ เตือนเมื่อจะรีเฟรช / ปิดแท็บ
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ✅ เตือนเมื่อคลิกปิดฟอร์ม - ใช้ current value จาก ref
  const handleCloseForm = () => {
    if (isDirtyRef.current) {
      const confirmLeave = window.confirm('ທ່ານຕ້ອງການປິດຟອມແທ້ຫຼືບໍ? ຂໍ້ມູນທີ່ປ້ອນຈະສູນເສຍ');
      if (!confirmLeave) return;
    }
    setShow(false);
  };

  // ✅ ส่ง handleCloseForm ไปให้ parent component แค่ครั้งเดียว
  useEffect(() => {
    if (onCloseCallback) {
      onCloseCallback(() => handleCloseForm);
    }
  }, [onCloseCallback]);

  useEffect(() => {
    const fetchMed = async () => {
      try {
        const res = await fetch('http://localhost:4000/src/manager/medicines');
        const data = await res.json();
        if (res.ok) {
          setMedicine(data.data);
        }
      } catch (error) {
        console.error('Error fetching medicine:', error);
        dispatch(openAlert({
          type: 'error',
          title: 'ເກີດຂໍ້ຜິດພາດ',
          message: 'ບໍ່ສາມາດດຶງຂໍ້ມູນຢາໄດ້',
        }));
      }
    };

    const fetchSup = async () => {
      try {
        const res = await fetch('http://localhost:4000/src/manager/supplier');
        const data = await res.json();
        if (res.ok) {
          setSupplier(data.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        dispatch(openAlert({
          type: 'error',
          title: 'ເກີດຂໍ້ຜິດພາດ',
          message: 'ບໍ່ສາມາດດຶງຂໍ້ມູນຜູ້ສະໜອງໄດ້',
        }));
      }
    };

    const fetchEmp = async () => {
      try {
        const res = await fetch('http://localhost:4000/src/manager/emp');
        const data = await res.json();
        if (res.ok) {
          const transformedData = data.data.map(emp => ({
            id: emp.emp_id,
            name: emp.emp_name,
            surname: emp.emp_surname,
            role: emp.role,
          }));
          setEmployees(transformedData);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        dispatch(openAlert({
          type: 'error',
          title: 'ເກີດຂໍ້ຜິດພາດ',
          message: 'ບໍ່ສາມາດດຶງຂໍ້ມູນພະນັກງານໄດ້',
        }));
      }
    };

    fetchMed();
    fetchSup();
    fetchEmp();
  }, [dispatch]);

  useEffect(() => {
    const now = new Date().toISOString();
    setValue('created_at', now);
  }, [setValue]);

  const handleSave = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('im_id', data.im_id);
      formData.append('im_date', data.im_date);
      formData.append('qty', data.qty);
      formData.append('expired', data.expired);
      formData.append('created_at', data.created_at);
      formData.append('update_by', data.update_by);
      formData.append('lot', data.lot || '');

      if (data.document && data.document.length > 0) {
        formData.append('document', data.document[0]);
      }

      formData.append('emp_id_create', selectEmpCreate);
      formData.append('emp_id_updated', selectEmpUpdate);
      formData.append('sup_id', sup);
      formData.append('med_id', med);

      const response = await fetch('http://localhost:4000/src/im/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'ບັນທຶກບໍ່ສຳເລັດ');

      dispatch(openAlert({
        type: 'success',
        title: 'ສຳເລັດ',
        message: 'ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ',
      }));

      await getList();
      reset();
      setShow(false);
    } catch (error) {
      console.error('Error saving data:', error);
      dispatch(openAlert({
        type: 'error',
        title: 'ເກີດຂໍ້ຜິດພາດ',
        message: 'ການບັນທຶກຂໍ້ມູນມີຂໍ້ຜິດພາດ',
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  return (
    <div className="rounded bg-white pt-4 dark:bg-boxdark">
      <Alerts />
      <div className="flex items-center border-b border-stroke dark:border-strokedark pb-4">
        <h1 className="text-lg font-medium text-strokedark dark:text-bodydark3 px-4">
          ເພີ່ມຂໍ້ມູນ
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(handleSave)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4"
      >
        <InputBox
          label="ລະຫັດ"
          name="im_id"
          type="text"
          placeholder="ປ້ອນລະຫັດ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນລະຫັດ' }}
          errors={errors}
        />
        <BoxDate
          name="im_date"
          label="ວັນທີ່"
          select=""
          register={register}
          setValue={setValue}
          errors={errors}
          formOptions={{ required: 'ກະລຸນາເລືອກວັນທີ' }}
        />
        <InputBox
          label="ຈຳນວນ"
          name="qty"
          type="text"
          placeholder="ປ້ອນຈຳນວນ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນຈຳນວນ' }}
          errors={errors}
        />
         <InputBox
          label="ລ໋ອດການນຳເຂົ້າ"
          name="lot"
          type="number"
          placeholder="ປ້ອນຈຳນວນ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນຈຳນວນ' }}
          errors={errors}
        />
        <BoxDate
          name="expired"
          label="ວັນໝົດອາຍຸ"
          select=""
          register={register}
          setValue={setValue}
          errors={errors}
          formOptions={{ required: 'ກະລຸນາເລືອກວັນໝົດອາຍຸ' }}
        />
        <FileUploadInput
          label="ໄຟລເອກະສານ"
          name="document"
          type="file"
          register={register}
          errors={errors}
          formOptions={{ required:  false}}
        />

        <SelectBoxId
          label="ຜູ້ສະໜອງ"
          name="supplier"
          value={selectSup}
          options={supplier.map((s) => ({
            value: s.sup_id,
            label: `${s.company_name} ${s.address}`,
          }))}
          register={register}
          errors={errors}
          onSelect={(e) => {
            setSelectSup(e.target.value);
            setSup(e.target.value);
          }}
        />
        <SelectBoxId
          label="ຢາ"
          name="medicine"
          value={selectMed}
          options={medicine.map((m) => ({
            value: m.med_id,
            label: m.med_name,
          }))}
          register={register}
          errors={errors}
          onSelect={(e) => {
            setSelectMed(e.target.value);
            setMed(e.target.value);
          }}
        />

        <SelectBoxId
          label="ພະນັກງານ (ຜູ້ສ້າງ)"
          name="emp_id_create"
          value={selectEmpCreate}
          options={employees.map((emp) => ({
            label: `${emp.name} ${emp.surname} ${emp.role}`,
            value: emp.id,
          }))}
          register={register}
          errors={errors}
          onSelect={(e) => setSelectEmpCreate(e.target.value)}
        />

        {/* ✅ เปลี่ยนจาก DatePicker เป็น BoxDate */}
        <BoxDate
          register={register}
          errors={errors}
          name="created_at"
          label="ວັນທີສ້າງ"
          select=""
          formOptions={{ required: 'ກະລຸນາໃສ່ວັນທີສ້າງ' }}
          setValue={setValue}
        />

       
        <div className="mt-4 flex justify-end space-x-4 py-4">
          <Button variant="save" type="submit" disabled={loading}>
            {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateImport;

