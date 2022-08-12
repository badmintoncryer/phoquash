import { Fab, styled } from '@mui/material'
import React from 'react'

type BottomRightFabProps = {
  ariaLabel?: string
  color?: 'primary' | 'secondary' | 'inherit'
  onClick?: () => void
  children: React.ReactNode
}

const BottomRightFab: React.FC<BottomRightFabProps> = (props) => {
  const BottomRightFab = styled(Fab)({
    position: 'fixed',
    bottom: '1rem',
    right: '1rem'
  })
  return (
    <BottomRightFab
      aria-label={props.ariaLabel}
      color={props.color}
      onClick={props.onClick}
    >
      {props.children}
    </BottomRightFab>
  )
}

export default BottomRightFab
