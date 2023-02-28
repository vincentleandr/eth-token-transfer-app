import { ReactElement } from 'react';
import { Button, Typography } from '@mui/material';
import classNames from 'classnames';

interface ButtonProps {
  buttonContent: string | ReactElement;
  onClick?: (param: any) => void;
  variant: 'primary' | 'secondary' | 'theme' | 'icon';
  disabled?: boolean;
  id?: string;
  popUpId?: string;
  withPopUp?: boolean;
  openPopUp?: boolean;
  startIcon?: ReactElement;
  href?: string;
  fullWidth?: boolean;
};

export const CustomButton = (props: ButtonProps) => {
  const {
    buttonContent,
    onClick,
    variant,
    disabled,
    id,
    popUpId,
    withPopUp,
    openPopUp,
    startIcon,
    href,
    fullWidth
  } = props;

  const buttonClassNames = classNames({
    'button-primary': variant === 'primary',
    'button-secondary': variant === 'secondary' || variant === 'theme',
    'button-theme': variant === 'theme',
    'button-icon': variant === 'icon'
  }, 'button-base');

  let buttonContentToDisplay;

  if (typeof buttonContent === 'string') {
    buttonContentToDisplay = (
      <Typography>{buttonContent}</Typography>
    );
  } else {
    buttonContentToDisplay = buttonContent;
  }

  return (
    <Button
      className={buttonClassNames}
      onClick={onClick}
      disableRipple
      disabled={disabled}
      id={id}
      aria-controls={openPopUp ? popUpId : undefined}
      aria-haspopup={withPopUp}
      aria-expanded={openPopUp}
      startIcon={startIcon}
      href={href}
      target={href && '_blank'}
      component={href ? 'a' : 'button'}
      fullWidth={fullWidth}
    >
      {buttonContentToDisplay}
    </Button>
  );
};