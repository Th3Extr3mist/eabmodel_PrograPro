'use client';

import React from 'react';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';

interface HoraPickerProps {
  label: string;
  value: string | null; // Hora en formato "HH:mm"
  onChange: (newValue: string) => void;
}

const HoraPicker: React.FC<HoraPickerProps> = ({ label, value, onChange }) => {
  return (
    <MobileTimePicker
      label={label}
      value={value ? dayjs(`2000-01-01T${value}`) : null} // fecha fija para evitar zonas
      onChange={(newValue) => {
        if (newValue) {
          const horaStr = newValue.format('HH:mm');
          onChange(horaStr); // devuelve "HH:mm"
        }
      }}
      ampm={false}
      renderInput={(params) => <TextField {...params} fullWidth />}
    />
  );
};

export default HoraPicker;
