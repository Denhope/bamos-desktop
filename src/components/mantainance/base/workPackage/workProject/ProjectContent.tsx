import TabContent from "@/components/shared/Table/TabContent";
import React, { FC, useEffect, useState } from "react";
import { IAplicationInfo } from "@/types/TypesData";
import FilteredTasksList from "../packageAplications/tasks/FilteredTasksList";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { AplicationResponce } from "@/store/reducers/WPGenerationSlise";
import { getAplicationByID } from "@/utils/api/thunks";
import InstrumentItems from "../packageAplications/instruments/InstrumentItems";
import InstrumentSum from "../packageAplications/instruments/InstrumentSum";

import MaterialSum from "../packageAplications/materials/MaterialSum";
import DataDisplay from "../packageAplications/tasks/Labor";
import UnFoundedItems from "../packageAplications/tasks/UnFoundedItems";
import TaskList from "./TaskList";
import MaterialItems from "./MaterialItems";
import RequirementItems from "./RequirementItems";

type AplicationContentProps = {
  project: any;
};
const ProjectContent: FC<AplicationContentProps> = ({ project }) => {
  const [currentAplication, setCurrentAplication] =
    useState<AplicationResponce>();

  const [result, setResult] = useState<any>();
  const handleResult = (result: any) => {
    // обрабатываем результат здесь
    setResult(result);
  };

  const dispatch = useAppDispatch();
  const { isLoading } = useTypedSelector((state) => state.planning);

  return (
    <div className=" mx-auto  h-full">
      <TabContent
        tabs={[
          {
            content: (
              <TaskList
                yscroll={41}
                projectID={project._id}
                projectData={project}
                onResult={(record) => {
                  handleResult(record);
                }}
              ></TaskList>
            ),
            title: "TASKS",
          },
          {
            content: result && (
              <TabContent
                tabs={[
                  {
                    content: (
                      <MaterialItems
                        data={result}
                        projectData={project}
                        scroll={"41"}
                        isLoading={isLoading}
                      ></MaterialItems>
                    ),
                    title: "MATERIALS ITEMS",
                  },
                  {
                    content: (
                      <MaterialSum
                        data={result}
                        scroll={"41"}
                        isLoading={isLoading}
                      ></MaterialSum>
                    ),
                    title: "SUM MATERIALS",
                  },
                  {
                    content: (
                      <RequirementItems
                        data={result}
                        scroll={35}
                        isLoading={isLoading}
                        projectData={project}
                      ></RequirementItems>
                    ),
                    title: "REQUIREMENTS",
                  },
                ]}
              />
            ),
            title: "MATERIALS",
          },
          {
            content: result && (
              <TabContent
                tabs={[
                  {
                    content: result && (
                      <InstrumentItems
                        data={result}
                        scroll={"47"}
                        isLoading={isLoading}
                      ></InstrumentItems>
                    ),
                    title: "Instrument Items",
                  },
                  {
                    content: (
                      <InstrumentSum
                        data={result}
                        scroll={"56"}
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
        ]}
      />
    </div>
  );
};

export default ProjectContent;
