'use client';

import React, { ComponentProps } from 'react';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { TextFieldProps } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface TimePickerProps {
  label: string;
  value: string | null;
  onChange: (newValue: string) => void;
}

type MTProps = ComponentProps<typeof MobileTimePicker>;

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange }) => {
  const timeValue: Dayjs | null = value ? dayjs(value, 'HH:mm') : null;

  const handleChange: MTProps['onChange'] = (newValue) => {
  if (newValue && dayjs.isDayjs(newValue)) {
    const formatted = newValue.format('HH:mm');
    console.log('Hora seleccionada:', formatted);
    onChange(formatted);
  }
};

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileTimePicker
        label={label}
        value={timeValue}
        onChange={handleChange}
        ampm={false}
        slotProps={{
          textField: { fullWidth: true } as TextFieldProps,
        }}
      />
    </LocalizationProvider>
  );
};

export default TimePicker;
