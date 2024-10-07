// @ts-nocheck
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Select } from 'antd';
import { ICellEditorParams, ICellEditor } from 'ag-grid-community';

const { Option } = Select;

interface ILocation {
  id: string;
  ownerID: {
    _id: string;
    companyName: string;
    adress: string;
    contacts: string;
    country: string;
    description: string;
    email: string;
    planes: any[];
    title: string;
    files: any[];
    FILES: { id: string; name: string }[];
    emailBamosSupport: string;
    emailBamosSupportPass: string;
  };
  locationType: string;
  storeID: string;
  locationName: string;
  createDate: string;
  companyID: string;
  restrictionID: string;
  createUserID: {
    _id: string;
    singNumber: string;
    name: string;
  };
  files: any[];
  description: string;
  updateDate: string;
  updateUserID: {
    _id: string;
    name: string;
    singNumber: string;
  };
}

interface LocationEditorProps extends ICellEditorParams {
  options: ILocation[]; // Ensure this prop is passed correctly
}

const LocationEditor = forwardRef<ICellEditor, LocationEditorProps>(
  (props, ref) => {
    const [searchTerm, setSearchTerm] = useState<string>(props.value || '');
    const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(
      null
    );
    const eInput = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return selectedLocation ? selectedLocation.locationName : searchTerm;
      },
      isPopup: () => true,
      afterGuiAttached: () => {
        setTimeout(() => eInput.current?.focus(), 0);
      },
    }));

    useEffect(() => {
      if (props.node && selectedLocation) {
        const updatedData = {
          ...props.node.data,
          locationName: selectedLocation?.locationName,
          description: selectedLocation?.description,
          LOCATION_TO: selectedLocation?.locationName,
          locationToId: selectedLocation?.id,

          // Add other fields as needed
        };
        props.node.setData(updatedData);
        props.api.refreshCells({ rowNodes: [props.node], force: true });
      }
    }, [selectedLocation, props]);

    const handleSelectChange = (value: string) => {
      const location = props.options.find((opt) => opt.locationToId === value);
      setSearchTerm(value);
      setSelectedLocation(location || null);
    };

    return (
      <Select
        size="middle"
        showSearch
        ref={eInput}
        value={searchTerm}
        onChange={handleSelectChange}
        style={{ width: '100%' }}
        placeholder="Выберите локацию"
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {(props.options || []).map((option) => (
          <Option key={option.id} value={option.locationName}>
            {option.locationName}
          </Option>

          //   <Option key={option.value} value={option.value}>
          //   {option.label}
          // </Option>
        ))}
      </Select>
    );
  }
);

export default LocationEditor;
