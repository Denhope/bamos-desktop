import { Modal } from 'antd';
import React, { FC, useState } from 'react';
interface PickSlicpPrintModalProps {
  setOpen: (value: boolean) => {};
}
const PickSlicpPrintModal: FC<PickSlicpPrintModalProps> = ({ setOpen }) => {
  return (
    <Modal
      okButtonProps={{}}
      title="Печать расходного требования"
      centered
      // open={open}
      cancelText="отмена"
      okType={'default'}
      okText="Закрыть "
      onOk={async () => {}}
      width={'60%'}
      onCancel={() => setOpen(false)}
      footer={null}
    ></Modal>
  );
};

export default PickSlicpPrintModal;
