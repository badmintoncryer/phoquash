import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TravelRecordCard } from "./TravelRecordCard";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Example/TravelRecordCard",
  component: TravelRecordCard,
} as ComponentMeta<typeof TravelRecordCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TravelRecordCard> = (args) => (
  <TravelRecordCard {...args} />
);

export const TestCard = Template.bind({});
TestCard.args = {
  title: "test title",
  start: new Date(),
  end: new Date(),
};
