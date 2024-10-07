import { Button } from 'antd';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface ButtomProps {
  item?: any | null;
}
const SubmitButton: FC<ButtomProps> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <Button type="primary" htmlType="submit">
      {item ? t('UPDATE') : t('CREATE')}
    </Button>
  );
};

export default SubmitButton;
