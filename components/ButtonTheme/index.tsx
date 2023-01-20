import { useState, useEffect } from "react";
import Image from 'next/image'
import { Box, Typography } from '@mui/material';
import { CustomButton } from "../Button";

type theme = 'default' | 'dark';

export const ButtonTheme = () => {
  const [theme, setTheme] = useState<theme>('default');

  useEffect(() => {
    const presetTheme = localStorage.getItem('theme_selected') as theme;
    const themeSelected = presetTheme || 'default';

    handleChangeTheme(themeSelected);
  }, []);

  const handleChangeTheme = (themeSelected?: theme) => {
    const switchedTheme = theme === 'default' ? 'dark' : 'default';
    const themeToSetTo = themeSelected || switchedTheme;

    setTheme(themeToSetTo);
    document.documentElement.setAttribute('data-theme', themeToSetTo);
    localStorage.setItem('theme_selected', themeToSetTo);
  };

  const themeIsDefault = theme === 'default';
  const buttonText = themeIsDefault ? 'Light' : 'Dark';

  const buttonContent = (
    <Box
      display={'flex'}
      alignItems='center'
    >
      <Image
        src={`/icon-${buttonText.toLowerCase()}.svg`}
        alt={buttonText}
        width={24}
        height={24}
      />
      <Typography ml={'8px'}>{buttonText}</Typography>
    </Box>
  );

  return (
    <CustomButton
      buttonContent={buttonContent}
      onClick={() => handleChangeTheme()}
      variant='theme'
    />
  );
};
