// import Account from '@/pages/Admin';
import SignIn from '@/pages/Authentication/SignIn';
import NotFound from '@/pages/NotFound';

import PatientPage from '@/pages/Manager/Patient';
import ServcicePage from '@/pages/Manager/ServiceList';
import SupplierPage from '@/pages/Manager/Supplier';
import DetailPatient from '@/pages/Manager/Patient/detail';
import DiseasePage from '@/pages/Manager/Disease';
import CreateFollow from '@/pages/Follow/create';
import Order from '@/pages/Order';
import Treatment from '@/pages/Service/Treatment';


import ImportPage from '@/pages/im/import.tsx';
import MedicinesPage from '../pages/Manager/Medicines';
import ExchangePage from '../pages/Manager/Exchange';
import ReportAppointment from '../pages/report/ReportAppointment';
import EmployeePage from '../pages/Manager/Employee';
import CategoryPage from '../pages/Manager/Category';
import Dashboard from '../pages/Dashboard';
import FollowPage from '../pages/Follow';
import ReportMed from '../pages/report/ReportMed';
import ReportPay from '../pages/report/ReportPayment';
import ReportPer from '../pages/report/ReportPer';
import ReportImport from '../pages/report/ReportImport';
import ReportOrder from '../pages/report/ReportOrder';
import DetailPatientService from '../pages/Service/Detail';
import PackectDetail from '../pages/Manager/PackectDetail';
import InvoicePage from '../pages/Invoice';
import PaymentPage from '../pages/Payment';
import ReportFollowAll from '../pages/report/ReportFollow';
import DetailFollow from '../pages/report/ReportFollow/detail';
import EditTreatment from '../pages/Service/Detail/EditTreatment';

export const ROUTES = [
  {
    path: '/dashboard',
    title: 'CPS Admin',
    component: <Dashboard />,
  },

  
  {
    path: '/login',
    title: 'Signin | CPS Admin',
    component: <SignIn />,
  },
  //  -------------------------- Patient Path --------------------------------
  {
    path: '/manager/patient',
    title: 'Patient List| CPS Admin',
    component: <PatientPage />,
  },
 
  {
    path: '/patient/detail/:id',
    title: 'Patient Detail | CPS Admin',
    component: <DetailPatient />,
  },
  //  -------------------------- Employee Path --------------------------------
  {
    path: '/manager/employee',
    title: 'Employee| CPS Admin',
    component: <EmployeePage />,
  },
  //  -------------------------- Category Path --------------------------------
  {
    path: '/manager/category',
    title: 'Category | CPS Admin',
    component: <CategoryPage />,
  },

  //  -------------------------- Medicines Path --------------------------------
  {
    path: '/manager/medicines',
    title: 'Medicines | CPS Admin',
    component: <MedicinesPage />,
  },

  // -------------------------- EquipmentPage Path --------------------------------
  // {
  //   path: '/manager/equipment',
  //   title: 'Equipment | CPS Admin',
  //   component: <EquipmentPage />,
  // },
  // -------------------------- Service Path --------------------------------
  {
    path: '/manager/servicelist',
    title: 'Service List | CPS Admin',
    component: <ServcicePage />,
  },
  // -------------------------- Packet Path --------------------------------
  {
    path: '/manager/packetdetail',
    title: 'Packet Detail | CPS Admin',
    component: <PackectDetail />,
  },


  // -------------------------- Exchange Path --------------------------------
  {
    path: '/manager/exchange',
    title: 'Exchange | CPS Admin',
    component: <ExchangePage />,
  },
  // -------------------------- OralPage Path --------------------------------
  {
    path: '/manager/disease',
    title: 'Disease | CPS Admin',
    component: <DiseasePage />,
  },
  // -------------------------- SupplierPage Path --------------------------------
  {
    path: '/manager/supplier',
    title: 'Supplier | CPS Admin',
    component: <SupplierPage />,
  },
  // -------------------------- ServicePatient Path --------------------------------
  {
    path: '/treatment-service',
    title: 'Service Treatment Create | CPS Admin',
    component: <Treatment />,
  },

  {
    path: '/invoice',
    title: 'invoice | CPS Admin',
    component: <InvoicePage />,
  },
  {
    path: '/list-pay',
    title: 'Payment | CPS Admin',
    component: <PaymentPage />,
  },
  {
    path: '/list-detail',
    title: 'DetailPatientService | CPS Admin',
    component: <DetailPatientService />,
  },
    {
    path: '/list-detail/edit-treatment/:id',
    title: 'Service Treatment Create | CPS Admin',
    component: <EditTreatment />,
  },
  // ---------------------------
  {
    path: '/perorder',
    title: 'Order | CPS Admin',
    component: <Order />,
  },
  {
    path: '/importorder',
    title: 'Import | CPS Admin',
    component: <ImportPage />,
  },
  // -------------------------- Follow Path --------------------------------
  {
    path: '/followpat',
    title: 'Follow | CPS Admin',
    component: <FollowPage />,
  },
  {
    path: '/follow/create',
    title: 'Follow Create | CPS Admin',
    component: <CreateFollow />,
  },

  //------------------------------- Report

  
  {
    path: '/report/follow-inspection',
    title: 'Report Follow | CPS Admin',
    component: <ReportFollowAll />,
  },
    {
    path: '/follow-inspection/detail/:id',
    title: 'Follow Detail | CPS Admin',
    component: <DetailFollow />,
  },
  {
    path: '/report/appointment',
    title: 'Report Appointment | CPS Admin',
    component: <ReportAppointment />,
  },
  {
    path: '/report/medicines',
    title: 'Report Medicines | CPS Admin',
    component: <ReportMed />,
  },
  {
    path: '/report/payments',
    title: 'Report  Payment | CPS Admin',
    component: <ReportPay />,
  },

  {
    path: '/report/prescriptiondetail',
    title: 'Report  Prescription Detail | CPS Admin',
    component: <ReportPer />,
  },
  {
    path: '/report/import',
    title: 'Report Import | CPS Admin',
    component: <ReportImport />,
  },
 {
    path: '/report/preorder',
    title: 'Report Pre order | CPS Admin',
    component: <ReportOrder />,
  },

 
  // {  
  //   path: '/admin/account',
  //   title: 'Accounts | CPS Admin',
  //   component: <Account />,
  // },
  {
    path: '*',
    title: '404 Not Found',
    component: <NotFound />,
  },
];
