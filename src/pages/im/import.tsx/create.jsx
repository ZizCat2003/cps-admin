import { useForm } from 'react-hook-form';
import Button from '@/components/Button';
import React, { useState, useEffect, useRef } from 'react';
import Loader from '@/common/Loader';
import Alerts from '@/components/Alerts';
import { useAppDispatch } from '@/redux/hook';
import { openAlert } from '@/redux/reducer/alert';
import FileUploadInput from '@/components/Forms/FileUploadInput';
import BoxDate from '../../../components/Date';
import InputBox from '../../../components/Forms/Input_new';
import SelectBoxId from '../../../components/Forms/SelectID';
import { usePrompt } from '@/hooks/usePrompt';

const CreateImport = ({ setShow, getList, onCloseCallback, preorderId }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,

    formState: { isDirty, errors },
  } = useForm();

  const dispatch = useAppDispatch();

    // ref สำหรับ input file
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedPreorder, setSelectedPreorder] = useState('');
  const [employees, setEmployees] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [usedPreorders, setUsedPreorders] = useState([]); // ✅ เก็บ preorder ที่ใช้แล้ว

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


  // ✅ แก้ไขฟังก์ชันล้างข้อมูล
  const handleClearForm = () => {
    reset({
      im_id: '',
      im_date: '',
      note: '',
    });
    setSelectedEmp('');
    setSelectedPreorder('');
    isDirtyRef.current = false;
  };

  // ✅ ฟังก์ชันดึงข้อมูล Import ที่มีอยู่แล้วเพื่อเช็ค preorder ที่ใช้แล้ว
  const fetchUsedPreorders = async () => {
    try {
      const response = await fetch('http://localhost:4000/src/im/import');
      if (response.ok) {
        const data = await response.json();
        const usedPreorderIds = data.data
          .filter(item => item.preorder_id) // กรองเฉพาะที่มี preorder_id
          .map(item => item.preorder_id);
        setUsedPreorders(usedPreorderIds);
      }
    } catch (error) {
      console.error('Error fetching used preorders:', error);
    }
  };

  // ✅ useEffect สำหรับเซ็ต preorder_id อัตโนมัติเมื่อได้รับ props
  useEffect(() => {
    if (preorderId) {
      console.log('Setting preorder_id from props:', preorderId);
      setSelectedPreorder(preorderId);
      setValue('preorder', preorderId);
    }
  }, [preorderId, setValue]);

  // ✅ ดึงข้อมูล Employees, Preorders และ Used Preorders
  useEffect(() => {
    const fetchEmployees = async () => {
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

    const fetchPreorders = async () => {
      try {
        const res = await fetch('http://localhost:4000/src/preorder/preorder');
        const data = await res.json();
        if (res.ok) {
          setPreorders(data.data);
        }
      } catch (error) {
        console.error('Error fetching preorders:', error);
        dispatch(openAlert({
          type: 'error',
          title: 'ເກີດຂໍ້ຜິດພາດ',
          message: 'ບໍ່ສາມາດດຶງຂໍ້ມູນ preorder ໄດ້',
        }));
      }
    };

    fetchEmployees();
    fetchPreorders();
    fetchUsedPreorders(); // ✅ ดึงข้อมูล preorder ที่ใช้แล้ว
  }, [dispatch]);

  // ✅ ฟังก์ชันตรวจสอบก่อนบันทึก
  const validatePreorderUsage = (preorderId) => {
    if (usedPreorders.includes(preorderId)) {
      dispatch(openAlert({
        type: 'error',
        title: 'ບໍ່ສາມາດນຳເຂົ້າໄດ້',
        message: `ລະຫັດ Preorder ${preorderId} ໄດ້ຖືກນຳເຂົ້າແລ້ວ ບໍ່ສາມາດນຳເຂົ້າຊ້ຳໄດ້`,
      }));
      return false;
    }
    return true;
  };

  const handleSave = async (data) => {
    // ✅ ตรวจสอบก่อนว่า preorder นี้ถูกใช้แล้วหรือไม่
    if (!validatePreorderUsage(selectedPreorder)) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('im_id', data.im_id);
      formData.append('im_date', data.im_date);
      formData.append('preorder_id', selectedPreorder);
      formData.append('emp_id', selectedEmp);
      formData.append('note', data.note || '');

      // ✅ เพิ่มไฟล์ถ้ามี
      if (data.file && data.file.length > 0) {
        formData.append('file', data.file[0]);
      }



      const response = await fetch('http://localhost:4000/src/im/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // ✅ ตรวจสอบข้อผิดพลาดจาก backend เกี่ยวกับ preorder ซ้ำ
        if (result.message && result.message.includes('preorder_id')) {
          throw new Error('ລະຫັດ Preorder ນີ້ໄດ້ຖືກນຳເຂົ້າແລ້ວ ບໍ່ສາມາດນຳເຂົ້າຊ້ຳໄດ້');
        }
        throw new Error(result.error || result.message || 'ບັນທຶກບໍ່ສຳເລັດ');
      }

      dispatch(openAlert({
        type: 'success',
        title: 'ສຳເລັດ',
        message: 'ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ',
      }));

      await getList();
      reset();
      setSelectedEmp('');
      setSelectedPreorder('');
      setShow(false);
    } catch (error) {
      console.error('Error saving data:', error);
      dispatch(openAlert({
        type: 'error',
        title: 'ເກີດຂໍ້ຜິດພາດ',
        message: error.message || 'ການບັນທຶກຂໍ້ມູນມີຂໍ້ຜິດພາດ',
      }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ กรอง preorder ที่ยังไม่ได้ใช้
  const availablePreorders = preorders.filter(preorder =>
    !usedPreorders.includes(preorder.preorder_id)
  );

  if (loading) return <Loader />;

  return (
    <div className="rounded bg-white pt-4 dark:bg-boxdark">
      <Alerts />
      <div className="flex items-center border-b border-stroke dark:border-strokedark pb-4">
        <h1 className="text-lg font-medium text-strokedark dark:text-bodydark3 px-4">
          ເພີ່ມຂໍ້ມູນ Import
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(handleSave)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pt-4"
      >
        {/* ✅ ລະຫັດ Import */}
        <InputBox
          label="ລະຫັດ Import (im_id)"
          name="im_id"
          type="text"
          placeholder="ປ້ອນລະຫັດ Import"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນລະຫັດ Import' }}
          errors={errors}
        />

        {/* ✅ ວັນທີ່ Import */}
        <BoxDate
          name="im_date"
          label="ວັນທີ່ Import"
          select=""
          register={register}
          setValue={setValue}
          errors={errors}
          formOptions={{ required: 'ກະລຸນາເລືອກວັນທີ່' }}
        />

        {/* ✅ เลือก Preorder - แสดงเฉพาะที่ยังไม่ได้ใช้ */}
        <SelectBoxId
          label=" Preorder (ທີ່ຍັງບໍ່ໄດ້ນຳເຂົ້າ)"
          name="preorder"
          value={selectedPreorder}
          options={availablePreorders.map((preorder) => ({
            value: preorder.preorder_id,
            label: `${preorder.preorder_id || ''}`,
          }))}
          register={register}
          errors={errors}
          formOptions={{ required: 'ກະລຸນາເລືອກ Preorder' }}
          onSelect={(e) => {
            setSelectedPreorder(e.target.value);
          }}
        />

        {/* ✅ เลือก Employee */}
        <SelectBoxId
          label="ເລືອກພະນັກງານ"
          name="employee"
          value={selectedEmp}
          options={employees.map((emp) => ({
            value: emp.id,
            label: `${emp.name} ${emp.surname} (${emp.role})`,
          }))}
          register={register}
          errors={errors}
          formOptions={{ required: 'ກະລຸນາເລືອກພະນັກງານ' }}
          onSelect={(e) => {
            setSelectedEmp(e.target.value);
          }}
        />

        {/* ✅ อัพโลดไฟล์ */}
        <div className="md:col-span-2">
          <FileUploadInput
            label="ໄຟລເອກະສານ"
            name="file"
            type="file"
            register={register}
            errors={errors}
            formOptions={{ required: false }}
          />

          {/* ✅ note */}
          <InputBox
            label="ໝາຍເຫດ ບໍ່ບັງຄັບ"
            name="note"
            type="text"
            placeholder="ກະລຸນາປ້ອນລະຫັດໝາຍເຫດຖ້າມີ"
            register={register}
          />
        </div>

        {/* ✅ ปุ่มบันทึก */}
        <div className="md:col-span-2 mt-4 flex justify-end space-x-4 py-4">

          <Button
            variant="cancel"
            type="button"
            onClick={handleClearForm}
            disabled={loading}
          >
            ລ້າງຂໍ້ມູນ
          </Button>

          <Button variant="save" type="submit" disabled={loading}>
            {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
          </Button>
        </div>
      </form>

    </div>
  );
};

export default CreateImport;

