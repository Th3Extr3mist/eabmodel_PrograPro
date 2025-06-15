'use client';

import React, { ComponentProps } from 'react';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { TextFieldProps } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface TimePickerProps {
  label: string;
  value: string | null;
  onChange: (newValue: string) => void;
}

type MTProps = ComponentProps<typeof MobileTimePicker>;

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange }) => {
  const timeValue: Dayjs | null = value ? dayjs(`2000-01-01T${value}`) : null;

  const handleChange: MTProps['onChange'] = (newValue) => {
    if (newValue && dayjs.isDayjs(newValue)) {
      onChange(newValue.format('HH:mm'));
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
