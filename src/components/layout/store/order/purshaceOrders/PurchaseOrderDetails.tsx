import { ModalForm, ProForm, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Modal, Row } from "antd";
import TabContent from "@/components/shared/Table/TabContent";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PartList from "./PartList";
import PartsForecast from "@/components/layout/APN/PartsForecast";

type PurchaseOrderCreateDetailsType = {
  onAddedData?: (record: any, rowIndex?: any) => void;
};
const PurchaseOrderCreateDetails: FC<PurchaseOrderCreateDetailsType> = ({
  onAddedData,
}) => {
  const [form] = Form.useForm();
  const [requariment, setRequariment] = useState<any | null>(null);
  const [openPickViewer, setOpenPickViewer] = useState<boolean>(false);
  const { t } = useTranslation();
  useEffect(() => {
    if (requariment) {
      form.setFields([
        { name: "requariment", value: requariment.partRequestNumber },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [requariment]);
  return (
    <div>
      <TabContent
        tabs={[
          {
            content: (
              <div className="bg-white px-4 py-3 rounded-md border-gray-400">
                <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
                  <Col xs={2} sm={3}>
                    <ProForm
                      form={form}
                      submitter={false}
                      // submitter={{
                      //   searchConfig: { submitText: t('ADD') },
                      // }}
                    >
                      <ProFormText
                        name="requariment"
                        label={t("REQUIREMENT No")}
                        width="sm"
                        tooltip={t("REQUIREMENTS NUMBER")}
                        fieldProps={{
                          onDoubleClick: () => setOpenPickViewer(true),

                          autoFocus: true,
                        }}
                      ></ProFormText>
                    </ProForm>
                  </Col>
                  <Col xs={32} sm={21}>
                    <PartList
                      onAddedData={onAddedData}
                      addedParts={requariment}
                      scroll={25}
                    ></PartList>
                  </Col>
                </Row>
              </div>
            ),
            title: `${t("PARTS LIST")}`,
          },
        ]}
      ></TabContent>
      <ModalForm
        title=""
        open={openPickViewer}
        width={"90%"}
        onOpenChange={setOpenPickViewer}
      >
        <div className="h-[78vh]  overflow-hidden">
          <PartsForecast
            onDoubleClick={(record) => {
              setRequariment(record);
              setOpenPickViewer(false);
            }}
          ></PartsForecast>
          {/* <PickSlipViwer onSingleRowClick={setPickNumber}></PickSlipViwer> */}
        </div>
      </ModalForm>
    </div>
  );
};

export default PurchaseOrderCreateDetails;
