import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import AddIcon from '@mui/icons-material/Add'
import { BottomRightFab } from './BottomRightFab'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'UiParts/BottomRightFab',
  component: BottomRightFab
} as ComponentMeta<typeof BottomRightFab>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BottomRightFab> = (args) => (
  <BottomRightFab {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  children: <AddIcon />,
  color: 'primary',
  ariaLabel: 'Add'
}
