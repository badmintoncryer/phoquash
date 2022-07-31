import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TravelRecordCreateDialog } from "./TravelRecordCreateDialog";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Example/TravelRecordCreateDialog",
  component: TravelRecordCreateDialog,
} as ComponentMeta<typeof TravelRecordCreateDialog>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TravelRecordCreateDialog> = (args) => (
  <TravelRecordCreateDialog {...args} />
);

export const TestCard = Template.bind({});
TestCard.args = {
  open: true,
  onClose: () => {
    return;
  },
};
