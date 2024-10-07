import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Select } from 'antd';
import { IPartNumber } from '@/models/IUser';
import { ICellEditorParams, ICellEditor } from 'ag-grid-community';

const { Option } = Select;

interface AutoCompleteEditorProps extends ICellEditorParams {
  options: IPartNumber[]; // Ensure this prop is passed correctly
}

const AutoCompleteEditor = forwardRef<ICellEditor, AutoCompleteEditorProps>(
  (props, ref) => {
    const [searchTerm, setSearchTerm] = useState<string>(props.value || '');
    const [selectedPart, setSelectedPart] = useState<IPartNumber | null>(null);
    const eInput = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return selectedPart ? selectedPart.PART_NUMBER : searchTerm;
      },
      isPopup: () => true,
      afterGuiAttached: () => {
        setTimeout(() => eInput.current?.focus(), 0);
      },
    }));

    useEffect(() => {
      if (props.node && selectedPart) {
        const updatedData = {
          ...props.node.data,
          // _id: selectedPart.id,
          PART_NUMBER: selectedPart.PART_NUMBER,
          DESCRIPTION: selectedPart.DESCRIPTION,
          GROUP: selectedPart.GROUP,
          TYPE: selectedPart.TYPE,
          UNIT_OF_MEASURE: selectedPart.UNIT_OF_MEASURE,
          partId: selectedPart._id,
          QUANTITY: selectedPart?.QUANTITY || selectedPart?.quantity || 0,
        };
        props.node.setData(updatedData);
        props.api.refreshCells({ rowNodes: [props.node], force: true });
      }
    }, [selectedPart, props]);

    const handleSelectChange = (value: string) => {
      const part = props.options.find((opt) => opt.PART_NUMBER === value);
      setSearchTerm(value);
      setSelectedPart(part || null);
    };

    return (
      <Select
        size="middle"
        showSearch
        ref={eInput}
        value={searchTerm}
        onChange={handleSelectChange}
        style={{ width: '100%' }}
        placeholder="Выберите PART_NUMBER"
      >
        {(props.options || []).map((option) => (
          <Option key={option.PART_NUMBER} value={option.PART_NUMBER}>
            {option?.PART_NUMBER}
          </Option>
        ))}
      </Select>
    );
  }
);

export default AutoCompleteEditor;
