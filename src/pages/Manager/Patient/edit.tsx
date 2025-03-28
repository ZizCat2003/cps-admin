import { useForm } from 'react-hook-form';
import Button from '@/components/Button';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '@/components/Forms/Input_two';
import DatePicker from '@/components/DatePicker_two';
import Select from '@/components/Forms/Select';
import React, { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';

const EditPatient: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      patient_id:'',
      patient_name: '',
      patient_surname: '',
      gender: '',
      dob: '',
      phone1: '',
      phone2: '',
      village: '',
      district: '',
      province: '',
    },
  });

  const [gender, setGender] = useState<string>('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/manager/patient/${id}`,
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'ດຶງຂໍ້ມູນຜິດພາດ');
        }

        reset(result.data);
        setGender(result.data.gender);
      } catch (error: any) {
        alert(error.message || 'ມີຂໍ້ຜິດພາດ');
      }
    };

    fetchPatient();
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(
        `http://localhost:4000/manager/patient/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'ບັນທຶກບໍ່ສຳເລັດ');
      }

      navigate('/manager/patient');
    } catch (error: any) {
      alert(error.message || 'ມີຂໍ້ຜິດພາດ');
    }
  };
  useEffect(() => {
    if (gender) {
      setValue('gender', gender);
    }
  }, [gender, setValue]);

  return (
    <div className="rounded bg-white pt-4 dark:bg-boxdark">
     <div className="flex items-center  border-b border-stroke px-4 dark:border-strokedark pb-4">
        <BackButton className="" />
        <h1 className="text-md md:text-lg lg:text-xl font-medium text-strokedark dark:text-bodydark3 px-6">
          ແກ້ໄຂ
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 px-4 pt-4 "
      >
       
        <Input
          label="ຊື່ຄົນເຈັບ"
          name="patient_name"
          type="text"
          placeholder="ປ້ອນຊຶ່"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນຊື່ຄົນເຈັບກ່ອນ' }}
          errors={errors}
        />
        <Input
          label="ນາມສະກຸນ"
          name="patient_surname"
          type="text"
          placeholder="ນາມສະກຸນ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນນາມສະກຸນກ່ອນ' }}
          errors={errors}

        />
        <Select
          label="ເພດ"
          name="gender"
          options={['ຊາຍ', 'ຍິງ']}
          register={register}
          errors={errors}
          value={gender}
          onSelect={(e) => setGender(e.target.value)}

        />

        <DatePicker
          name="dob"
          label="ວັນເດືອນປີເກີດ"
          register={register}
          errors={errors}
          setValue={setValue}
          select={getValues('dob')}
          className="text-strokedark dark:text-bodydark3"


        />

        <Input
          label="ເບີຕິດຕໍ່"
          name="phone1"
          type="text"
          placeholder="ເບີຕິດຕໍ່"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນເບີຕິດຕໍ່ກ່ອນ' }}

          errors={errors}
        />
        <Input
          label="ເບີຕິດຕໍ່ສຳຮອງ"
          name="phone2"
          type="text"
          placeholder="ເບີຕິດຕໍ່ສຳຮອງ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນເບີຕິດຕໍ່ສຳຮອງກ່ອນ' }}
          errors={errors}

        />
        <Input
          label="ບ້ານ"
          name="village"
          type="text"
          placeholder="ບ້ານ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນບ້ານກ່ອນ' }}
          errors={errors}

        />
        <Input
          label="ເມືອງ"
          name="district"
          type="text"
          placeholder="ເມືອງ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນເມືອງກ່ອນ' }}
          errors={errors}

        />
        <Input
          label="ແຂວງ"
          name="province"
          type="text"
          placeholder="ແຂວງ"
          register={register}
          formOptions={{ required: 'ກະລຸນາປ້ອນແຂວງກ່ອນ' }}
          errors={errors}

        />

        <div className="mt-8 flex justify-end space-x-4 col-span-full px-4 py-4">
          <button
            className="px-6 py-2 text-md font-medium text-red-500"
            type="button"
            onClick={() => navigate('/manager/patient')}
          >
            ຍົກເລິກ
          </button>
          <Button variant="save" type="submit">
            ບັນທຶກ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPatient;
