import React from 'react'
import { Button, Card, CardActions, CardHeader, CardMedia } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import IosShareIcon from '@mui/icons-material/IosShare'

export type TravelRecordCardProps = {
  title: string
  start: Date
  end: Date
}

const TravelRecordCard: React.FC<TravelRecordCardProps> = (props) => {
  const period = `${props.start.toLocaleDateString()} - ${props.end.toLocaleDateString()}`
  return (
    <Card raised={true}>
      <CardHeader title={props.title} subheader={period} />
      <CardMedia
        component="img"
        height="140"
        image="https://user-images.githubusercontent.com/64848616/172041210-2901aeb3-dcbf-423d-9ab8-eb311a4e3202.JPG"
        alt={props.title}
      />
      <CardActions>
        <Button size="small" startIcon={<IosShareIcon />}>
          Share
        </Button>
        <Button size="small" color="secondary" startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

export default TravelRecordCard
