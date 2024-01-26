import TabContent from "@/components/shared/Table/TabContent";
import React, { FC, useEffect, useState } from "react";
import { IAplicationInfo } from "@/types/TypesData";
import DtoItemsList from "./DtoItemsList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { getAplicationByID } from "@/utils/api/thunks";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import FilteredTasksList from "./tasks/FilteredTasksList";
import Labor from "./tasks/Labor";
import UnFoundedItems from "./tasks/UnFoundedItems";
import MaterialItems from "./materials/MaterialItems";
import MaterialSum from "./materials/MaterialSum";
import DataDisplay from "./tasks/Labor";
import InstrumentItems from "./instruments/InstrumentItems";
import InstrumentSum from "./instruments/InstrumentSum";
type AplicationContentProps = {
  aplication: AplicationResponce;
};
const AplicationContent: FC<AplicationContentProps> = ({ aplication }) => {
  const [currentAplication, setCurrentAplication] =
    useState<AplicationResponce>();

  const [result, setResult] = useState<any>();
  const handleResult = (result: any) => {
    // обрабатываем результат здесь
    setResult(result);
  };

  const dispatch = useAppDispatch();
  const { isLoading } = useTypedSelector((state) => state.planning);
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem("companyID");

      if (companyID) {
        console.log(aplication);
        const result = await dispatch(
          getAplicationByID({
            companyID: companyID,
            aplicationID: aplication._id,
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          setCurrentAplication(result.payload);
        }
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className=" mx-auto  h-full">
      <TabContent
        tabs={[
          {
            content: (
              <DtoItemsList
                data={currentAplication?.tasks || []}
                aplicationName={currentAplication?.aplicationName || ""}
                isLoading={isLoading}
              ></DtoItemsList>
            ),
            title: "Aplication Items",
          },
          {
            content: currentAplication && (
              <TabContent
                tabs={[
                  {
                    content: currentAplication && (
                      <FilteredTasksList
                        data={currentAplication}
                        aplicationName={currentAplication.aplicationName}
                        scroll={""}
                        isLoading={isLoading}
                        onResult={handleResult}
                      ></FilteredTasksList>
                    ),
                    title: "Items",
                  },
                  {
                    content:
                      // <></>
                      result && (
                        <UnFoundedItems
                          data={result.notFoundTaskDTOs}
                          aplicationName={currentAplication.aplicationName}
                          isLoading={isLoading}
                        ></UnFoundedItems>
                      ),
                    title: "Not Founded Items",
                  },
                ]}
              />
            ),
            title: "TASKS",
          },
          {
            content: currentAplication && (
              <TabContent
                tabs={[
                  {
                    content: currentAplication && (
                      <MaterialItems
                        data={currentAplication}
                        scroll={"42"}
                        isLoading={isLoading}
                      ></MaterialItems>
                    ),
                    title: "MATERIALS ITEMS",
                  },
                  {
                    content: (
                      <MaterialSum
                        data={currentAplication}
                        scroll={"42"}
                        isLoading={isLoading}
                      ></MaterialSum>
                    ),
                    title: "SUM MATERIALS",
                  },
                ]}
              />
            ),
            title: "MATERIALS",
          },
          {
            content: currentAplication && (
              <TabContent
                tabs={[
                  {
                    content: currentAplication && (
                      <InstrumentItems
                        data={currentAplication}
                        scroll={"42"}
                        isLoading={isLoading}
                      ></InstrumentItems>
                    ),
                    title: "Instrument Items",
                  },
                  {
                    content: (
                      <InstrumentSum
                        data={currentAplication}
                        scroll={"42"}
                        isLoading={isLoading}
                      ></InstrumentSum>
                    ),
                    title: "Sum Instrument",
                  },
                ]}
              />
            ),
            title: "INSTRUMENT",
          },
          {
            content: result && (
              <DataDisplay
                foundCount={result.foundCount}
                notFoundCount={result.notFoundCount}
                totalTimeBySpecialization={result.totalTimeBySpecialization}
                totalTimeWithoutSpecialization={
                  result.totalTimeWithoutSpecialization
                }
                totalPrepareTimeBySpecialization={
                  result.totalPrepareTimeBySpecialization
                }
                totalMainWorkTimeBySpecialization={
                  result.totalMainWorkTimeBySpecialization
                }
                multipleMatches={result.multipleMatches}
              />
            ),
            title: "Report",
          },
        ]}
      />
    </div>
  );
};

export default AplicationContent;
