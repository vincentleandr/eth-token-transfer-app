import { useState, useEffect } from "react";
import Image from 'next/image'
import { Box, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import { CustomButton } from "../Button";
import { Theme } from "../../interface";

export const ButtonTheme = () => {
  const [theme, setTheme] = useState<Theme>('default');

  const isMobile = useMediaQuery('(max-width: 599px)');

  useEffect(() => {
    const presetTheme = localStorage.getItem('theme_selected') as Theme;
    const themeSelected = presetTheme || 'default';

    handleChangeTheme(themeSelected);
  }, []);

  const handleChangeTheme = (themeSelected?: Theme) => {
    const switchedTheme = theme === 'default' ? 'dark' : 'default';
    const themeToSetTo = themeSelected || switchedTheme;

    setTheme(themeToSetTo);
    document.documentElement.setAttribute('data-theme', themeToSetTo);
    localStorage.setItem('theme_selected', themeToSetTo);
  };

  const themeIsDefault = theme === 'default';
  const buttonText = themeIsDefault ? 'Light' : 'Dark';
  const buttonTextElement = !isMobile && (
    <Typography ml={'8px'}>{buttonText}</Typography>
  );

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
      {buttonTextElement}
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
