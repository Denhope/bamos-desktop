import { DownOutlined, HomeOutlined } from "@ant-design/icons";
import { Space, Tree } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import { IOrder } from "@/models/IOrder";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as originalUuidv4 } from "uuid"; // Импортируйте библиотеку uuid
import {
  SettingOutlined,
  DollarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { handleFileSelect } from "@/services/utilites";

type ProjectDetailsFormType = {
  order: IOrder;
  onEditOrderDetailsEdit?: (data: any) => void;
  onSelectedPart: (id: any) => void;
  onSelectedPartVendor?: (record: any) => void;
};
type ColoredTextProps = {
  text: string;
  backgroundColor: string;
};

const ColoredText: React.FC<ColoredTextProps> = ({ text, backgroundColor }) => (
  <span style={{ color: backgroundColor }}>{text}</span>
);
const QuatationTree: React.FC<ProjectDetailsFormType> = React.memo(
  ({ order, onSelectedPartVendor, onSelectedPart }) => {
    // const [expandedKeys, setExpandedKeys] = useState<any>();

    const getAllKeys = (treeData: any[]) => {
      let keys: any[] = [];

      const traverse = (node: { key: any; children: any[] }) => {
        keys.push(node.key);
        if (node.children) {
          node.children.forEach(traverse);
        }
      };

      treeData.forEach(traverse);

      return keys;
    };
    const { t } = useTranslation();
    const uuidv4: () => string = originalUuidv4;
    let treeData: DataNode[] | undefined;

    let backgroundColor: string;
    if (order.state === "CLOSED") {
      backgroundColor = "#62d156";
    } else if (order.state === "OPEN") {
      backgroundColor = "red";
    } else if (order.state === "RECEIVED") {
      backgroundColor = "#62d156";
    } else if (order.state === "PARTLY_RECEIVED") {
      backgroundColor = "#f0be37";
    } else {
      backgroundColor = "#f0be37";
    }

    switch (order.orderType) {
      case "QUOTATION_ORDER":
        treeData = [
          {
            title: t("ORDERS"),
            key: "0-0-0",
            children: [
              {
                title: (
                  <div>
                    {`${t("ORDER NUMBER")}: `}
                    <ColoredText
                      text={order?.orderNumber || ""}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                ),

                key: uuidv4(),

                children:
                  order.parts &&
                  order?.parts.map((part, index) => {
                    return {
                      title: (
                        <div>
                          <SettingOutlined /> {`${t("POS")}:${index + 1} `}
                          <ColoredText
                            text={`${part?.PART_NUMBER || part?.PN}`}
                            backgroundColor={backgroundColor}
                          />
                          ({part?.DESCRIPTION || part?.nameOfMaterial}){" "}
                          {part?.QUANTITY || part?.quantity}/{" "}
                          {part?.UNIT_OF_MEASURE || part?.unit}
                        </div>
                      ),
                      key: part.id,
                      children: [
                        ...(part?.vendors?.map((vendor: any, index: any) => {
                          return {
                            title: (
                              <div className="flex gap-1">
                                <HomeOutlined />

                                {`${`VENDOR:  ${vendor.CODE}-${vendor.NAME}`}`}
                              </div>
                            ),
                            key: vendor.id,
                            children: [
                              {
                                title: `PART NUMBER:${vendor.partNumber}`,
                                key: uuidv4(),
                              },
                              {
                                title: `DESCRIPTION:${vendor.description}`,
                                key: uuidv4(),
                              },
                              {
                                title: (
                                  <div className="flex gap-1">
                                    <DollarOutlined />{" "}
                                    {`${
                                      `PURSHASE PRICE:${vendor.price}` || ""
                                    }`}
                                  </div>
                                ),
                                key: uuidv4(),
                              },
                              {
                                title: `CURRENCY:${vendor.currency}` || "",
                                key: uuidv4(),
                              },
                              {
                                title:
                                  `QUANTITY QUOTED:${vendor.quantity}` || "",
                                key: uuidv4(),
                              },
                              {
                                title: `DISCOUNT:${vendor.discount}`,
                                key: uuidv4(),
                              },
                              {
                                title: `CONDITION:${vendor.condition}`,
                                key: uuidv4(),
                              },
                              {
                                title: `${t("LEAD TIME")}:${vendor.leadTime}`,
                                key: uuidv4(),
                              },
                              {
                                title: (
                                  <span style={{ color: backgroundColor }}>
                                    {`${t("STATE")}: ${order?.state}`}
                                  </span>
                                ),
                                key: uuidv4(),
                              },
                              {
                                title: `${t("FILES")}:`,
                                key: uuidv4(),
                                children: [
                                  ...(vendor?.files?.map(
                                    (file: any, index: any) => {
                                      return {
                                        title: (
                                          <div className="flex gap-1">
                                            <DownloadOutlined />
                                            {`FILE/${""}${index + 1}:${
                                              file.name
                                            }`}
                                          </div>
                                        ),
                                        key: file.id,
                                      };
                                    }
                                  ) || []),
                                ],
                              },
                            ],
                          };
                        }) || []),
                      ],
                    };
                  }),
              },
              {
                title: `${t("FILES")}:`,
                key: uuidv4(),
                children: [
                  ...(order?.files?.map((file: any, index: any) => {
                    return {
                      title: (
                        <div className="flex gap-1">
                          <DownloadOutlined />
                          {`FILE/${""}${index + 1}:${file.name}`}
                        </div>
                      ),
                      key: file.id,
                    };
                  }) || []),
                ],
              },
            ],
          },
        ];

        break;
      case "PURCHASE_ORDER":
        treeData = [
          {
            title: t("ORDERS"),
            key: "0-0-0",
            children: [
              {
                title: (
                  <div>
                    {`${t("ORDER NUMBER")}: `}
                    <ColoredText
                      text={order?.orderNumber || ""}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                ),
                key: uuidv4(),

                children: [
                  {
                    title: (
                      <div>
                        {`${t("STATE")}: `}
                        <ColoredText
                          text={order?.state || ""}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    ),
                    key: uuidv4(),
                  },
                  {
                    title: `${t("VENDOR")}:`,
                    key: uuidv4(),
                    children: [
                      {
                        title: `NAME:${
                          order?.vendors && order?.vendors[0].supplier
                        }`,
                        key: uuidv4(),
                      },
                      {
                        title: `ADRESS:${
                          order?.vendors && order?.vendors[0].adress
                        }`,
                        key: uuidv4(),
                      },
                      {
                        title: `SHIP TO:${
                          order?.vendors && order?.vendors[0].shipTo
                        }`,
                        key: uuidv4(),
                      },
                      {
                        title: `PLANED DATE
                      :${order?.vendors && order?.vendors[0].planedDate}`,
                        key: uuidv4(),
                      },
                    ],
                  },
                  {
                    title: `${t("PARTS")}:`,
                    key: uuidv4(),
                    children:
                      order.parts &&
                      order?.parts.map((part, index) => {
                        return {
                          title: `POS${index + 1}: ${
                            part.PART_NUMBER || part.PN
                          }(${part.DESCRIPTION || part.nameOfMaterial}) `,
                          key: uuidv4(),
                          children: [
                            {
                              title: `QUANTITY:${
                                part.QUANTITY || part.quantity
                              } / ${part.UNIT_OF_MEASURE || part.unit}`,
                              key: uuidv4(),
                            },
                            {
                              title: `PURSHASE PRICE:${part.price}`,
                              key: uuidv4(),
                            },
                            {
                              title: `CURRENCY:${part.currency}`,
                              key: uuidv4(),
                            },

                            {
                              title: `CONDITION:${part.condition}`,
                              key: uuidv4(),
                            },
                            {
                              title: `${t("RECEIVING TIME")}:${part.leadTime}`,
                              key: uuidv4(),
                            },
                            {
                              title: (
                                <div>
                                  {`${t("STATE")}: `}
                                  <ColoredText
                                    text={part?.state || ""}
                                    backgroundColor={backgroundColor}
                                  />
                                </div>
                              ),
                              key: uuidv4(),
                            },
                          ],
                        };
                      }),
                  },
                ],
              },
            ],
          },
        ];
        break;

      default:
        treeData = [];
    }

    const onSelect = (selectedKeys: React.Key[], info: any) => {
      let title;
      if (typeof info.node.title === "string") {
        title = info.node.title;
      } else if (
        typeof info.node.title === "object" &&
        info.node.title.props.children
      ) {
        title = info.node.title.props.children.join("");
      }

      if (title) {
        title = title.replace(/\[object Object\]/g, "");
        if (title.includes(t("VENDOR:"))) {
          onSelectedPartVendor && onSelectedPartVendor(info.node.key);
        }
        if (title.includes(t("POS"))) {
          onSelectedPart && onSelectedPart(info.node.key);
        }
        if (title.includes(t("FILE/"))) {
          handleFileSelect({ id: info.node.key, name: title });
        }
      }
    };

    return (
      <Tree
        showLine
        switcherIcon={<DownOutlined />}
        height={500}
        defaultExpandAll
        onSelect={onSelect}
        treeData={treeData}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.order === nextProps.order;
  }
);

export default QuatationTree;
